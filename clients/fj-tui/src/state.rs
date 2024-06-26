use std::{future::Future, pin::Pin, sync::Arc};

use ratatui::widgets::ListState;
use tokio::sync::Mutex;

use crate::{api, auth, console::ConsoleState, key::KeyState, problem::Problem, scroll::Scroll};

pub struct AppState {
    pub problems: Vec<Problem>,
    pub session: api::Session,
    pub running: bool,
    pub instructions_scroll: Scroll,
    pub console: ConsoleState,
    pub key: KeyState,
    selected_problem: ListState,
}

impl AppState {
    pub fn new(server: String, creds: auth::Credentials) -> Self {
        Self {
            problems: vec![],
            session: api::Session::new(server, creds),
            running: true,
            selected_problem: ListState::default(),
            instructions_scroll: Scroll::new(),
            console: ConsoleState::default(),
            key: KeyState::default(),
        }
    }

    pub fn selected_problem_borrow<'a>(&'a self) -> &'a ListState {
        &self.selected_problem
    }

    /// Resets scroll
    pub fn selected_problem_borrow_mut<'a>(&'a mut self) -> &'a mut ListState {
        self.instructions_scroll.set_position(0);
        &mut self.selected_problem
    }

    pub fn selected_problem_borrow_mut_no_scroll<'a>(&'a mut self) -> &'a mut ListState {
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
        let app_state = Arc::new(tokio::sync::Mutex::new(AppState::new(server, creds)));
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

    /// Execute an async function with access to the app state mutex.
    ///
    /// # Arguments
    /// * `f` - The function to run. Function should be a pointer to an async function that
    /// takes the mutex-guarded app state and any data you want to pass through.
    /// * `a` - The data to pass through to the function.
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
            let app_state_cpy = app_state.clone();

            let _ = f(app_state).await;

            let app_state = app_state_cpy.lock().await;
        });
    }
}
