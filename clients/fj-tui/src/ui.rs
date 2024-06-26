use ratatui::Frame;

use crate::{md, AppState};

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

    let inner_layout = Layout::new(
        Direction::Horizontal,
        [Constraint::Length(30), Constraint::Min(0)],
    )
    .split(main_layout[1]);

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
        main_layout[0],
    );

    let block = Block::new().title("Questions").borders(Borders::ALL);

    let items: Vec<ListItem> = app_state
        .problems
        .iter()
        .map(|p| ListItem::from(format!("{} {}\n   {} Points", p.icon, p.title, p.points)))
        .collect();

    const SELECTED_STYLE: Style = Style::new().bg(SLATE.c400).add_modifier(Modifier::BOLD);

    let list = List::new(items)
        .block(block)
        .highlight_style(SELECTED_STYLE)
        .highlight_symbol(">")
        .highlight_spacing(HighlightSpacing::Always);

    frame.render_stateful_widget(
        list,
        inner_layout[0],
        &mut app_state.selected_problem_borrow_mut_no_scroll(),
    );

    let (title, contents, difficulty, points) = match app_state.selected_problem_borrow().selected()
    {
        Some(s) => (
            app_state.problems[s].title.clone(),
            app_state.problems[s].instructions.clone(),
            app_state.problems[s].difficulty.clone(),
            app_state.problems[s].points,
        ),
        None => ("".to_string(), "No problem selected".to_string(), 0, 0),
    };

    let md = markdown::to_mdast(&contents, &markdown::ParseOptions::default()).unwrap();
    let mut contents: Vec<Line> = vec![];
    md::render(&md, &mut contents);

    contents.insert(0, Line::from(title));
    contents.insert(1, Line::from("-----------------------------------------"));
    contents.insert(
        2,
        Line::from(vec!["Difficulty: ".into(), difficulty_label(difficulty)]),
    );
    contents.insert(
        3,
        Line::from(vec!["Points: ".into(), points.to_string().into()]),
    );
    contents.insert(4, Line::from(vec![]));

    let question_area = Layout::new(
        Direction::Vertical,
        [Constraint::Min(0), Constraint::Max(17)],
    )
    .split(inner_layout[1]);

    // FIXME: line-wrapping creates more lines than just len()
    app_state
        .instructions_scroll
        .set_content_length(contents.len());

    app_state
        .instructions_scroll
        .set_view_port_size(question_area[0].height.saturating_sub(5) as usize);

    frame.render_widget(
        Paragraph::new(contents)
            .wrap(Wrap { trim: false })
            .block(Block::bordered())
            .scroll((app_state.instructions_scroll.scroll as u16, 0)),
        question_area[0],
    );

    frame.render_stateful_widget(
        Scrollbar::new(ScrollbarOrientation::VerticalRight).symbols(scrollbar::VERTICAL),
        question_area[0].inner(Margin {
            vertical: 1,
            horizontal: 0,
        }),
        &mut app_state.instructions_scroll.scroll_state,
    );

    app_state
        .console
        .scroll
        .set_view_port_size(question_area[1].height.saturating_sub(4) as usize);

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
        console_input.push("█".rapid_blink());
    }

    console_text.push(Line::from(console_input));

    frame.render_widget(
        Paragraph::new(console_text)
            .wrap(Wrap { trim: true })
            .block(Block::bordered().title("Console"))
            .scroll((app_state.console.scroll.scroll as u16, 0)),
        question_area[1],
    );

    frame.render_stateful_widget(
        Scrollbar::new(ScrollbarOrientation::VerticalLeft).symbols(scrollbar::VERTICAL),
        question_area[1].inner(Margin {
            vertical: 2,
            horizontal: 0,
        }),
        &mut app_state.console.scroll.scroll_state,
    );
}

fn difficulty_label(difficulty: i32) -> Span<'static> {
    match difficulty {
        1 => "Easy".green(),
        2 => "Medium".yellow(),
        3 => "Hard".red(),
        _ => "Unknown".italic(),
    }
}
