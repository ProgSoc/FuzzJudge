use std::sync::Arc;

use ratatui::crossterm::event::{KeyCode, KeyEvent};

use crate::{shell, state::AppState, AppStateMutex};

#[derive(Default)]
pub struct KeyState {
    command_buffer: String,
}

pub fn handle_press(app_state: AppStateMutex, key: KeyEvent) {
    let typing = app_state.run_sync(|app_state| app_state.console.typing);

    if typing {
        handle_typing(app_state, key);
        return;
    }

    let command_buffer = app_state.run_sync(|app_state| app_state.key.command_buffer.clone());

    let modifier = command_buffer
        .chars()
        .take_while(|c| c.is_numeric())
        .collect::<String>()
        .parse::<usize>()
        .ok();

    match key.code {
        KeyCode::Char(':') => {
            app_state.run_sync(|mut app_state| {
                app_state.console.typing = true;
                app_state.console.scroll.to_bottom();
                app_state.key.command_buffer.clear();
            });
        }
        KeyCode::Left | KeyCode::Char('h') => {
            app_state.run_sync(|mut app_state| {
                app_state.selected_problem_borrow_mut().select_previous();
                app_state.key.command_buffer.clear();
                app_state.key.command_buffer.clear();
            });
        }
        KeyCode::Right | KeyCode::Char('l') => {
            app_state.run_sync(|mut app_state| {
                if let Some(s) = app_state.selected_problem_borrow_mut().selected() {
                    if s < app_state.problems.len() - 1 {
                        app_state.selected_problem_borrow_mut().select_next();
                        app_state.key.command_buffer.clear();
                    }
                } else {
                    app_state.selected_problem_borrow_mut().select(Some(0));
                    app_state.key.command_buffer.clear();
                }
            });
        }
        KeyCode::Down | KeyCode::Char('j') => {
            app_state.run_sync(|mut app_state| {
                app_state
                    .instructions_scroll
                    .offset(modifier.unwrap_or(1) as i32);
                app_state.key.command_buffer.clear();
            });
        }
        KeyCode::Up | KeyCode::Char('k') => {
            app_state.run_sync(|mut app_state| {
                app_state
                    .instructions_scroll
                    .offset(-(modifier.unwrap_or(1) as i32));
                app_state.key.command_buffer.clear();
            });
        }
        KeyCode::Char('G') => {
            app_state.run_sync(|mut app_state| {
                if let Some(modifier) = modifier {
                    app_state.instructions_scroll.set_position(modifier);
                } else {
                    app_state.instructions_scroll.to_bottom();
                }

                app_state.key.command_buffer.clear();
            });
        }
        KeyCode::Char(c) => {
            if c.is_ascii_alphanumeric() {
                app_state.run_sync(|mut app_state| {
                    app_state.key.command_buffer.push(c);
                });
            }

            let command_buffer =
                app_state.run_sync(|app_state| app_state.key.command_buffer.clone());

            if command_buffer.chars().rev().take(2).collect::<String>() == "gg" {
                app_state.run_sync(|mut app_state| {
                    app_state.instructions_scroll.set_position(0);
                    app_state.key.command_buffer.clear();
                });
            }
        }
        KeyCode::PageUp => {
            app_state.run_sync(|mut app_state| {
                app_state.console.scroll.offset(-1);
                app_state.key.command_buffer.clear();
            });
        }
        KeyCode::PageDown => {
            app_state.run_sync(|mut app_state| {
                app_state.console.scroll.offset(1);
                app_state.key.command_buffer.clear();
            });
        }
        _ => {}
    };
}

async fn wrapped_exec(
    app_state: Arc<tokio::sync::Mutex<AppState>>,
    (cmd, env): (String, shell::Env),
) {
    shell::exec(
        &cmd,
        app_state.clone(),
        &shell::Output::ToConsole,
        None,
        &env,
    )
    .await;
}

fn handle_typing(app_state: AppStateMutex, key: KeyEvent) {
    match key.code {
        KeyCode::Enter => {
            let mut cmd = String::new();

            app_state.run_sync(|mut app_state| {
                app_state.console.typing = false;
                cmd = app_state.console.command_buffer.clone();

                let push_to_history = if let Some(last) = app_state.console.command_history.last() {
                    last != &cmd
                } else {
                    true
                };
                if push_to_history {
                    app_state.console.command_history.push(cmd.clone());
                }

                app_state.console.messages.push(cmd.clone());
                app_state.console.command_buffer.clear();
                app_state.console.commnand_history_index = 0;
                app_state.console.pre_history_command = None;
            });

            app_state.run_async(wrapped_exec, (cmd, shell::Env::default()));
        }
        KeyCode::Backspace => {
            app_state.run_sync(|mut app_state| {
                app_state.console.command_buffer.pop();
            });
        }
        KeyCode::Esc => {
            app_state.run_sync(|mut app_state| {
                app_state.console.typing = false;
                app_state.console.command_buffer.clear();
                app_state.console.commnand_history_index = 0;
                app_state.console.pre_history_command = None;
            });
        }
        KeyCode::Char(c) => {
            app_state.run_sync(|mut app_state| {
                app_state.console.command_buffer.push(c);
            });
        }
        KeyCode::Up => {
            app_state.run_sync(|mut app_state| {
                app_state.console.history_next();
            });
        }
        KeyCode::Down => {
            app_state.run_sync(|mut app_state| {
                app_state.console.history_previous();
            });
        }
        _ => {}
    }
}
