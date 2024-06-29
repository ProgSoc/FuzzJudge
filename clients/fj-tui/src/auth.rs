#[derive(Debug, Clone, Default)]
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
        let raw = format!("{}:{}", self.username, self.password);
        let encoded = base64::Engine::encode(&base64::engine::general_purpose::STANDARD, raw);
        format!("Basic {}", encoded)
    }
}
