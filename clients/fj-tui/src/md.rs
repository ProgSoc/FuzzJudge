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

use markdown::mdast;
use ratatui::{
    style::Stylize,
    text::{Line, Span},
};

use crate::utils::pad_end;

pub fn render<'a>(md: &'a mdast::Node, contents: &mut Vec<Line<'a>>) {
    match md {
        mdast::Node::Text(text) => {
            push(contents, text.value.clone().into());
        }
        mdast::Node::Paragraph(p) => {
            contents.extend(render_children(&p.children));
            contents.push(Line::from(""));
        }
        mdast::Node::Heading(heading) => {
            // heading.depth

            contents.push(Line::from(""));
            contents.extend(render_children(&heading.children));
            contents.push(Line::from("-".repeat(40)));
        }
        mdast::Node::ListItem(list_iten) => {
            let mut children = render_children(&list_iten.children);
            if let Some(first) = children.first_mut() {
                first.spans.insert(0, Span::from("  • "));
            }
            contents.extend(children);
        }
        mdast::Node::Code(code) => {
            let width = code.value.lines().map(|l| l.len()).max().unwrap_or(0);

            for line in code.value.lines() {
                let line: Span = pad_end(line, width).white().on_dark_gray();
                let indent: Span = ">    ".into();
                contents.push(Line::from(vec![indent, line]));
            }

            contents.push(Line::from(""));
        }
        mdast::Node::Image(image) => {
            push(contents, format!("[IMAGE {}]", image.alt.as_str()).red());
        }
        mdast::Node::InlineCode(code) => {
            push(contents, code.value.clone().white().on_dark_gray());
        }
        mdast::Node::Link(link) => {
            let children = render_children(&link.children);
            join(contents, children);
            push(contents, " [".into());
            push(contents, link.url.clone().blue().underlined());
            push(contents, "]".into());
        }
        mdast::Node::Strong(strong) => {
            let children = render_children(&strong.children)
                .iter()
                .map(|l| Line::from(l.iter().map(|s| s.clone().bold()).collect::<Vec<Span>>()))
                .collect::<Vec<Line>>();

            join(contents, children);
        }
        mdast::Node::BlockQuote(blockquote) => {
            let children = render_children(&blockquote.children);
            for child in children {
                let mut child = child;
                if !child.spans.is_empty() {
                    child.spans.insert(0, Span::from("  > "));
                }
                contents.push(child);
            }
        }
        mdast::Node::Emphasis(emphasis) => {
            let children = render_children(&emphasis.children)
                .iter()
                .map(|l| Line::from(l.iter().map(|s| s.clone().italic()).collect::<Vec<Span>>()))
                .collect::<Vec<Line>>();

            join(contents, children);
        }
        mdast::Node::Delete(emphasis) => {
            let children = render_children(&emphasis.children)
                .iter()
                .map(|l| {
                    Line::from(
                        l.iter()
                            .map(|s| s.clone().crossed_out())
                            .collect::<Vec<Span>>(),
                    )
                })
                .collect::<Vec<Line>>();

            join(contents, children);
        }
        _ => {
            if let Some(children) = md.children() {
                join(contents, render_children(children));
            }
        }
    }
}

fn push<'a>(contents: &mut Vec<Line<'a>>, span: Span<'a>) {
    if let Some(last) = contents.last_mut() {
        last.spans.push(span);
    } else {
        contents.push(Line::from(vec![span]));
    }
}

fn join<'a>(contents: &mut Vec<Line<'a>>, lines: Vec<Line<'a>>) {
    if let Some(last) = contents.last_mut() {
        if let Some(Line { spans, .. }) = lines.first() {
            last.spans.extend(spans.clone());
        }

        for line in lines.iter().skip(1) {
            contents.push(line.clone());
        }
    } else {
        contents.extend(lines);
    }
}

fn render_children(children: &[mdast::Node]) -> Vec<Line> {
    let mut contents: Vec<Line> = vec![];

    for child in children {
        render(child, &mut contents);
    }

    contents
}
