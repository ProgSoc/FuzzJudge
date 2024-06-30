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

use ratatui::widgets::ScrollbarState;

#[derive(Default)]
pub struct Scroll {
    pub scroll: usize,
    pub content_length: usize,
    pub scroll_state: ScrollbarState,
    pub view_port_height: usize,
}

impl Scroll {
    pub fn new() -> Self {
        Self::default()
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

    pub fn set_view_port_height(&mut self, view_port_size: usize) {
        self.view_port_height = view_port_size;
        self.scroll_state = self.scroll_state.content_length(self.bottom());
        self.clamp();
    }

    pub fn clamp(&mut self) {
        self.scroll = self.scroll.clamp(0, self.bottom())
    }

    fn bottom(&self) -> usize {
        self.content_length.saturating_sub(self.view_port_height)
    }

    #[allow(clippy::wrong_self_convention)]
    pub fn to_bottom(&mut self) {
        self.set_position(self.bottom());
    }
}
