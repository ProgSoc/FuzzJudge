use chrono::{DateTime, Utc};

pub struct Clock {
    pub start: DateTime<Utc>,
    pub finish: DateTime<Utc>,
    // pub hold: String,
}

#[derive(PartialEq)]
pub enum ClockState {
    Before,
    During,
    After,
}

impl Clock {
    pub fn state(&self) -> ClockState {
        if self.start.naive_utc() > Utc::now().naive_utc() {
            ClockState::Before
        } else if self.finish.naive_utc() < Utc::now().naive_utc() {
            ClockState::After
        } else {
            ClockState::During
        }
    }

    pub fn time_until_next_state(&self) -> chrono::TimeDelta {
        match self.state() {
            ClockState::Before => self.start - Utc::now(),
            ClockState::During => self.finish - Utc::now(),
            ClockState::After => chrono::Duration::zero(),
        }
    }

    pub fn countdown_string(&self) -> String {
        let time = self.time_until_next_state();
        let time = format!(
            "{:02}:{:02}",
            time.num_seconds() / 60,
            time.num_seconds() % 60
        );

        match self.state() {
            ClockState::Before => format!("Starts in {}", time),
            ClockState::During => format!("Ends in {}", time),
            ClockState::After => "Ended".to_string(),
        }
    }
}
