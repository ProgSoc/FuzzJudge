use state::AppState;
use std::time::Instant;
use std::{error::Error, io, sync::Arc};
use tokio::sync::Mutex;

use ratatui::{
    backend::CrosstermBackend,
    crossterm::{
        event::{self, Event, KeyCode},
        execute,
        terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
    },
    Terminal,
};

use crate::problem::Problem;
use crate::state::AppStateMutex;

mod api;
mod auth;
mod console;
mod key;
mod md;
mod problem;
mod state;
mod ui;
mod utils;
mod scroll;

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

    /// Automatically write problem inputs to a file when received.
    /// Provide a format string with any number of `%s` which will be replaced with the ID of the
    /// problem to specify the path.
    /// Example: `--save-problem-inputs ./inputs/%s.txt`
    #[arg(long)]
    save_problem_inputs: Option<String>,

    /// Command to run when a problem is received.
    /// Provide a format string with any number of `%s` which will be replaced with the ID of the
    /// problem to specify the command.
    /// Example: `--on-recieve-problem "echo \"i = `$(cat ./inputs/%s.txt)`\n\n\" > %s.py"`
    #[arg(long)]
    on_recieve_problem: Option<String>,

    /// Provide a format string with any number of `%s` which will be replaced with the ID of the
    /// problem to specify a command to run to generate a solution. `stdout` will be submitted
    /// to the server. Will only work if `--watch` is also provided. If may be useful to use
    /// `stderr` for debugging output so that this dose not have to be removed before submission.
    #[arg(long)]
    auto_submit: Option<String>,

    /// Provide a format string with any number of `%s` which will be replaced with the ID of the
    /// problem to specify a path to watch for changes. When the file changes, the `--auto-submit`
    /// command will be run and the file will be submitted.
    #[arg(long)]
    watch: Option<String>,
}

async fn get_question(app_state: Arc<Mutex<AppState>>, _: ()) {
    let (server, creds) = {
        let app_state = app_state.lock().await;
        (
            app_state.session.server.clone(),
            app_state.session.creds.clone(),
        )
    };

    let problems = Problem::fetch_all(&server, &creds).await.unwrap();

    let mut app_state = app_state.lock().await;

    app_state.problems = problems;
    app_state.selected_problem_borrow_mut().select(Some(0));
}

fn main() -> Result<(), Box<dyn Error>> {
    let args = Args::parse();

    let server = args.server;
    let creds = auth::Credentials::new(&args.username, &args.password);

    let app_state = AppStateMutex::new(server.clone(), creds.clone());

    app_state.run_async(get_question, ());

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
        if event::poll(timeout)? {
            if let Event::Key(key) = event::read()? {
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
        // if !app_state.running {
        //     break;
        // }
    }

    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
    terminal.show_cursor()?;
    Ok(())
}
