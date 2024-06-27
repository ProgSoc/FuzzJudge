use crate::{auth::Credentials, clock::Clock, problem::Problem, state::AppState};
use std::{path::PathBuf, sync::Arc};

pub struct Session {
    pub creds: Credentials,
    pub server: Url,
    pub client: reqwest::Client,
}

use async_recursion::async_recursion;
use futures_util::{future, pin_mut, StreamExt};
use tokio_tungstenite::connect_async;
use url::Url;

impl Session {
    #[async_recursion]
    pub async fn new(server: String, creds: Credentials) -> Result<Self, String> {
        println!("Connecting to server: {}...", server);

        // This was checked earlier so we can unwrap.
        let server = Url::parse(&server).unwrap();
        let client = reqwest::Client::new();

        let auth = server.join("/auth").map_err(|e| e.to_string())?;
        let res = client
            .get(auth)
            .header("Authorization", creds.auth_header_value())
            .send()
            .await;

        let res = match res {
            Ok(res) => res,
            Err(e) => {
                if server.scheme() == "https" {
                    println!("Falling back to http...");
                    return Self::new(server.to_string().replacen("https", "http", 1), creds).await;
                }

                return Err(e.to_string());
            }
        };

        if res.status() == 401 {
            return Err("Invalid credentials. Refused by server.".to_string());
        }

        Ok(Self {
            server,
            creds,
            client,
        })
    }

    pub async fn fuzz(&self, slug: String) -> Result<String, String> {
        let url = self.server.join("/comp/prob/").unwrap();
        let url = url.join(&format!("{}/", &slug)).unwrap();
        let url = url.join("fuzz").unwrap();

        let response = self
            .client
            .get(url)
            .header("Authorization", self.creds.auth_header_value())
            .send()
            .await
            .map_err(|e| e.to_string())?
            .text()
            .await
            .map_err(|e| e.to_string())?;

        Ok(response)
    }

    pub async fn judge(
        &self,
        slug: String,
        output: String,
        source_path: PathBuf,
    ) -> Result<String, String> {
        let source = tokio::fs::read_to_string(source_path)
            .await
            .map_err(|e| e.to_string())?;

        let output = url::form_urlencoded::Serializer::new(output).finish();
        let source = url::form_urlencoded::Serializer::new(source).finish();

        let url = self.server.join("/comp/prob/").unwrap();
        let url = url.join(&format!("{}/", &slug)).unwrap();
        let url = url.join("judge").unwrap();

        let response = self
            .client
            .post(url)
            .header("Authorization", self.creds.auth_header_value())
            .header("Content-Type", "application/x-www-form-urlencoded")
            .body(format!("output={}&source={}", output, source))
            .send()
            .await
            .map_err(|e| e.to_string())?
            .text()
            .await
            .map_err(|e| e.to_string())?;

        Ok(response)
    }

    async fn fetch_problem(&self, slug: &str) -> Result<Problem, Box<dyn std::error::Error>> {
        let url = self.server.join("/comp/prob/").unwrap();
        let prob_url = url.join(&format!("{}/", &slug)).unwrap();

        // TODO: tokio::join! this
        let title = reqwest::get(prob_url.join("name").unwrap())
            .await?
            .text()
            .await?;

        let icon = reqwest::get(prob_url.join("icon").unwrap())
            .await?
            .text()
            .await?;

        let difficulty = reqwest::get(prob_url.join("difficulty").unwrap())
            .await?
            .text()
            .await?
            .parse()?;

        let points = reqwest::get(prob_url.join("points").unwrap())
            .await?
            .text()
            .await?
            .parse()?;

        let instructions = self
            .client
            .get(prob_url.join("instructions").unwrap())
            .header("Authorization", self.creds.auth_header_value())
            .send()
            .await?
            .text()
            .await?;

        Ok(Problem {
            slug: slug.to_string(),
            title,
            icon,
            difficulty,
            points,
            instructions,
        })
    }

    pub async fn fetch_all_problems(&self) -> Result<Vec<Problem>, String> {
        let client = reqwest::Client::new();

        let slugs = client
            .get(self.server.join("/comp/prob").unwrap())
            .header("Authorization", self.creds.auth_header_value())
            .send()
            .await
            .map_err(|e| e.to_string())?
            .text()
            .await
            .map_err(|e| e.to_string())?;

        let mut problems = Vec::new();

        tokio::join! {
            async {
                for slug in slugs.lines() {
                    problems.push(self.fetch_problem(slug).await.map_err(|e| e.to_string()));
                }
            }
        };

        problems.into_iter().collect::<Result<Vec<_>, _>>()
    }
}

pub async fn connect_to_web_socket(server: &str, app_state: Arc<tokio::sync::Mutex<AppState>>) {
    let (_rx, stdin_rx) = futures_channel::mpsc::unbounded();

    let (ws_stream, _) = connect_async(server).await.expect("Failed to connect");

    app_state
        .lock()
        .await
        .console
        .println("Connected to server");

    let (write, read) = ws_stream.split();

    let outgoing = stdin_rx.map(Ok).forward(write);
    let on_msg = {
        read.for_each(|message| async {
            let data = match message {
                Ok(data) => data.into_data(),
                Err(e) => {
                    app_state
                        .lock()
                        .await
                        .console
                        .println(&format!("Error: {}", e));
                    return;
                }
            };

            let text = String::from_utf8_lossy(&data).to_string();
            let res = handle_web_socket_message(&text, app_state.clone()).await;

            if let Err(e) = res {
                app_state
                    .lock()
                    .await
                    .console
                    .println(&format!("WebSocketError: {}", e));
            }
        })
    };

    pin_mut!(outgoing, on_msg);
    future::select(outgoing, on_msg).await;
}

async fn handle_web_socket_message(
    text: &str,
    app_state: Arc<tokio::sync::Mutex<AppState>>,
) -> Result<(), String> {
    let json: serde_json::Value = serde_json::from_str(text).map_err(|e| e.to_string())?;

    if let Some(kind) = json.get("kind") {
        match kind.as_str().ok_or("Expected `kind`")? {
            "clock" => {
                let value: serde_json::Value = json["value"].clone();

                let start: String = value["start"]
                    .as_str()
                    .ok_or("Expected `kind`")?
                    .to_string();
                let finish: String = value["finish"]
                    .as_str()
                    .ok_or("Expected `kind`")?
                    .to_string();

                let start = chrono::DateTime::parse_from_rfc3339(&start)
                    .map_err(|_| "Could not parse start time")?
                    .to_utc();
                let finish = chrono::DateTime::parse_from_rfc3339(&finish)
                    .map_err(|_| "Could not parse start time")?
                    .to_utc();

                // let hold = value["hold"].as_str().unwrap().to_string();

                app_state.lock().await.clock = Some(Clock { start, finish });
            }
            "scoreboard" => {}
            "problems" => {}
            _ => {
                app_state.lock().await.console.println(&format!(
                    "Unknown web-socket message kind: {}",
                    kind.as_str().unwrap()
                ));
            }
        }
    }

    Ok(())
}
