/*
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with this program. If not, see <https://www.gnu.org/licenses/>.
 */

use crate::{auth::Credentials, clock::Clock, problem::Problem, state::AppState};
use std::{path::PathBuf, sync::Arc};

pub struct Session {
    pub creds: Credentials,
    pub server: Url,
    pub client: reqwest::Client,
}

use async_recursion::async_recursion;
use futures_util::{
    future::{self, join_all},
    pin_mut, StreamExt,
};
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

    /// For tests.
    #[allow(dead_code)]
    pub fn new_no_connection() -> Self {
        Self {
            server: Url::parse("http://localhost").unwrap(),
            creds: Credentials::default(),
            client: reqwest::Client::new(),
        }
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

    async fn fetch_problem(&self, slug: &str) -> Result<Problem, String> {
        let url = self.server.join("/comp/prob/").unwrap();
        let prob_url = url.join(&format!("{}/", &slug)).unwrap();

        let title = reqwest::get(prob_url.join("name").unwrap())
            .await
            .map_err(|e| e.to_string())?
            .text()
            .await
            .map_err(|e| e.to_string())?;

        let icon = reqwest::get(prob_url.join("icon").unwrap())
            .await
            .map_err(|e| e.to_string())?
            .text()
            .await
            .map_err(|e| e.to_string())?;

        let difficulty = reqwest::get(prob_url.join("difficulty").unwrap())
            .await
            .map_err(|e| e.to_string())?
            .text()
            .await
            .map_err(|e| e.to_string())?
            .parse()
            .map_err(|e: std::num::ParseIntError| e.to_string())?;

        let points = reqwest::get(prob_url.join("points").unwrap())
            .await
            .map_err(|e| e.to_string())?
            .text()
            .await
            .map_err(|e| e.to_string())?
            .parse()
            .map_err(|e: std::num::ParseIntError| e.to_string())?;

        let instructions = self
            .client
            .get(prob_url.join("instructions").unwrap())
            .header("Authorization", self.creds.auth_header_value())
            .send()
            .await
            .map_err(|e| e.to_string())?
            .text()
            .await
            .map_err(|e| e.to_string())?;

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

        let problems = join_all(
            slugs
                .lines()
                .map(|slug| self.fetch_problem(slug))
                .collect::<Vec<_>>(),
        )
        .await
        .into_iter()
        .collect::<Result<Vec<_>, _>>()?;

        Ok(problems)
    }
}

pub async fn connect_to_web_socket(server: &str, app_state: Arc<tokio::sync::Mutex<AppState>>) {
    let (_tx, rx) = futures_channel::mpsc::unbounded();

    let (ws_stream, _) = connect_async(server).await.expect("Failed to connect");

    app_state
        .lock()
        .await
        .console
        .println("Connected to server");

    let (write, read) = ws_stream.split();

    let send_msg = rx.map(Ok).forward(write);
    let on_msg = {
        read.for_each(|message| async {
            let data = match message {
                Ok(data) => data.into_data(),
                Err(e) => {
                    app_state.lock().await.console.eprintln(&e.to_string());
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

    pin_mut!(send_msg, on_msg);
    future::select(send_msg, on_msg).await;
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
                    .ok_or("Expected `start`")?
                    .to_string();
                let finish: String = value["finish"]
                    .as_str()
                    .ok_or("Expected `finish`")?
                    .to_string();

                let start = chrono::DateTime::parse_from_rfc3339(&start)
                    .map_err(|_| "Could not parse start time")?
                    .to_utc();
                let finish = chrono::DateTime::parse_from_rfc3339(&finish)
                    .map_err(|_| "Could not parse finish time")?
                    .to_utc();

                // let hold = value["hold"].as_str().unwrap().to_string();

                app_state.lock().await.clock = Some(Clock { start, finish });
            }
            "scoreboard" => {}
            "problems" => {}
            _ => {
                return Err(format!("Unknown message kind: {}", kind));
            }
        }
    }

    Ok(())
}
