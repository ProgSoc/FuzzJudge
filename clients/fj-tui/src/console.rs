use std::sync::Arc;

use crate::{scroll::Scroll, utils::clamp_zero, AppState, AppStateMutex};

#[derive(Default)]
pub struct ConsoleState {
    pub messages: Vec<String>,
    pub command_buffer: String,
    pub command_history: Vec<String>,
    pub typing: bool,
    pub scroll: Scroll,
    pub height: usize,
}

impl ConsoleState {
    pub fn println(&mut self, message: &str) {
        self.messages.push(message.to_string());
        self.scroll.set_content_length(self.line_count());
        self.scroll
            .set_position(clamp_zero(self.height as i32 - self.line_count() as i32  - 14) as usize);
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
            app_state.run_sync(|mut state| state.console.messages.clear());
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
