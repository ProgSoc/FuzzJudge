use api::connect_to_web_socket;
use ratatui::crossterm;
use state::AppState;
use std::time::Instant;
use std::{error::Error, io, sync::Arc};
use tokio::sync::Mutex;
use url::Url;

use ratatui::{
    backend::CrosstermBackend,
    crossterm::{
        event::{Event, KeyCode},
        execute,
        terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
    },
    Terminal,
};

use crate::state::AppStateMutex;

mod api;
mod auth;
mod clock;
mod console;
mod key;
mod md;
mod problem;
mod scroll;
mod shell;
mod state;
mod ui;
mod utils;

use clap::Parser;

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    /// URL of the server to connect to.
    #[arg(short, long)]
    server: String,

    /// Username to login with.
    #[arg(short, long)]
    username: String,

    /// Password to login with.
    #[arg(short, long, default_value_t = String::from(""))]
    password: String,

    /// Command to run when a new problem is recieved.
    /// `$q` will be set to the problem ID. (remember to escape `$` in your terminal)
    /// Example: `--on-recieve-problem "mkdir prob ; fuzz \$q > prob/\$q.txt"`
    #[arg(long)]
    on_recieve_problem: Option<String>,
    // #[arg(long)]
    // auto_submit: Option<String>,
    //
    // #[arg(long)]
    // watch: Option<String>,
}

async fn get_questions(app_state: Arc<Mutex<AppState>>, _: ()) {
    let problems = app_state
        .lock()
        .await
        .session
        .fetch_all_problems()
        .await
        .unwrap();

    let cmds = app_state.lock().await.on_new_problem.clone();

    for cmd in cmds {
        for problem in &problems {
            let mut env = shell::Env::default();
            env.insert("q".to_string(), problem.slug.clone());

            let _ = shell::exec(
                &cmd,
                app_state.clone(),
                shell::OutputMode::Piped,
                None,
                &env,
            )
            .await;
        }
    }

    let mut app_state = app_state.lock().await;

    app_state.problems = problems;
    app_state.selected_problem_borrow_mut().select(Some(0));
}

async fn start_web_socket(app_state: Arc<Mutex<AppState>>, _: ()) {
    let socket_addr = {
        let app_state = app_state.lock().await;
        let mut addr = app_state.session.server.clone();
        addr.set_scheme("ws").unwrap();
        addr
    };

    connect_to_web_socket(socket_addr.as_str(), app_state.clone()).await;
}

fn main() -> Result<(), Box<dyn Error>> {
    let args = Args::parse();

    let server = args.server;
    let creds = auth::Credentials::new(&args.username, &args.password);

    if Url::parse(&server).is_err() {
        eprintln!("Invalid server URL: {}", server);
        return Ok(());
    }

    let app_state = AppStateMutex::new(server.clone(), creds.clone());

    app_state.run_sync(|mut app_state| {
        if let Some(on_recieve_problem) = args.on_recieve_problem {
            app_state.on_new_problem.push(on_recieve_problem);
        }
    });

    app_state.run_async(get_questions, ());
    app_state.run_async(start_web_socket, ());

    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    const SPLASH_TEXT: &str = "  __ _       _         _
 / _(_)     | |_ _   _(_)
| |_| |_____| __| | | | |
|  _| |_____| |_| |_| | |
|_|_/ |      \\__|\\__,_|_|
  |__/";

    let version = env!("CARGO_PKG_VERSION");

    app_state.println(&format!("{}\nv{}\n", SPLASH_TEXT, version));

    let tick_rate = std::time::Duration::from_millis(250);
    let mut last_tick = Instant::now();

    loop {
        let _ = terminal.draw(|f| app_state.run_sync(|app_state| ui::draw(f, app_state)));

        let timeout = tick_rate.saturating_sub(last_tick.elapsed());
        if crossterm::event::poll(timeout)? {
            if let Event::Key(key) = crossterm::event::read()? {
                let typing = app_state.run_sync(|app_state| app_state.console.typing);
                if !typing && key.code == KeyCode::Char('q') {
                    break;
                }

                key::handle_press(app_state.clone(), key);
            }
        }

        if last_tick.elapsed() >= tick_rate {
            last_tick = Instant::now();
        }

        let running = app_state.run_sync(|app_state| app_state.running);
        if !running {
            break;
        }
    }

    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
    terminal.show_cursor()?;
    Ok(())
}
