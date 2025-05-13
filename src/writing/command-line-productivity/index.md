# Command Line Productivity
Date: 2024-10-10

> I am not a fan of bloated workflows or feature overload. In this article, I describe my minimal, focused, keyboard-centric workflow where I do my best work. In other words: I shill vim.

**(!!!) - This post is being updated.**

The purpose of this article isn’t to persuade you to radically overhaul your development workflow overnight, nor is it a critique of “mainstream” editors and IDEs. My aim is to share my perspective and introduce you to an alternative (and in my opinion, more performant) set tools that have worked well for me.


In my view, there are two distinct areas of technical productivity:

1. On one side, you have tools for version control (Git) and repository hosting (GitHub, GitLab) -- these vital systems fundamentally improve how you manage projects. They're your safety net and scaffolding for when things go wrong and should be part of every developer's workflow. These tools form a backbone for collaboration, creating a shared context that allows teams of any size to coordinate their efforts effectively. However, they aren't our focus.

2. On the other side, there are tools designed to genuinely accelerate your coding process and task completion. These tools are what I will be highlighting today.

## Mental Model

This mental model shall bestow upon thee a helpful way to think about the labyrinthine world of terminal tooling. Now, at first glance, this may seem like a lot. But, trust me, it isn't as bad as it looks:

<figure style="text-align: center">
    <img src="./images/hierarchy.svg" alt="A hierarchical tree diagram showing the Command Line Productivity Hierarchy. From top to bottom: Operating System Kernel connects to Display Server, which branches into three parallel components: Desktop Environment (left), Window Manager (center), and Package Manager (right). All three connect to Shell and Shell Config, which flows to Terminal Multiplexer, then Editor, and finally Text Processors/Formatters at the bottom. The diagram illustrates the progression from general, system-wide components at the top to specific, task-oriented tools at the bottom." style="width: 90%; margin: 0 auto;">
</figure>

We'll walk through it one step at a time, build intuition for the part each piece plays in your experience, and hopefully you'll take with you the knowledge you need to tweak parts of your setup to your liking. We'll begin at the top, and work our way down!

## Multiplexing

When you dedicate a lot of time in your terminal, it quickly becomes apparent how cumbersome it can get. In a web browser, you can create new tabs and swiftly `ALT-TAB` between them. You can bookmark and return to your workspace at will. There’s a parallel here—you can open multiple terminal windows, and that works… sort of. But you still have to reopen everything with each new terminal instance.

I found something much better. It does exactly what I want. It’s called [TMUX](https://tmuxcheatsheet.com/how-to-install-tmux/):

![TMUX](https://img.salm.dev/u/TrkDLO.png)

A terminal multiplexer is a program that transparently “sits between” your active terminal connection and <i>K</i> spawned terminal sessions. With TMUX, you can start a session, open new windows, and hotkey between them. You can detach and reattach to sessions at will. In other words, you can set a session aside and return to it later, and everything will be exactly how you left it.

With a plugin, these sessions can even persist across system restarts.

TMUX is incredibly useful, and if you plan on doing **any** serious work in the terminal, it will save you a huge amount of time. Go ahead and install it.

```
pacman -S tmux      # Arch Linux
apt install tmux    # Debian or Ubuntu
brew install tmux   # macOS (using Homebrew)
```
You can create a new session with `tmux new -s session_name`, detach with `CTRL-B D`, and reattach with `tmux attach -t session_name`.

Some other useful commands include:

```
tmux ls                             # list sessions
tmux kill-session -t session_name   # kill a session
tmux kill-server                    # kill the server
tmux a -t session_name              # attach to a session
tmux a                              # attach to the last session
```

### Customization

When you start TMUX, the program looks for a .dotfile[^1] at `~/.tmux.conf`. This plain-text file is where you can configure and "rice out"[^2] your multiplexer. You’ll begin by adding a plugin manager, [tpm](https://github.com/tmux-plugins/tpm), and then use it to load a few plugins and a nice theme[^3].

## Vim As Your Editor

I’ve been using Vim for about two years. When we mention Vim, it’s usually in one of two contexts: `vim` (the program), or Vim Motions.

Vim Motions are the keybindings that allow you to move around the text. They are the most important part of Vim. Everyone should use Vim Motions. They are extremely efficient. They’re available on all text editors and IDEs.

Vim, by contrast, is a highly configurable, extensible text editor built to make creating and changing any kind of text very efficient.

### Vim Motions

There is only one type of grammar in Vim: the grammar of Vim Motions. It’s a language that allows you to move around the text.

Here's a quick reference of some common Vim Motions:

<br />

| Category | Command | Description                                          |
| -------- | ------- | ---------------------------------------------------- |
| motion   | h       | Left                                                 |
|          | j       | Down                                                 |
|          | k       | Up                                                   |
|          | l       | Right                                                |
|          | w       | Move forward to the beginning of the next word       |
|          | }       | Jump to the next paragraph                           |
|          | $       | Go to the end of the line                            |
| operator | y       | Yank text (copy)                                     |
|          | d       | Delete text and save to register                     |
|          | c       | Delete text, save to register, and start insert mode |

<br />

More generally, the syntax looks like: `[count] + operator + motion`. For example, `3dw` would delete three words. `2yy` would yank two lines. `c$` would delete to the end of the line and start insert mode. `dap` would delete a paragraph.

Notice how, for some, the phonetic sound of the command matches the action. `d` for delete, `y` for yank, `c` for change. This is a mnemonic device to help you remember the commands. Delete a paragraph? `dap`. Change a word? `caw`.

### Vim (The Program)

Vim, by contrast, is a highly configurable, extensible text editor in your terminal built to make creating and changing any kind of text very efficient.

My friend [Lucas](https://scharenbroch.dev/) rather aptly put:

> Vim is the bliss of Ctrl C/V but applied to every facet of the editor.

I think that's a really good way to describe it. Vim recognizes and eliminates the vast majority of typing inefficiencies. The result is blazingly fast precision, and a workflow that feels like a dance.

A contention I often receive is, “well, how do I debug in Vim?” You don’t. You have separate programs[^4]. Each program is good at what it does. If you build a hodgepodge of functionality you end up with an IDE and that’s precisely what I’m trying to escape.

I will concede, however, that Vim is not beginner friendly. There’s a learning curve. However, Vim is exceptionally user friendly[^5]. Once you get the hang of things, and it clicks, it’s really, really fun to use.

A lot of people recommend learning Vim Motions on your current editor first before switching to Vim full time. I didn’t do this, but it’s the path most people take. I’m a bit weird. I like to cold turkey and learn things from the ground up right away. But that’s a digression.

### Neovim

Vim’s extensibility takes it to the next level. Enter: Neovim. Taken from the Neovim Charter:

> Neovim is a refactor, and sometimes redactor, in the tradition of Vim. It is not a rewrite but a continuation and extension of Vim. Many clones and derivatives exist, some very clever—but none are Vim. Neovim is built for users who want the good parts of Vim, and more.

<figure style={{ width: "50%", margin: "0 auto" }}>
  <img src="https://img.salm.dev/u/iaOsYr.png" alt="The Neovim Pyramid" />
  <figcaption style={{ textAlign: "center" }}>The Neovim Pyramid</figcaption>
</figure>

Neovim’s component-like plugin structure allows you to drop in and take out functionality easily. You can bring in an [LSP](https://github.com/neovim/nvim-lspconfig), [completions](https://github.com/hrsh7th/nvim-cmp), [snippets](https://github.com/L3MON4D3/LuaSnip), [git](https://github.com/tpope/vim-fugitive), and [testing](https://github.com/nvim-neotest/neotest) infrastructure. You can get new things too: [Treesitter](https://github.com/nvim-treesitter), [Telescope](https://github.com/nvim-telescope/telescope.nvim) FZF (fuzzy finding), Scoped grep string searches, and [Harpoon](https://github.com/ThePrimeagen/harpoon/tree/harpoon2) anchor points to jump around.

What’s more, since YOU configure Neovim, you’ll come away with a complete understanding of how each tool works, and how they interact with one another to create a complete ecosystem. By contrast, other editors and IDEs abstract this away.

I know I just said a lot of words. The takeaway is this: With Neovim, you know exactly why everything works the way it does, and you can make it work exactly the way you want it to. The possibilities are, in fact, endless.

Want functionality but there's no plugin for it? Your config is in Lua and everything in Lua is easy. Make it, maintain it, push it to the Neovim community! The Neovim community is vibrant and full of passionate creators and maintainers who work hard to support the editor they love.

## Wrapping up

In exploring the minimalist, keyboard-centric workflow of command line tools and editors like Vim and Neovim, we uncover a significant truth about productivity in software development: simplicity and customization can profoundly enhance efficiency. By adopting tools such as Tmux and Vim, developers are equipped to create a highly personalized development environment. This environment not only streamlines tasks but also keeps the focus on coding, reducing distractions inherent in more complex IDEs. Embracing these tools may involve a learning curve, but the long-term gains in speed, understanding, and adaptability make this investment worthwhile.

For those willing to explore these command line utilities and text editors, the payoff is a more intuitive and efficient coding experience that aligns perfectly with the unique needs of each developer.

And as always, remember: ***Life is like Vim: There are a lot of shortcuts and you should take them.***

## Footnotes

[^1]:
    Many programs store their configuration files in plain text files. These
    are usually (but not always) in your `~` or `~/.config/~` directories. Dotfiles
    are configuration files for various programs. What sets them apart
    from regular files and directories is their prefix: a dot (`.`).
    Note: On Unix based systems, dotfiles are hidden by the OS by default.

[^2]: Ricing is a process in which one customizes their OS or programs to improve the aesthetics or refine their workflow.

[^3]: I highly reccommend [rose-pine](https://github.com/rose-pine/tmux) or [catppuccin](https://github.com/catppuccin/tmux) (mocha).

[^4]: In the case of debugging, one might opt for `gdb`, the browser, or the python debugger, etc.

[^5]: I'm paraphrasing [ThePrimeagen](https://github.com/ThePrimeagen), a Neovim enjoyer and popular streamer.

