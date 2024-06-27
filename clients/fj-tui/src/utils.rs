use std::fs::File;
use std::io::Write;

pub fn pad_end(s: &str, width: usize) -> String {
    let mut s = s.to_string();
    assert!(s.len() <= width);
    s.push_str(&" ".repeat(width - s.len()));
    s
}

pub fn dump_to_file(conents: &str, path: &str) -> std::io::Result<()> {
    let mut file = File::create(path)?;
    file.write_all(conents.as_bytes())?;
    Ok(())
}
