use std::{collections::HashMap, path::PathBuf, sync::Arc};

use async_recursion::async_recursion;
use tokio::{io::AsyncWriteExt, process::Command};

use crate::state::AppState;

pub type Env = HashMap<String, String>;

#[async_recursion]
pub async fn exec(
    command: &str,
    app_state: Arc<tokio::sync::Mutex<AppState>>,
    output: &Output,
    piped_input: Option<String>,
    env: &Env,
) {
    if let Some((l, r)) = split_by_oper(command, ";") {
        exec(&l, app_state.clone(), output, None, env).await;
        exec(&r, app_state.clone(), output, None, env).await;
        return;
    }

    if let Some((l, r)) = split_by_oper(command, "&") {
        exec(&l, app_state.clone(), output, None, env).await;
        exec(&r, app_state.clone(), output, None, env).await;
        return;
    }

    if let Some((l, r)) = split_by_oper(command, ">") {
        // TODO: deal with things after the path
        let output = Output::ToFile(PathBuf::from(process_arg(&r, app_state.clone(), env).await));
        exec(&l, app_state.clone(), &output, None, env).await;
        return;
    }

    if let Some((l, r)) = split_by_oper(command, "|") {
        let output = Output::Piped {
            command: r.to_string(),
        };
        exec(&l, app_state.clone(), &output, None, env).await;
        return;
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
                return;
            }

            app_state.lock().await.console.println("Request sent...");

            let slug = args[0].to_string();

            let response = app_state.lock().await.session.fuzz(slug).await;

            let out = match response {
                Ok(response) => response,
                Err(e) => e.to_string(),
            };

            output.println(&out, app_state.clone(), env).await
        }
        "j" | "judge" => {
            if args.len() != 2 {
                app_state
                    .lock()
                    .await
                    .console
                    .eprintln("Usage: judge <slug> <source-path>");
                return;
            }

            let solution = if let Some(input) = piped_input {
                input
            } else {
                app_state
                    .lock()
                    .await
                    .console
                    .eprintln("No solution was provided. Please pipe the solution into this command. e.g. `echo \"solution\" | judge <slug> <source-path>`");
                return;
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

            output.println(&out, app_state.clone(), env).await
        }
        "clear" => {
            app_state.lock().await.console.clear();
        }
        "echo" => {
            output
                .println(&args.join(" "), app_state.clone(), env)
                .await;
        }
        "cat" => {
            if args.len() != 1 {
                app_state
                    .lock()
                    .await
                    .console
                    .eprintln("Usage: cat <file-path>");
                return;
            }

            let path = PathBuf::from(&args[0]);

            let res = tokio::fs::read_to_string(path).await;

            let out = match res {
                Ok(content) => content,
                Err(e) => e.to_string(),
            };

            output.println(&out, app_state.clone(), env).await;
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
                output.println(&e.to_string(), app_state.clone(), env).await;
                return;
            }

            let mut child = cmd.unwrap();
            let stdin = child.stdin.as_mut().unwrap();

            if let Some(input) = piped_input {
                stdin.write_all(input.as_bytes()).await.unwrap();
            }

            let cmd_output = child.wait_with_output().await;

            let out = match cmd_output {
                Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
                Err(e) => e.to_string(),
            };

            output.println(&out, app_state.clone(), env).await;
        }
    }
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

fn split_by_oper(command: &str, oper: &str) -> Option<(String, String)> {
    let words = command.split_whitespace().filter(|s| !s.is_empty());

    let mut oper_pos = None;

    for (i, word) in words.clone().enumerate() {
        if word == oper {
            oper_pos = Some(i);
            break;
        }
    }

    if let Some(pos) = oper_pos {
        let first = words.clone().take(pos).collect::<Vec<&str>>().join(" ");
        let second = words.clone().skip(pos + 1).collect::<Vec<&str>>().join(" ");
        return Some((first, second));
    }

    None
}

#[derive(Clone)]
pub enum Output {
    ToConsole,
    ToFile(PathBuf),
    Piped { command: String },
    IntoMutex(Arc<tokio::sync::Mutex<String>>),
}

impl Output {
    pub async fn println(
        &self,
        message: &str,
        app_state: Arc<tokio::sync::Mutex<AppState>>,
        env: &Env,
    ) {
        match self {
            Output::ToConsole => {
                app_state.lock().await.console.println(message);
            }
            Output::ToFile(path) => {
                write_file(app_state, (path.clone(), message.to_string())).await;
            }
            Output::Piped { command } => {
                exec(
                    command,
                    app_state.clone(),
                    &Output::ToConsole,
                    Some(message.to_string()),
                    env,
                )
                .await;
            }
            Output::IntoMutex(mutex) => {
                let mut guard = mutex.lock().await;
                guard.push_str(message);
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

        let output = Arc::new(tokio::sync::Mutex::new("".to_string()));
        exec(
            &command,
            app_state.clone(),
            &Output::IntoMutex(output.clone()),
            None,
            env,
        )
        .await;
        let output = output.lock().await.clone();

        return output;
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
