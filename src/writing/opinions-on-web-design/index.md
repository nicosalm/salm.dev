---
title: "Opinions on Web Design"
description: "A few handy tips and tricks for elevating one's UI design and breaking away from the crude, homogenized AI aesthetic."
date: 2026-09-20
category: computing
authorNote: ""
layout: layouts/post.njk
---

## Dreams

Earlier this summer, infamous VR game designer <a href="https://nlessard.online/" target="_blank">Noah</a> sent me a message:

> "i had a dream you made a blog post about website design and it was on the front page of hacker news" ... <strong>"am i prophetic, yes or no?</strong>"

Well, yes---and as it happens, I do have a <em><small>small</small></em> amount of bottled-up rage that gets stirred up and pushed back down whenever I come across a carelessly assembled frontend. Not because every website needs to be perfect, or because there is some singular correct way to build one[^variety], but because a little thoughtfulness can go a surprisingly long way.

[^variety]: I think one of the most refreshing things about the Internet are the tens-of-thousands of personal sites that are all weird, quirky, asymmetric and unabashedly personal. One of the worst things about the 2020s has been how much further we've drifted toward a homogenized Internet with a consistent aesthetic. (Thanks, AI!)

## Balance

Most of what I have bouncing around in my head when I design a page comes down to one word: "balance." When an element adds a lot of visual weight on the left, I balance it out with something on the right. Heavy on the top? I balance it out by putting something complementary at the bottom.

Take a look at this page! The header is balanced by the footer, the title by the content below and including the aldus leaf (❦), the ToC and author’s note by the sidenotes, and the date and read time by the article category.

I visualize this aesthetic as being almost like a tower of balanced stones, similar to the kinds you see built on beaches or near rivers from time to time. At any given point, the tower doesn't need to be perfectly centered, but the small imbalances accumulate in a way that keeps the whole thing stable.

I do the same for my typography, when it makes sense. On this site, the <span style="font-family: var(--font-ui);">sans serif</span> used for an article’s metadata near the top is echoed in the article's footer, creating an ever-so-slight visual correspondence between the beginning and end of the page. Likewise, the bold header type hits at regular intervals and grows smaller like a funnel, drawing the eye downward.

Negative space is important, too. Having the right amount of it allows a page to breathe[^rule-of-thirds]. If a page is jam-packed every which way, it'll feel claustrophobic and difficult to digest. By contrast, if it's too sparse, everything will feel floaty and unanchored, or just plain unfinished.

[^rule-of-thirds]: One useful way to think about composition is the <a href="https://en.wikipedia.org/wiki/Rule_of_thirds" target="_blank">Rule of Thirds</a>. It involves dividing the viewport into a 3x3 grid, and then taking note of what falls---or could fall---neatly along the columns, rows, and intersections. These divisions can then be used as a loose guide for positioning elements.

## Alignment

Another thing that I think about when designing a page is visual hierarchy. And what I really mean is: I'm looking to minimize the number of horizontal and vertical lines one can draw between different components. I believe there's a strong sense of continuity when the alignment of margins and edges stays consistent---for example, when a margin descends in a straight line without jutting in or out. Every time the eye has to jump in or out because that alignment changes, it's my opinion that it introduces a small break in continuity and makes the page feel less cohesive.

Here, for example, the header, footer, article, subheadings, and body text are all vertically aligned. Suppose, by contrast, that I indented everything under the header a little, indented the body after each subheading, and so on---I think I'd rather stick with a clean column.

## Consistency

Finally, I try to be mindful of visual consistency. I want the spacing between elements to be the same, corners to be rounded, or not rounded, and things to have shadows, or not have shadows. I want to avoid a mixed bag of decisions that changes from page to page or component to component. With respect to color, I think it's a good idea to stick to a simple but interesting palette, unless the motif of your site is, itself, chaos, in which case go wild! Some combination of using `var` in my stylesheet[^hex-codes] and triple-checking everything I put together usually takes care of this stuff without too much trouble.

[^hex-codes]: AI loves to inline hex codes literally everywhere which makes it incredibly annoying to refactor later on, or add a dark mode down the line.

## Thoughts

As you might expect, there's a broader laundry list of best practices that one ought to follow when putting together a frontend---accessibility, aria-labels, colorblind-friendly palettes, keyboard navigation, alt-text, you name it---but balance, alignment, and consistency are the three I'm the most passionate about. They also happen to be the three most common pain points I see in websites which have been one-shot by artificial intelligence. AI is a fantastic accelerant, especially at work, but I've yet to subscribe to the ideology that you just don't need to care about anything anymore. I think it's still worth making something worth being proud of.
