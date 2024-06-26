use std::sync::Arc;

use crate::{scroll::Scroll, AppState, AppStateMutex};

#[derive(Default)]
pub struct ConsoleState {
    pub messages: Vec<String>,
    pub command_buffer: String,
    pub command_history: Vec<String>,
    pub typing: bool,
    pub scroll: Scroll,
}

impl ConsoleState {
    pub fn println(&mut self, message: &str) {
        self.messages.push(message.to_string());
        self.scroll.set_content_length(self.line_count());
        self.scroll.to_bottom();
    }

    pub fn eprintln(&mut self, message: &str) {
        self.messages.push(format!("ERROR: {}", message));
    }

    pub fn line_count(&self) -> usize {
        self.messages
            .iter()
            .map(|s| s.lines().count())
            .sum::<usize>()
    }

    pub fn clear(&mut self) {
        self.messages.clear();
        self.scroll.set_content_length(0);
    }
}

async fn handle_fuzz(app_state: Arc<tokio::sync::Mutex<AppState>>, slug: String) {
    let response = app_state.lock().await.session.fuzz(slug).await;

    match response {
        Ok(response) => {
            app_state.lock().await.console.println(&response);
        }
        Err(e) => {
            app_state.lock().await.console.eprintln(&e);
        }
    }
}

pub fn exec(command: &str, app_state: AppStateMutex) {
    let mut parts = command.split_whitespace().filter(|s| !s.is_empty());
    let command = parts.next().unwrap_or_default();
    let args = parts.collect::<Vec<&str>>();

    match command {
        "help" => {
            todo!();
        }
        "f" | "fuzz" => {
            if args.is_empty() {
                app_state.println("Usage: fuzz <slug>");
                return;
            }

            app_state.run_async(handle_fuzz, args[0].to_string());
        }
        "j" | "judge" => {
            todo!();
        }
        "clear" => {
            app_state.run_sync(|mut state| state.console.clear());
        }
        "echo" => {
            app_state.println(&args.join(" "));
        }
        "cat" => {
            todo!();
        }
        "q" | "quit" | "exit" => {
            app_state.run_sync(|mut state| state.running = false);
        }
        _ => {
            app_state.println(&format!("Unknown command: {}", command));
        }
    }
}
