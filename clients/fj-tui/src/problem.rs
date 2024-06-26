use reqwest::Client;

use crate::{api::Session, auth::{self, Credentials}};

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
        sess: &Session,
    ) -> Result<Vec<Self>, Box<dyn std::error::Error>> {
        let client = reqwest::Client::new();

        let slugs = client
            .get(sess.server.join("/comp/prob").unwrap())
            .header("Authorization", sess.creds.auth_header_value())
            .send()
            .await?
            .text()
            .await?;

        let mut problems = Vec::new();
        for slug in slugs.lines() {
            problems.push(Self::fetch(slug, sess).await?);
        }

        Ok(problems)
    }

    async fn fetch(
        slug: &str,
        sess: &Session,
    ) -> Result<Self, Box<dyn std::error::Error>> {

        let url = sess.server.join("/comp/prob/").unwrap();
        let prob_url = url.join(&slug).unwrap();

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

        let instructions = sess.client
            .get(prob_url.join("instructions").unwrap())
            .header("Authorization", sess.creds.auth_header_value())
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
