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

use std::{future::Future, pin::Pin, sync::Arc};

use ratatui::widgets::ListState;
use tokio::sync::Mutex;

use crate::{
    api, auth, clock::Clock, console::ConsoleState, key::KeyState, problem::Problem, scroll::Scroll,
};

pub struct AppState {
    pub problems: Vec<Problem>,
    pub session: api::Session,
    pub running: bool,
    pub instructions_scroll: Scroll,
    pub console: ConsoleState,
    pub key: KeyState,
    pub clock: Option<Clock>,
    /// Commands run when a new problem is added. `$q` assigned to slug.
    pub on_new_problem: Vec<String>,
    selected_problem: ListState,
}

impl AppState {
    pub fn new(session: api::Session) -> Self {
        Self {
            problems: vec![],
            session,
            running: true,
            selected_problem: ListState::default(),
            instructions_scroll: Scroll::new(),
            console: ConsoleState::default(),
            key: KeyState::default(),
            on_new_problem: vec![],
            clock: None,
        }
    }

    pub fn selected_problem_borrow(&self) -> &ListState {
        &self.selected_problem
    }

    /// Resets scroll
    pub fn selected_problem_borrow_mut(&mut self) -> &mut ListState {
        self.instructions_scroll.set_position(0);
        &mut self.selected_problem
    }

    pub fn selected_problem_borrow_mut_no_scroll(&mut self) -> &mut ListState {
        &mut self.selected_problem
    }
}

#[derive(Clone)]
pub struct AppStateMutex {
    rt: Arc<std::sync::Mutex<tokio::runtime::Runtime>>,
    app_state: Arc<tokio::sync::Mutex<AppState>>,
}

trait AsyncCallback: FnOnce(Arc<Mutex<AppState>>) -> Pin<Box<dyn Future<Output = ()> + Send>> {}
impl<T> AsyncCallback for T where
    T: FnOnce(Arc<Mutex<AppState>>) -> Pin<Box<dyn Future<Output = ()> + Send>>
{
}

fn force_boxed<T, A>(f: fn(Arc<Mutex<AppState>>, A) -> T, a: A) -> impl AsyncCallback
where
    T: Future<Output = ()> + 'static + Send,
    A: Clone + Send + 'static,
{
    move |n| Box::pin(f(n, a)) as _
}

impl AppStateMutex {
    pub fn new(server: String, creds: auth::Credentials) -> Self {
        let rt = Arc::new(std::sync::Mutex::new(
            tokio::runtime::Runtime::new().unwrap(),
        ));

        let sess = rt
            .lock()
            .unwrap()
            .block_on(async { api::Session::new(server, creds.clone()).await });

        let sess = match sess {
            Ok(s) => s,
            Err(e) => {
                eprintln!("Connection Error: {}", e);
                std::process::exit(1);
            }
        };

        let app_state = Arc::new(tokio::sync::Mutex::new(AppState::new(sess)));
        Self { rt, app_state }
    }

    /// Print utility to avoid having to deal with the locking and callbacks.
    pub fn println(&self, message: &str) {
        self.run_sync(move |mut app_state| {
            app_state.console.println(message);
        });
    }

    /// Execute a synchronous function with access to the app state.
    pub fn run_sync<F, T>(&self, f: F) -> T
    where
        F: FnOnce(tokio::sync::MutexGuard<'_, AppState>) -> T,
    {
        let rt = self.rt.lock().unwrap();
        rt.block_on(async {
            let app_state = self.app_state.lock().await;
            f(app_state)
        })
    }

    /// Execute an async function with access to the app state mutex. It needs to be like this
    /// because we don't have async closures yet.
    ///
    /// # Arguments
    /// * `f` - The function to run. Function should be a pointer to an async function that
    /// takes the mutex-guarded app state and any data you want to pass through.
    /// * `a` - The data to pass through to the function.
    ///
    /// # Example
    /// ```rust
    /// async fn add(app_state: Arc<Mutex<AppState>>, (a, b): (i32, i32)) {
    ///    let mut app_state = app_state.lock().await;
    ///    app_state.console.println(&format!("{} + {} = {}", a, b, a + b));
    /// }
    ///
    /// ...
    ///
    /// app_state.run_async(add, (1, 2));
    /// ```
    pub fn run_async<T, A>(&self, f: fn(Arc<Mutex<AppState>>, A) -> T, a: A)
    where
        T: Future<Output = ()> + 'static + Send,
        A: Clone + Send + 'static,
    {
        self.__run_async(force_boxed(f, a));
    }

    fn __run_async(&self, f: impl AsyncCallback + Send + 'static) {
        let app_state = self.app_state.clone();
        let rt = self.rt.lock().unwrap();
        rt.spawn(async move {
            let _ = f(app_state).await;
        });
    }
}
