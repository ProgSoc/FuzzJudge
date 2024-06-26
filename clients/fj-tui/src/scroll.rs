use ratatui::widgets::ScrollbarState;

#[derive(Default)]
pub struct Scroll {
    pub scroll: usize,
    pub content_length: usize,
    pub scroll_state: ScrollbarState,
}

impl Scroll {
    pub fn new() -> Self {
        Self {
            scroll: 0,
            scroll_state: ScrollbarState::default(),
            content_length: 0,
        }
    }

    pub fn set_position(&mut self, position: usize) {
        self.scroll = position;
        self.scroll_state = self.scroll_state.position(position);
    }

    pub fn offset(&mut self, offset: i32) {
        self.scroll =
            (self.scroll as i32 + offset as i32).clamp(0, self.content_length as i32) as usize;
        self.scroll_state = self.scroll_state.position(self.scroll);
    }

    pub fn set_content_length(&mut self, content_length: usize) {
        self.content_length = content_length;
        self.scroll_state = self.scroll_state.content_length(content_length);
        if self.scroll > content_length {
            self.set_position(content_length);
        }
    }

    pub fn to_bottom(&mut self) {
        self.set_position(self.content_length);
    }
}
