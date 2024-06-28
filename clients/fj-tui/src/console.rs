use crate::scroll::Scroll;

#[derive(Default)]
pub struct ConsoleState {
    pub messages: Vec<String>,
    pub command_buffer: String,
    pub command_history: Vec<String>,
    pub typing: bool,
    pub scroll: Scroll,
    pub commnand_history_index: usize,
    pub pre_history_command: Option<String>,
}

impl ConsoleState {
    pub fn println(&mut self, message: &str) {
        self.messages.push(message.to_string());

        self.scroll.set_content_length(self.line_count());

        self.scroll.to_bottom();
    }

    pub fn eprintln(&mut self, message: &str) {
        self.println(&format!("ERROR: {}", message));
    }

    pub fn line_count(&self) -> usize {
        self.messages
            .iter()
            .map(|s| s.lines().count())
            .sum::<usize>()
    }

    pub fn clear(&mut self) {
        self.messages.clear();
        self.scroll.set_content_length(0);
    }

    pub fn history_previous(&mut self) {
        if self.pre_history_command.is_none() || self.command_history.is_empty() {
            return;
        }

        let max_idx = self.command_history.len() - 1;

        if self.commnand_history_index == 0 {
            self.command_buffer = self.pre_history_command.as_ref().unwrap().clone();
            self.pre_history_command = None;
            return;
        }

        self.commnand_history_index =
            (self.commnand_history_index as i32 - 1).clamp(0, max_idx as i32) as usize;

        self.command_buffer = self.command_history[max_idx - self.commnand_history_index].clone();

        self.scroll.to_bottom();
    }

    pub fn history_next(&mut self) {
        if self.command_history.is_empty() {
            return;
        }

        let max_idx = self.command_history.len() - 1;

        if self.pre_history_command.is_none() {
            self.pre_history_command = Some(self.command_buffer.clone());
        } else {
            self.commnand_history_index =
                (self.commnand_history_index as i32 + 1).clamp(0, max_idx as i32) as usize;
        }

        self.command_buffer = self.command_history[max_idx - self.commnand_history_index].clone();

        self.scroll.to_bottom();
    }
}
