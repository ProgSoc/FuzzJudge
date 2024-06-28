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
                lines += 1;
            }

            column = 0;
            words_seen_this_line = 0;
        }

        column += 1;
        i += 1;
    }

    lines
}
