#[derive(Debug, Clone)]
pub struct Credentials {
    pub username: String,
    password: String,
}

impl Credentials {
    pub fn new(username: &str, password: &str) -> Self {
        Self {
            username: username.to_string(),
            password: password.to_string(),
        }
    }

    pub fn auth_header_value(&self) -> String {
        let encoded = base64::encode(&format!("{}:{}", self.username, self.password));
        format!("Basic {}", encoded)
    }
}
