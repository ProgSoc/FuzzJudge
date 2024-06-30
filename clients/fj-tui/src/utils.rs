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

pub fn pad_end(s: &str, width: usize) -> String {
    let mut s = s.to_string();
    assert!(s.len() <= width);
    s.push_str(&" ".repeat(width - s.len()));
    s
}

pub fn number_of_lines_when_broken(s: &str, width: usize) -> usize {
    let mut lines = 1;
    let mut column = 0;
    let mut last_word_start = 0;
    let mut words_seen_this_line = 0;
    let mut in_word = false;

    let mut i = 0;

    while i < s.chars().count() {
        let c = s.chars().nth(i).unwrap();

        if !in_word && !c.is_whitespace() {
            in_word = true;
            last_word_start = i;
        } else if in_word && c.is_whitespace() {
            words_seen_this_line += 1;
            in_word = false;
        }

        if column == width {
            // Split word if can't fit.
            if words_seen_this_line != 0 {
                i = last_word_start;
            }

            lines += 1;
            column = 0;
            words_seen_this_line = 0;
        }

        column += 1;
        i += 1;
    }

    lines
}
