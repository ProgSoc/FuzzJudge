use crate::{auth::Credentials, clock::Clock, state::AppState};
use std::{
    error::Error,
    sync::{Arc, Mutex},
    time::Instant,
};

pub struct Session {
    pub creds: Credentials,
    pub logged_in: bool,
    pub server: String,
    client: reqwest::Client,
}

use futures_util::{future, pin_mut, StreamExt};
use tokio_tungstenite::{connect_async, tungstenite::protocol::Message};

impl Session {
    pub fn new(server: String, creds: Credentials) -> Self {
        Self {
            server,
            creds,
            logged_in: false,
            client: reqwest::Client::new(),
        }
    }

    pub async fn fuzz(&self, slug: String) -> Result<String, String> {
        let response = self
            .client
            .get(&format!("{}/comp/prob/{}/fuzz", self.server, slug))
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
        source: String,
    ) -> Result<String, Box<dyn Error>> {
        todo!("proper body format");

        let response = self
            .client
            .post(&format!("{}/comp/prob/{}/judge", self.server, slug))
            .header("Authorization", self.creds.auth_header_value())
            .body(format!("output={}&source={}", output, source))
            .send()
            .await?
            .text()
            .await?;

        Ok(response)
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
            let data = message.unwrap().into_data();
            let text = String::from_utf8_lossy(&data).to_string();
            let json: serde_json::Value = serde_json::from_str(&text).unwrap();

            if let Some(kind) = json.get("kind") {
                match kind.as_str().unwrap() {
                    "clock" => {
                        let value: serde_json::Value = json["value"].clone();

                        let start: String = value["start"].as_str().unwrap().to_string();
                        let finish: String = value["finish"].as_str().unwrap().to_string();

                        let start = chrono::DateTime::parse_from_rfc3339(&start)
                            .unwrap()
                            .to_utc();
                        let finish = chrono::DateTime::parse_from_rfc3339(&finish)
                            .unwrap()
                            .to_utc();

                        // let hold = value["hold"].as_str().unwrap().to_string();

                        app_state.lock().await.clock = Some(Clock { start, finish });
                    }
                    "scoreboard" => {}
                    "problems" => {}
                    _ => {
                        panic!(
                            "Unknown web-socket message kind: {}",
                            kind.as_str().unwrap()
                        )
                    }
                }
            }
        })
    };

    pin_mut!(outgoing, on_msg);
    future::select(outgoing, on_msg).await;
}
