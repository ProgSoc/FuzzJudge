#[derive(Default)]
pub struct EventSubscriptions {
    /// Commands run when a new problem is added. `$q` assigned to slug.
    pub new_problem: Vec<String>,
}

