use std::error::Error;

use crate::auth::Credentials;

pub struct Session {
    pub creds: Credentials,
    pub logged_in: bool,
    pub server: String,
    client: reqwest::Client,
}

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
