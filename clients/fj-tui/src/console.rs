use crate::{scroll::Scroll, utils::number_of_lines_when_broken};

#[derive(Default)]
pub struct ConsoleState {
    pub messages: Vec<String>,
    pub command_buffer: String,
    pub command_history: Vec<String>,
    pub typing: bool,
    pub scroll: Scroll,
    pub command_history_index: usize,
    pub pre_history_command: Option<String>,
    pub console_width: usize,
}

impl ConsoleState {
    pub fn println(&mut self, message: &str) {
        self.messages.push(message.to_string());
        self.recompute_scroll();
        self.scroll.to_bottom();
    }

    pub fn eprintln(&mut self, message: &str) {
        self.println(&format!("ERROR: {}", message));
    }

    pub fn clear(&mut self) {
        self.messages.clear();
        self.scroll.set_content_length(0);
    }

    pub fn set_console_width(&mut self, width: usize) {
        self.console_width = width;
        self.recompute_scroll();
    }

    fn recompute_scroll(&mut self) {
        // HACK: Because of line-wrapping in the ratatui paragraph, we need to approximate
        //       the number of lines ourself.
        let lines = self
            .messages
            .iter()
            .map(|m| {
                let mut m = m.clone();
                if m.chars().last() == Some('\n') {
                    m.pop();
                }

                m.split("\n")
                    .map(|l| number_of_lines_when_broken(&format!("> {}", l), self.console_width))
                    .sum::<usize>()
            })
            .sum::<usize>()
            + number_of_lines_when_broken(
                &format!("> {}", self.command_buffer),
                self.console_width,
            );
        self.scroll.set_content_length(lines);
    }

    pub fn history_previous(&mut self) {
        if self.pre_history_command.is_none() || self.command_history.is_empty() {
            return;
        }

        let max_idx = self.command_history.len() - 1;

        if self.command_history_index == 0 {
            self.command_buffer = self.pre_history_command.as_ref().unwrap().clone();
            self.pre_history_command = None;
            return;
        }

        self.command_history_index =
            (self.command_history_index as i32 - 1).clamp(0, max_idx as i32) as usize;

        self.command_buffer = self.command_history[max_idx - self.command_history_index].clone();

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
            self.command_history_index =
                (self.command_history_index as i32 + 1).clamp(0, max_idx as i32) as usize;
        }

        self.command_buffer = self.command_history[max_idx - self.command_history_index].clone();

        self.scroll.to_bottom();
    }
}
