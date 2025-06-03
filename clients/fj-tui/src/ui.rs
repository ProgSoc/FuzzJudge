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

use ratatui::Frame;

use crate::{
    clock::{self, ClockState},
    md,
    utils::number_of_lines_when_broken,
    AppState,
};

use ratatui::{
    layout::{Constraint, Direction, Layout, Margin},
    style::{palette::tailwind::SLATE, Modifier, Style, Stylize},
    symbols::scrollbar,
    text::{Line, Span},
    widgets::{
        Block, Borders, HighlightSpacing, List, ListItem, Paragraph, Scrollbar,
        ScrollbarOrientation, Wrap,
    },
};

pub fn draw(frame: &mut Frame, mut app_state: tokio::sync::MutexGuard<AppState>) {
    let main_layout = Layout::new(
        Direction::Vertical,
        [Constraint::Length(3), Constraint::Min(0)],
    )
    .split(frame.size());

    let top_bar_area = main_layout[0];

    let inner_layout = Layout::new(
        Direction::Horizontal,
        [Constraint::Length(30), Constraint::Min(0)],
    )
    .split(main_layout[1]);

    let question_list_area = inner_layout[0];

    let question_area = Layout::new(
        Direction::Vertical,
        [Constraint::Min(0), Constraint::Max(17)],
    )
    .split(inner_layout[1]);

    let instructions_area = question_area[0];
    let console_area = question_area[1];

    top_bar(&app_state, frame, top_bar_area);
    question_list(&mut app_state, frame, question_list_area);
    instructions(&mut app_state, question_area, frame, instructions_area);
    console(app_state, console_area, frame);
}

fn top_bar(
    app_state: &tokio::sync::MutexGuard<AppState>,
    frame: &mut Frame,
    top_bar_area: ratatui::prelude::Rect,
) {
    let mut top_bar_text = vec![];

    top_bar_text.extend(vec![
        "Logged in as ".into(),
        app_state.session.creds.username.clone().italic(),
        ".".into(),
    ]);

    if let Some(clock) = &app_state.clock {
        top_bar_text.push(" | ".into());
        top_bar_text.push(clock.countdown_string().into());
    }

    frame.render_widget(
        Paragraph::new(Line::from(top_bar_text)).block(Block::bordered()),
        top_bar_area,
    );
}

fn question_list(
    app_state: &mut tokio::sync::MutexGuard<AppState>,
    frame: &mut Frame,
    question_list_area: ratatui::prelude::Rect,
) {
    let block = Block::new().title("Questions").borders(Borders::ALL);

    let items: Vec<ListItem> = app_state
        .problems
        .iter()
        .map(|p| {
            let title = Line::from(format!("{} {}", p.icon, p.title));
            let points = Line::from(format!("    {} Points", p.points).dark_gray());
            ListItem::from(vec![title, points])
        })
        .collect();

    const SELECTED_STYLE: Style = Style::new().bg(SLATE.c400).add_modifier(Modifier::BOLD);

    let list = List::new(items)
        .block(block)
        .highlight_style(SELECTED_STYLE)
        .highlight_symbol(">")
        .highlight_spacing(HighlightSpacing::Always);

    frame.render_stateful_widget(
        list,
        question_list_area,
        app_state.selected_problem_borrow_mut_no_scroll(),
    );
}

fn instructions(
    app_state: &mut tokio::sync::MutexGuard<AppState>,
    question_area: std::rc::Rc<[ratatui::prelude::Rect]>,
    frame: &mut Frame,
    instructions_area: ratatui::prelude::Rect,
) {
    let (title, md_source, difficulty, points) =
        match app_state.selected_problem_borrow().selected() {
            Some(s) => (
                app_state.problems[s].title.clone(),
                app_state.problems[s].instructions.clone(),
                app_state.problems[s].difficulty,
                app_state.problems[s].points,
            ),
            None => ("".to_string(), Some("No Question Selected".to_string()), 0, 0),
        };

    let mut contents: Vec<Line> = vec![];

    let clock_state = if let Some(clock) = &app_state.clock {
        clock.state()
    } else {
        clock::ClockState::During
    };

    let md = markdown::to_mdast(md_source.as_deref().unwrap_or(""), &markdown::ParseOptions::default()).unwrap();

    match clock_state {
        ClockState::During => {
            md::render(&md, &mut contents);

            contents.insert(0, Line::from(title.clone()));
            contents.insert(1, Line::from("-".repeat(title.len() + 5)));
            contents.insert(
                2,
                Line::from(vec!["Difficulty: ".into(), difficulty_label(difficulty)]),
            );
            contents.insert(
                3,
                Line::from(vec!["Points: ".into(), points.to_string().into()]),
            );
            contents.insert(4, Line::from(vec![]));
        }
        ClockState::Before => {
            contents.push(Line::from("The competition has not started yet.".bold()));
        }
        ClockState::After => {
            contents.push(Line::from("The competition has ended.".bold()));
        }
    }

    // HACK: Because of line-wrapping in the ratatui paragraph, we need to approximate
    //       the number of lines ourself.
    let paragraph_width = instructions_area.width.saturating_sub(4) as usize;
    let lines = contents
        .iter()
        .map(|l| number_of_lines_when_broken(&l.to_string(), paragraph_width))
        .sum::<usize>();

    app_state.instructions_scroll.set_content_length(lines);

    app_state
        .instructions_scroll
        .set_view_port_height(question_area[0].height.saturating_sub(5) as usize);

    frame.render_widget(
        Paragraph::new(contents)
            .wrap(Wrap { trim: false })
            .block(Block::bordered())
            .scroll((app_state.instructions_scroll.scroll as u16, 0)),
        instructions_area,
    );

    frame.render_stateful_widget(
        Scrollbar::new(ScrollbarOrientation::VerticalRight).symbols(scrollbar::VERTICAL),
        instructions_area.inner(Margin {
            vertical: 1,
            horizontal: 0,
        }),
        &mut app_state.instructions_scroll.scroll_state,
    );
}

fn console(
    mut app_state: tokio::sync::MutexGuard<AppState>,
    console_area: ratatui::prelude::Rect,
    frame: &mut Frame,
) {
    app_state
        .console
        .scroll
        .set_view_port_height(console_area.height.saturating_sub(2) as usize);

    let width = console_area.width.saturating_sub(2) as usize;
    app_state.console.set_console_width(width);

    let mut console_text: Vec<Line> = app_state
        .console
        .messages
        .iter()
        .map(|s| {
            let mut lines = s.lines();

            if lines.clone().count() == 0 {
                return vec![];
            }

            let mut text = vec![Line::from(vec!["> ".blue(), lines.next().unwrap().into()])];

            for line in lines {
                text.push(Line::from(vec!["  ".into(), line.into()]));
            }

            text
        })
        .collect::<Vec<Vec<Line>>>()
        .concat();

    let mut console_input: Vec<Span> = vec!["> ".blue()];
    if app_state.console.typing {
        console_input.push(app_state.console.command_buffer.clone().into());
        console_input.push("█".slow_blink());
    }

    console_text.push(Line::from(console_input));

    frame.render_widget(
        Paragraph::new(console_text)
            .wrap(Wrap { trim: false })
            .block(Block::bordered().title("Console"))
            .scroll((app_state.console.scroll.scroll as u16, 0)),
        console_area,
    );

    frame.render_stateful_widget(
        Scrollbar::new(ScrollbarOrientation::VerticalLeft).symbols(scrollbar::VERTICAL),
        console_area.inner(Margin {
            vertical: 2,
            horizontal: 0,
        }),
        &mut app_state.console.scroll.scroll_state,
    );
}

fn difficulty_label(difficulty: i64) -> Span<'static> {
    match difficulty {
        1 => "Easy".green(),
        2 => "Medium".yellow(),
        3 => "Hard".red(),
        _ => "Unknown".italic(),
    }
}
