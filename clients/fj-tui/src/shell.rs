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

use std::{collections::HashMap, path::PathBuf, sync::Arc};

use async_recursion::async_recursion;
use tokio::{io::AsyncWriteExt, process::Command};

use crate::state::AppState;

pub type Env = HashMap<String, String>;

#[async_recursion]
pub async fn exec(
    command: &str,
    app_state: Arc<tokio::sync::Mutex<AppState>>,
    output_mode: OutputMode,
    piped_input: Option<String>,
    env: &Env,
) -> Output {
    let mut output = Output::new(output_mode, app_state.clone());

    if let Some((l, r)) = split_by_oper(command, ";", false) {
        exec(&l, app_state.clone(), output_mode, None, env).await;
        exec(&r, app_state.clone(), output_mode, None, env).await;
        return output;
    }

    if let Some((l, r)) = split_by_oper(command, "&", false) {
        tokio::join! {
            exec(&l, app_state.clone(), output_mode, None, env),
            exec(&r, app_state.clone(), output_mode, None, env)
        };
        return output;
    }

    if let Some((l, r)) = split_by_oper(command, "&&", false) {
        let l_output = exec(&l, app_state.clone(), output_mode, None, env).await;
        if l_output.status == 0 {
            let r_output = exec(&r, app_state.clone(), output_mode, None, env).await;
            return r_output;
        } else {
            return l_output;
        }
    }

    if let Some((l, r)) = split_by_oper(command, "|", true) {
        app_state
            .lock()
            .await
            .console
            .println(&format!("running piped {command}"));

        let l_output = exec(&l, app_state.clone(), OutputMode::Piped, None, env).await;
        let r_output = exec(
            &r,
            app_state.clone(),
            output_mode,
            Some(l_output.stdout),
            env,
        )
        .await;
        return r_output;
    }

    if let Some((l, r)) = split_by_oper(command, ">", true) {
        let l_output = exec(&l, app_state.clone(), OutputMode::Piped, None, env).await;

        write_file(
            app_state.clone(),
            (
                PathBuf::from(process_arg(&r, app_state.clone(), env).await),
                l_output.stdout.clone(),
            ),
        )
        .await;

        return output;
    }

    let words = tokenize(command);
    let command = words.clone().into_iter().next().unwrap_or_default();
    let mut args = words.into_iter().skip(1).collect::<Vec<String>>();

    for arg in args.iter_mut() {
        *arg = process_arg(arg, app_state.clone(), env).await;
    }

    match command.as_str() {
        "h" | "help" => {
            let mut app_state = app_state.lock().await;
            app_state.console.println("Commands:");
            app_state.console.println("  help");
            app_state.console.println("  fuzz <slug>");
            app_state
                .console
                .println("  judge <slug> <solution> <source-path>");
            app_state.console.println("  clear");
            app_state.console.println("  echo <message>");
            app_state.console.println("  cat <file-path>");
            app_state.console.println("  quit");
        }
        "f" | "fuzz" => {
            if args.len() != 1 {
                app_state
                    .lock()
                    .await
                    .console
                    .eprintln("Usage: fuzz <slug>");
                output.status = 1;
                return output;
            }

            app_state.lock().await.console.println("Request sent...");

            let slug = args[0].to_string();

            let response = app_state.lock().await.session.fuzz(slug).await;

            let out = match response {
                Ok(response) => response,
                Err(e) => Some(e.to_string()),
            };

            output.println(out.as_deref().unwrap_or("")).await;
        }
        "j" | "judge" => {
            if args.len() != 2 {
                app_state
                    .lock()
                    .await
                    .console
                    .eprintln("Usage: judge <slug> <source-path>");
                output.status = 1;
                return output;
            }

            let solution = if let Some(input) = piped_input {
                input
            } else {
                app_state
                    .lock()
                    .await
                    .console
                    .eprintln("No solution was provided. Please pipe the solution into this command. e.g. `echo \"solution\" | judge <slug> <source-path>`");
                output.status = 1;
                return output;
            };

            let slug = args[0].to_string();
            let source_path = PathBuf::from(&args[1]);

            app_state.lock().await.console.println("Request sent...");

            let response = app_state
                .lock()
                .await
                .session
                .judge(slug, solution, source_path)
                .await;

            let out = match response {
                Ok(response) => response,
                Err(e) => e.to_string(),
            };

            output.println(&out).await;
        }
        "clear" => {
            app_state.lock().await.console.clear();
        }
        "echo" => {
            output.println(&args.join(" ")).await;
        }
        "cat" => {
            if args.len() != 1 {
                app_state
                    .lock()
                    .await
                    .console
                    .eprintln("Usage: cat <file-path>");
                output.status = 1;
                return output;
            }

            let path = PathBuf::from(&args[0]);

            let res = tokio::fs::read_to_string(path).await;

            let out = match res {
                Ok(content) => content,
                Err(e) => {
                    output.status = 1;
                    e.to_string()
                }
            };

            output.println(&out).await;
        }
        "q" | "quit" | "exit" => {
            app_state.lock().await.running = false;
        }
        _ => {
            let cmd = Command::new(command)
                .args(args)
                .stdin(std::process::Stdio::piped())
                .stdout(std::process::Stdio::piped())
                .stderr(std::process::Stdio::piped())
                .spawn();

            if let Err(e) = cmd {
                output.println(&e.to_string()).await;
                output.status = 1;
                return output;
            }

            let mut child = cmd.unwrap();
            let stdin = child.stdin.as_mut().unwrap();

            if let Some(input) = piped_input {
                stdin.write_all(input.as_bytes()).await.unwrap();
            }

            let cmd_output = child.wait_with_output().await;

            output.status = cmd_output.as_ref().unwrap().status.code().unwrap_or(1);

            let out = match cmd_output {
                Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
                Err(e) => e.to_string(),
            };

            output.println(&out).await;
        }
    }

    output
}
fn tokenize(command: &str) -> Vec<String> {
    let mut tokens = vec![];

    let mut in_quote = false;
    let mut current = String::new();
    let mut escaped = false;
    let mut bracket_depth = 0;

    for c in command.chars() {
        if c.is_whitespace() && !in_quote && bracket_depth == 0 {
            if !current.is_empty() {
                tokens.push(current.clone());
                current.clear();
            }
            escaped = false;
            continue;
        } else if !escaped && c == '"' {
            in_quote = !in_quote;
            escaped = false;
            continue;
        } else if !escaped && c == '(' {
            bracket_depth += 1;
        } else if !escaped && c == ')' {
            bracket_depth -= 1;
        } else if !escaped && c == '\\' {
            escaped = true;
            continue;
        }

        current.push(c);
        escaped = false;
    }

    if !current.is_empty() {
        tokens.push(current.clone());
    }

    tokens
}

fn split_by_oper(command: &str, oper: &str, last: bool) -> Option<(String, String)> {
    let words = command.split_whitespace().filter(|s| !s.is_empty());

    let mut oper_pos = None;

    if last {
        for (i, word) in words.clone().enumerate() {
            if word == oper {
                oper_pos = Some(i);
            }
        }
    } else {
        for (i, word) in words.clone().enumerate() {
            if word == oper {
                oper_pos = Some(i);
                break;
            }
        }
    }

    if let Some(pos) = oper_pos {
        let first = words.clone().take(pos).collect::<Vec<&str>>().join(" ");
        let second = words.clone().skip(pos + 1).collect::<Vec<&str>>().join(" ");
        return Some((first, second));
    }

    None
}

#[derive(Clone, Copy, PartialEq, Eq, Default)]
pub enum OutputMode {
    #[default]
    ToConsole,
    Piped,
}

#[derive(Clone)]
pub struct Output {
    status: i32,
    stdout: String,
    #[allow(dead_code)]
    stderr: String,
    mode: OutputMode,
    app_state: Arc<tokio::sync::Mutex<AppState>>,
}

impl Output {
    pub fn new(mode: OutputMode, app_state: Arc<tokio::sync::Mutex<AppState>>) -> Self {
        Self {
            mode,
            app_state,
            status: 0,
            stdout: String::new(),
            stderr: String::new(),
        }
    }
}

impl Output {
    pub async fn println(&mut self, s: &str) {
        match self.mode {
            OutputMode::Piped => {
                self.stdout.push_str(s);
                self.stdout.push('\n');
            }
            OutputMode::ToConsole => {
                self.app_state.lock().await.console.println(s);
            }
        }
    }
}

async fn write_file(
    app_state: Arc<tokio::sync::Mutex<AppState>>,
    (path, content): (PathBuf, String),
) {
    let res = tokio::fs::write(path, content).await;
    if let Err(e) = res {
        app_state.lock().await.console.eprintln(&e.to_string());
    }
}

fn is_var_name_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_'
}

fn split_out_variables(arg: &str) -> Vec<String> {
    let mut parts = vec![];
    let mut current = String::new();
    let mut in_var = false;
    let mut bracket_depth = 0;

    let push = |current: &mut String, parts: &mut Vec<String>| {
        if !current.is_empty() {
            parts.push(current.clone());
            current.clear();
        }
    };

    for c in arg.chars() {
        if c == '(' {
            bracket_depth += 1;
        } else if c == ')' {
            bracket_depth -= 1;
            if bracket_depth == 0 {
                current.push(c);
                push(&mut current, &mut parts);
                continue;
            }
        } else if bracket_depth == 0 && c == '$' {
            push(&mut current, &mut parts);
            in_var = true;
        } else if bracket_depth == 0 && in_var && !is_var_name_char(c) {
            push(&mut current, &mut parts);
            in_var = false;
        }
        current.push(c);
    }

    push(&mut current, &mut parts);

    parts
}

async fn handle_variable(
    part: &str,
    app_state: Arc<tokio::sync::Mutex<AppState>>,
    env: &Env,
) -> String {
    assert!(part.starts_with('$'));

    let var = part.trim_start_matches('$');

    if var.is_empty() {
        return "$".to_string();
    }

    if var.starts_with('(') && var.ends_with(')') {
        let mut command = var.to_string();
        command.remove(0);
        command.pop();

        let output = exec(&command, app_state.clone(), OutputMode::Piped, None, env).await;

        return output.stdout;
    }

    match var {
        "s" | "selected" => {
            let selected = app_state
                .lock()
                .await
                .selected_problem_borrow()
                .clone()
                .selected()
                .unwrap_or(0);

            if let Some(selected) = app_state.lock().await.problems.get(selected) {
                return selected.slug.clone();
            }
        }
        _ => {
            if let Some(value) = env.get(var) {
                return value.clone();
            }
        }
    }

    "".to_string()
}

async fn process_arg(arg: &str, app_state: Arc<tokio::sync::Mutex<AppState>>, env: &Env) -> String {
    let parts = split_out_variables(arg);
    let mut new_arg = String::new();

    for part in parts {
        if part.starts_with('$') {
            new_arg.push_str(&handle_variable(&part, app_state.clone(), env).await);
        } else {
            new_arg.push_str(&part);
        }
    }

    new_arg
}

#[cfg(test)]
mod tests {
    use crate::api;

    use super::*;

    #[tokio::test]
    async fn test_shell() {
        let app_state = AppState::new(api::Session::new_no_connection());
        let app_state = Arc::new(tokio::sync::Mutex::new(app_state));
        let mut env = Env::new();
        env.insert("a".to_string(), "Some Value".to_string());

        // TODO: Support all of these
        let input_output_compare_tests = vec![
            ("echo hello", Some("hello"), 0),
            ("echo hello world", Some("hello world"), 0),
            ("echo a ; echo b ; echo c", Some("a\nb\nc"), 0),
            ("fuzz a a  a a a  aa a a", None, 1),
            ("cat", None, 1),
            ("echo a$a.a", Some("aSome Value.a"), 0),
            (
                "cat && echo hello",
                Some("ERROR: Usage: cat <file-path>"),
                1,
            ),
            ("echo hello && echo hello", Some("hello\nhello"), 0),
            ("cat non-existent-file", None, 1),
            ("ahjsdkjashldkjashdashdkj", None, 1),
            ("echo $(echo $(echo hi) hi) hello)", Some("hi hi hello"), 0),
            ("echo 2>1", Some(""), 0),
            ("cat 1", Some("2"), 0),
            ("rm 1", Some(""), 0),
            ("echo \"a\\na\"", Some("a\na"), 0),
            ("echo \" > f\"", Some(" > f"), 0),
            ("echo \" | && > < ; f\"", Some(" | && > < ; f"), 0),
            (
                "echo \"$(echo \"hi\" \" hi\") hello\"",
                Some("hi  hi hello"),
                0,
            ),
        ];

        for (input, output, status) in input_output_compare_tests {
            let cmd_output =
                exec(input, app_state.clone(), OutputMode::ToConsole, None, &env).await;
            println!("testing: {}", input);

            assert_eq!(cmd_output.status, status);

            let console_output = app_state.lock().await.console.messages.join("\n");

            if let Some(output) = output {
                assert_eq!(console_output, output);
            }

            app_state.lock().await.console.messages.clear();
        }
    }
}
