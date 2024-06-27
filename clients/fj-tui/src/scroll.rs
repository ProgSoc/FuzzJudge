use ratatui::widgets::ScrollbarState;

#[derive(Default)]
pub struct Scroll {
    pub scroll: usize,
    pub content_length: usize,
    pub scroll_state: ScrollbarState,
    pub view_port_size: usize,
}

impl Scroll {
    pub fn new() -> Self {
        Self {
            scroll: 0,
            scroll_state: ScrollbarState::default(),
            content_length: 0,
            view_port_size: 0,
        }
    }

    pub fn set_position(&mut self, position: usize) {
        self.scroll = position;
        self.scroll_state = self.scroll_state.position(position);
    }

    pub fn offset(&mut self, offset: i32) {
        self.scroll = (self.scroll as i32 + offset).clamp(0, self.content_length as i32) as usize;
        self.scroll_state = self.scroll_state.position(self.scroll);
    }

    pub fn set_content_length(&mut self, content_length: usize) {
        self.content_length = content_length;
        self.scroll_state = self.scroll_state.content_length(self.bottom());
        self.clamp();
    }

    pub fn set_view_port_size(&mut self, view_port_size: usize) {
        self.view_port_size = view_port_size;
        self.scroll_state = self.scroll_state.content_length(self.bottom());
        self.clamp();
    }

    pub fn clamp(&mut self) {
        self.scroll = self.scroll.clamp(0, self.bottom())
    }

    fn bottom(&self) -> usize {
        self.content_length.saturating_sub(self.view_port_size)
    }

    pub fn to_bottom(&mut self) {
        self.set_position(self.bottom());
    }
}
