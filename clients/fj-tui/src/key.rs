use ratatui::crossterm::event::{KeyCode, KeyEvent};

use crate::{console, AppStateMutex};

#[derive(Default)]
pub struct KeyState {
    command_buffer: String,
}

pub fn handle_press(app_state: AppStateMutex, key: KeyEvent) {
    let typing = app_state.run_sync(|app_state| app_state.console.typing);

    if typing {
        handle_typing(app_state, key);
    } else {
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
                    app_state.instructions_scroll.offset(1);
                    app_state.key.command_buffer.clear();
                });
            }
            KeyCode::Up | KeyCode::Char('k') => {
                app_state.run_sync(|mut app_state| {
                    app_state.instructions_scroll.offset(-1);
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
            _ => {}
        };
    }
}

fn handle_typing(app_state: AppStateMutex, key: KeyEvent) {
    match key.code {
        KeyCode::Enter => {
            let mut cmd = String::new();

            app_state.run_sync(|mut app_state| {
                app_state.console.typing = false;

                cmd = app_state.console.command_buffer.clone();

                app_state.console.command_history.push(cmd.clone());
                app_state.console.messages.push(cmd.clone());

                app_state.console.command_buffer.clear();
            });

            console::exec(&cmd, app_state.clone());
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
            });
        }
        KeyCode::Char(c) => {
            app_state.run_sync(|mut app_state| {
                app_state.console.command_buffer.push(c);
            });
        }
        _ => {}
    }
}
