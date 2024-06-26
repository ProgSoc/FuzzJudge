use reqwest::Client;

use crate::auth::{self, Credentials};

#[derive(Debug, Default)]
pub struct Problem {
    pub slug: String,
    pub title: String,
    pub icon: String,
    pub difficulty: i32,
    pub points: i32,
    pub instructions: String,
}

impl Problem {
    pub async fn fetch_all(
        server: &String,
        creds: &Credentials,
    ) -> Result<Vec<Self>, Box<dyn std::error::Error>> {
        let client = reqwest::Client::new();

        let slugs = client
            .get(&format!("{server}/comp/prob"))
            .header("Authorization", creds.auth_header_value())
            .send()
            .await?
            .text()
            .await?;

        let mut problems = Vec::new();
        for slug in slugs.lines() {
            problems.push(Self::fetch(slug, server, &creds, &client).await?);
        }

        Ok(problems)
    }

    async fn fetch(
        slug: &str,
        server: &String,
        creds: &Credentials,
        client: &Client,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let title = reqwest::get(&format!("{server}/comp/prob/{slug}/name"))
            .await?
            .text()
            .await?;

        let icon = reqwest::get(&format!("{server}/comp/prob/{slug}/icon"))
            .await?
            .text()
            .await?;

        let difficulty = reqwest::get(&format!("{server}/comp/prob/{slug}/difficulty"))
            .await?
            .text()
            .await?
            .parse()?;

        let points = reqwest::get(&format!("{server}/comp/prob/{slug}/points"))
            .await?
            .text()
            .await?
            .parse()?;

        let instructions = client
            .get(&format!("{server}/comp/prob/{slug}/instructions"))
            .header("Authorization", creds.auth_header_value())
            .send()
            .await?
            .text()
            .await?;

        Ok(Self {
            slug: slug.to_string(),
            title,
            icon,
            difficulty,
            points,
            instructions,
        })
    }
}
