use rand::{Rng, SeedableRng};
use rand_chacha::ChaChaRng;

fuzzjudge_macro::main!(fuzz, judge, solution);

fn fuzz(seed: u64) -> String {
    names(seed).join("\n")
}

fn judge(seed: u64, input: &str) -> Result<(), String> {
    if input.trim() != solution(seed).trim() {
        return Err("Incorrect solution.".to_string());
    }

    Ok(())
}

fn solution(seed: u64) -> String {
    names(seed).into_iter().map(|n| format!("Hello, {}!", n)).collect::<Vec<_>>().join("\n")
}

fn names(seed: u64) -> Vec<&'static str> {
    let mut names = vec!["Alice", "Bob", "Graydon", "Ferris", "Jane", "John", "Eve"];
    let mut chosen = vec![];

    let mut rng = ChaChaRng::seed_from_u64(seed);
    while !names.is_empty() {
        chosen.push(names.remove(rng.random_range(0..names.len())));
    }

    chosen
}
