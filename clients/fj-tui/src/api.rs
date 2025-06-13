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
use chrono::Utc;
use graphql_client::{GraphQLQuery, Response};
use graphql_ws_client::graphql::StreamingOperation;
use reqwest::header::HeaderValue;
use std::{path::PathBuf, sync::Arc};
use tokio_tungstenite::tungstenite::client::IntoClientRequest;

type DateTime = chrono::DateTime<Utc>;

pub struct Session {
    pub creds: Credentials,
    pub server: Url,
    pub client: reqwest::Client,
}

use async_recursion::async_recursion;
use futures_util::StreamExt;
use url::Url;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "../../server/src/schema/schema.generated.graphqls",
    query_path = "src/queries/ProblemQuery.gql"
)]
pub struct ProblemQuery;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "../../server/src/schema/schema.generated.graphqls",
    query_path = "src/queries/ProblemsQuery.gql"
)]
pub struct ProblemsQuery;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "../../server/src/schema/schema.generated.graphqls",
    query_path = "src/queries/ClockSubscription.gql"
)]
pub struct ClockSubscription;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "../../server/src/schema/schema.generated.graphqls",
    query_path = "src/queries/CurrentUserQuery.gql"
)]
pub struct CurrentUserQuery;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "../../server/src/schema/schema.generated.graphqls",
    query_path = "src/queries/JudgeProblemMutation.gql"
)]
pub struct JudgeProblemMutation;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "../../server/src/schema/schema.generated.graphqls",
    query_path = "src/queries/Login.gql"
)]
pub struct Login;

impl Session {
    #[async_recursion]
    pub async fn new(server: String, creds: Credentials) -> Result<Self, String> {
        println!("Connecting to server: {}...", server);

        let server = Url::parse(&server).map_err(|e| e.to_string())?;
        if server.scheme() != "http" && server.scheme() != "https" {
            return Err("Server URL must start with http:// or https://".to_string());
        }

        let req_body = Login::build_query(login::Variables {
            username: creds.username.clone(),
            password: creds.password.clone(),
        });

        let client = reqwest::Client::builder()
            .cookie_store(true) // Enable cookie store to handle sessions
            .user_agent("FJ-Tui")
            .build()
            .map_err(|e| e.to_string())?;

        let res = client
            .post(server.join("/graphql").expect("Invalid GraphQL URL"))
            .json(&req_body)
            .send()
            .await
            .map_err(|e| e.to_string());

        if let Err(e) = res.as_ref() {
            if e.to_string().contains("401") {
                return Err("Invalid credentials. Refused by server.".to_string());
            }
        }

        let res_body: Response<login::ResponseData> = res
            .map_err(|e| e.to_string())?
            .json()
            .await
            .map_err(|e| e.to_string())?;

        if let Some(errors) = res_body.errors {
            let error_messages: Vec<String> = errors.into_iter().map(|e| e.message).collect();
            return Err(format!("GraphQL errors: {:?}", error_messages));
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

    pub async fn fuzz(&self, slug: String) -> Result<Option<String>, String> {
        let url = self.server.join("/graphql").expect("Invalid GraphQL URL");
        let req_body = ProblemQuery::build_query(problem_query::Variables { slug });
        let response = self
            .client
            .post(url)
            .json(&req_body)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let response_body: Response<problem_query::ResponseData> =
            response.json().await.map_err(|e| e.to_string())?;

        if let Some(errors) = response_body.errors {
            let error_messages: Vec<String> = errors.into_iter().map(|e| e.message).collect();
            return Err(format!("GraphQL errors: {:?}", error_messages));
        }
        let data = response_body.data.ok_or("No data in response")?;

        Ok(data.problem.fuzz)
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

        let url = self.server.join("/graphql").expect("Invalid GraphQL URL");

        let req_body = judge_problem_mutation::Variables {
            slug,
            output,
            code: source,
        };

        let req_body = JudgeProblemMutation::build_query(req_body);
        let response = self
            .client
            .post(url)
            .json(&req_body)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let response_body: Response<judge_problem_mutation::ResponseData> =
            response.json().await.map_err(|e| e.to_string())?;

        if let Some(errors) = response_body.errors {
            let error_messages: Vec<String> = errors.into_iter().map(|e| e.message).collect();
            return Err(format!("GraphQL errors: {:?}", error_messages));
        }

        let response_data = response_body.data.ok_or("No data in response")?;

        match response_data.judge {
            judge_problem_mutation::JudgeProblemMutationJudge::JudgeErrorOutput(e) => {
                // Error and Messages
                return Err(format!("Message: {}, Errors: {}", e.message, e.errors));
            }
            judge_problem_mutation::JudgeProblemMutationJudge::JudgeSuccessOutput(s) => {
                return Ok(s.message)
            }
        };
    }

    pub async fn fetch_all_problems(&self) -> Result<Vec<Problem>, String> {
        let req_body = ProblemsQuery::build_query(problems_query::Variables {});
        let res = self
            .client
            .post(self.server.join("/graphql").expect("Invalid GraphQL URL"))
            .json(&req_body)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let response_body: Response<problems_query::ResponseData> =
            res.json().await.map_err(|e| e.to_string())?;

        if let Some(errors) = response_body.errors {
            let error_messages: Vec<String> = errors.into_iter().map(|e| e.message).collect();
            return Err(format!("GraphQL errors: {:?}", error_messages));
        }

        let data = response_body.data.ok_or("No data in response")?;

        let problems: Vec<Problem> = data
            .problems
            .into_iter()
            .map(|p| Problem {
                slug: p.slug,
                title: p.name,
                icon: p.icon,
                difficulty: p.difficulty,
                points: p.points,
                instructions: p.instructions,
            })
            .collect();

        Ok(problems)
    }
}

pub async fn connect_to_web_socket(server: &str, app_state: Arc<tokio::sync::Mutex<AppState>>) {
    use graphql_ws_client::Client;

    let mut request = server
        .into_client_request()
        .expect("Failed to create WebSocket request");
    request.headers_mut().insert(
        "Sec-WebSocket-Protocol",
        HeaderValue::from_str("graphql-transport-ws")
            .expect("Failed to set WebSocket protocol header"),
    );

    let (connection, _) = async_tungstenite::tokio::connect_async(request)
        .await
        .expect("Failed to connect to WebSocket");

    let mut clock_subscription = Client::build(connection)
        .subscribe(StreamingOperation::<ClockSubscription>::new(
            clock_subscription::Variables,
        ))
        .await
        .expect("Failed to subscribe to clock updates");

    while let Some(item) = clock_subscription.next().await {
        match item {
            Ok(message) => {
                if let Some(clock_state) = message.data {
                    app_state.lock().await.clock = Some(Clock {
                        start: clock_state.clock.start,
                        finish: clock_state.clock.finish,
                    })
                }
            }
            _ => {}
        }
    }
}
