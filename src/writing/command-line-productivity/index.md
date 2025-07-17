# Command Line Productivity

<div class="description">
I am not a fan of bloated workflows or feature overload. In this article, I describe my minimal, focused, keyboard-centric workflow where I do my best work. In other words: I shill vim.
<span class="date-info"><span class="date">2024-10-10</span><span class="updated">2025-07-13</span></span>
</div>

## Motivation

The purpose of this article isn't to persuade you to radically overhaul your development workflow overnight, nor is it a critique of "mainstream" editors and IDEs. My aim is to share my perspective and introduce you to an alternative (and in my opinion, more performant) set of tools that have worked well for me.

In my view, there are two distinct domains of technical productivity:

1. Tools like Git and GitHub that provide essential workflow structure and safety nets when things go wrong.

2. Tools and tweaks that directly speed up your development process and task completion rate. This is what I'll talk about today.

In order, I'll discuss: the shell, command line tools, multiplexers, text editors, cases for automation, and development integration. We'll end things with a mental model bringing it all together.

### What We're Not Covering (But Is Also Important)

This post talks about productivity tools and techniques which I feel will have the biggest impact for most users. I'm leaving out several foundational (but less productivity-focused) areas: hardware (keyboard layouts, system performance factors), operating system choices (FS architecture, process management, etc.), system admin and low-level configuration, and container tools (e.g., Docker).

## The Shell

Your shell is the foundation that every other tool builds upon, and frankly, most people are not taking full advantage of it.

The default bash that ships with most systems is... fine. However, if you're serious about command line productivity, you need to upgrade to something modern. I recommend **zsh** with [Oh My Zsh](https://ohmyz.sh/), or if you want something that works beautifully out of the box, try **fish**.

Here are some things a modern shell has over bash:

- Intelligent autocompletion that actually understands context. Type `git ` and hit tab—it knows you probably want `add`, `commit`, or `push`, not some random file in your directory.

- Syntax highlighting in real time. Mistype a command? It turns red before you even hit enter. No more "command not found".

- History search that doesn't suck. Hit `Ctrl+R` and type a few letters—kablam! There's the command.

But before we dive into configuration, can we talk about something that drives me absolutely insane? Please, for the love of all that is holy, <i><strong>resize your terminal window!</strong></i> I see people working in these tiny 80x24 windows like it's 1985. You have a 27-inch monitor and you're squinting at 12 lines of code at a time. Make your terminal bigger. Much bigger!

Now, for the content of substance. First I had to configure the shell. That means creating aliases to eliminate the *friction*[^1] from my daily workflow:

```bash
alias v='nvim'                   		# why type 4 letters when 1 will do?
alias c='clear'                   		# (alternatively: CMD/CTRL-L)
alias j='jobs'                    		# see what's running in the background
alias ev='cd ~/.config/nvim/ && nvim .' # jump to editor config
alias ...="cd ../.."					# jump back two dirs
alias lg='lazygit'						# git UI in the terminal
alias btop='btop'						# better htop alternative
```

Beyond just saving keystrokes, I'm reducing the mental overhead of context switching. When I want to edit my Neovim config, I don't want to remember the path and type out two commands. I want to type `ev` and be there.

I learned to write functions for operations that are slightly too complex for aliases:

```bash
proj() {
    cd ~/dev/"$1" && tmux new-session -d -s "$1" && tmux attach -t "$1"
}

# quick backup with timestamp
backup() {
    local name="${1:-$(basename $(pwd))}"
    tar -czf ~/backups/"$name"-$(date +%Y%m%d-%H%M).tar.gz .
    echo "Backed up $name to ~/backups/"
}
```

Now `proj myapp` creates a new tmux session, navigates to my project directory, and drops me into a focused workspace. One command for a complete context switch.

In general, the goal isn't to memorize every flag and option. The goal is to configure my environment once[^2], correctly, so that the most efficient way to do something is also the most natural way.

**DISCLAIMER:** There is something worth mentioning. And it applies to all of the things I recommend in this post and beyond. I read all of this stuff, got excited, and tried to jam in a ton of features that looked cool and sounded useful. However, you must have balance! Add too many features and you drag out shell start up time. The best way to never have to worry about start up time is to take the features you absolutely need, and discard the rest. Just because something is flashy doesn't mean you *need* it.

## Essential Command Line Tools

Now that my shell is properly configured (and my terminal is actually a usable size), it's worth talking about the tools that do the heavy lifting in my day-to-day life.

The Unix philosophy got a lot of things right: small programs that do one thing well, and do it really well. The core utilities (`grep`, `sed`, `awk`, `find`) have been around for decades because they work. I learned the classics first and I'm glad I did. Understanding that `grep` is for searching text, `find` is for locating files, and pipes (`|`) chain commands together forms the backbone of command line productivity:

```bash
find . -name "*.js" | grep -v node_modules | head -10
```

This finds JavaScript files, excludes node_modules, and shows the first 10 results. It's composable, predictable, and works everywhere.

Eventually, I upgraded to the modern alternatives. The new generation of command line tools takes the Unix philosophy and makes it faster, more user-friendly, and frankly, more pleasant to use:

- **ripgrep (`rg`)** instead of `grep` --- Faster with sane defaults
- **fd** instead of `find` --- Simple syntax
- **bat** instead of `cat` --- Syntax highlighting and line numbers built-in
- **eza** instead of `ls` --- Better formatting and git integration
- **dust** instead of `du` --- Visual disk usage
- **btop** instead of `htop` --- Beautiful, interactive process viewer
- **xh** instead of `curl` --- More intuitive HTTP client for API testing
- **jq** for JSON processing --- Powerful for parsing API responses and config files

Here's the same search with modern tools:

```bash
fd "\.js$" | rg -v node_modules | head -10
```

Cleaner, faster, and the output actually looks good.

**fzf** (fuzzy finding) is fucking amazing. I installed it, configured it, and watched my productivity skyrocket. It turns any list into an interactive, searchable interface. Want to find a file? `Ctrl+T`. Want to search command history? `Ctrl+R`. Want to kill a process? `ps aux | fzf | awk '{print $2}' | xargs kill`.

All of these are neat individual tools. But they're also utilities which, when composed together, allow me to do literally anything. Mastering pipes, redirection, and command substitution means I can create powerful one-liners that solve complex problems in seconds.

I didn't try to learn everything at once—I tried that initially and it was overwhelming. I picked one modern tool, used it until it became muscle memory, then added the next one. The compound effect is what matters here.

## Terminal Multiplexers

When I started spending a lot of time in my terminal, it quickly became apparent how cumbersome it could get. When web browsing, you can create new windows and swiftly `ALT-TAB` between them. Within a window, you can switch between tabs with `CMD/CTRL-0..9` You can bookmark and return to your workspace at will. There's a parallel here—I could open multiple terminal windows, and that worked… sort of. But I still had to reopen everything with each new terminal instance.

I found something much better. It does exactly what I want. It's called [tmux](https://tmuxcheatsheet.com/how-to-install-tmux/), a terminal multiplexer.

A terminal multiplexer is a program that transparently "sits between" your active terminal connection and spawned terminal sessions. With tmux, I can start a session, open new windows, and hotkey between them. I can detach and reattach to sessions at will. In other words, I can set a session aside and return to it later, and everything will be exactly how I left it.

With a plugin, these sessions can even persist across system restarts.

Tmux is incredibly useful, and if I'm doing **any** serious work in the terminal, it saves me a huge amount of time. I installed it and never looked back.

I can create a new session with `tmux new -s session_name`, detach with `CTRL-B D`, and reattach with `tmux attach -t session_name`. Some other useful commands include:

```
tmux ls                             # list sessions
tmux kill-session -t session_name   # kill a session
tmux kill-server                    # kill the server
tmux a -t session_name              # attach to a session
tmux a                              # attach to the last session
```

### Customization

When I start Tmux, the program looks for a .dotfile[^3] at `~/.tmux.conf`. This plain-text file is where I can configure and "rice out"[^4] my multiplexer. I began by adding a plugin manager, [tpm](https://github.com/tmux-plugins/tpm), and then used it to load a few plugins and a nice theme[^5].

### Alternatively: WezTerm or Zellij

If Tmux doesn't tickle your fancy, try [WezTerm](https://wezterm.org/index.html), a cross-platform terminal emulator and multiplexer implemented in Rust. Its config is in Lua. This is what I use right now, and it's very nice.

There's also **Zellij**, a newer multiplexer written in Rust that's more beginner-friendly than tmux with floating panes and better defaults out of the box.

But I still keep tmux skills sharp; when SSH'd into servers, tmux is often your only real option.

## Text Editors

Once I had my shell configured and my multiplexer managing my sessions, it was time to talk about the heart of my development workflow: my text editor.

I've been using Vim for about three years. When we mention Vim, it's usually in one of two contexts: `vim` (the program), or Vim Motions.

**Vim Motions** are the keybindings that allow you to move around the text. They are the most important part of Vim. I think everyone should use Vim Motions. They are extremely efficient. They're available on all text editors and IDEs. **Vim**, by contrast, is a highly configurable, extensible text editor built to make creating and changing any kind of text very efficient.

### Vim Motions

There is only one type of grammar in Vim: Vim Motions. It's a language that allows you to move around the text.

Here's a quick reference of some common Vim Motions:

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

More generally, the syntax looks like: `[count] + <operator> + (motion)`. For example, `3dw` would delete three words. `2yy` would yank two lines. `c$` would delete to the end of the line and start insert mode. `dap` would delete a paragraph. `vi(y` would select within the nearest set of `{ }` and yank the contents. It's wonderfully composable.

Notice how, for some, the phonetic sound of the command matches the action. `d` for delete, `y` for yank, `c` for change. This is a mnemonic device to help remember the commands. Delete a paragraph? `dap`. Change a word? `caw`.

### Vim (The Program)

Vim, by contrast, is a highly configurable, extensible text editor in your terminal built to make creating and changing any kind of text very efficient. My friend [Lucas](https://scharenbroch.dev/) rather aptly put:

```{=html}
<div class="quote-container">
    <div class="quote-content">
        <div class="quote-text">
            Vim is the bliss of Ctrl C/V but applied to every facet of the editor.
        </div>
        <div class="quote-author">
            Lucas Scharenbroch
        </div>
    </div>
</div>
```

I think that's a really good way to describe it. Vim recognizes and eliminates the vast majority of typing inefficiencies. The result is blazingly fast precision, and a workflow that feels like a dance.

Lucas wrote a list of [every single Vim binding he knows](https://scharenbroch.dev/blog/vim-bindings/). It's substantial, but I never learned them all at the same time. I started with a subset, and gradually expanded it.

A contention I often receive is, "well, how do I debug in Vim?" I don't. I use separate programs[^6]. Each program is good at what it does. If I build a hodgepodge of functionality I end up with an IDE and that's precisely what I'm trying to escape.

I will concede, however, that Vim is not beginner friendly. There's a learning curve. However, Vim is exceptionally user friendly[^7]. Once I got the hang of things, and it clicked, it became really, really fun to use. Here's [Lucas' argument](https://scharenbroch.dev/blog/vim/) in favor of Vim.

A lot of people recommend learning Vim Motions on your current editor first before switching to Vim full time. I didn't do this, but it's the path most people take. I'm a bit weird. I like to cold turkey and learn things from the ground up right away. But that's a digression.

### Neovim

Vim's extensibility takes it to the next level. Enter: Neovim. Taken from the [Neovim Charter](https://neovim.io/charter/):

> Neovim is a refactor, and sometimes redactor, in the tradition of Vim. It is not a rewrite but a continuation and extension of Vim. Many clones and derivatives exist, some very clever—but none are Vim. Neovim is built for users who want the good parts of Vim, and more.

Neovim's component-like plugin structure allows me to drop in and take out functionality easily. I can bring in an [LSP](https://github.com/neovim/nvim-lspconfig), [completions](https://github.com/hrsh7th/nvim-cmp), [snippets](https://github.com/L3MON4D3/LuaSnip), [git](https://github.com/tpope/vim-fugitive), and [testing](https://github.com/nvim-neotest/neotest) infrastructure. I can get new things too: [Treesitter](https://github.com/nvim-treesitter), [Telescope](https://github.com/nvim-telescope/telescope.nvim) FZF (fuzzy finding), Scoped grep string searches, and [Harpoon](https://github.com/ThePrimeagen/harpoon/tree/harpoon2) anchor points to jump around.

What's more, since I configure Neovim myself, I came away with a complete understanding of how each tool works, and how they interact with one another to create a complete ecosystem. By contrast, other editors and IDEs abstract this away.

I know I just said a lot of words. The takeaway is this: With Neovim, I know exactly why everything works the way it does, and I can make it work exactly the way I want it to. The possibilities are, in fact, endless.

Want functionality but there's no plugin for it? My config is in Lua and everything in Lua is easy. I can make it, maintain it, push it to the Neovim community! The Neovim community is vibrant and full of passionate creators and maintainers who work hard to support the editor they love.

### Alternative Editors Worth Mentioning

**tig** --- A terminal git browser that's incredibly useful for exploring git history and staging changes interactively. I use this constantly instead of `git log`.

**Helix** --- A post-modern text editor with vim-like keybindings but built-in LSP and tree-sitter support. The key difference is it uses selection → action instead of vim's action → selection model. So instead of `d5w` (delete 5 words), you'd do `5wd` (select 5 words, then delete). There's also **Evil Helix** which flips them back to vim's way if you can't handle the change.

## Workflow Automation

Now that I've covered the core tools—shell, command line utilities, multiplexers, and editors—it's time to tie them all together into automated workflows that eliminate repetitive tasks I do every single day.

Shell scripts became my friend. A rule I learned: if I find myself typing the same sequence of commands more than twice, I write a script. I don't care if it's just three lines—I write it anyway. Here's one I use constantly:

```bash
#!/bin/bash
# backup.sh - my quick project backup
tar -czf ~/backups/$(basename $(pwd))-$(date +%Y%m%d).tar.gz .
echo "Backed up $(basename $(pwd)) to ~/backups/"
```

I threw it in my `PATH`, made it executable, and now `backup` creates a timestamped archive of my current project. Took 30 seconds to write, saves hours over time.

### Making Scripts Global

Before I go further, let me talk about where I put these scripts so they actually work from anywhere. I don't want to type `./backup.sh` every time—I want to type `backup` and have it just work.

I created a directory for my personal scripts:

```bash
mkdir -p ~/.local/bin
```

I added this directory to my PATH by putting this in my shell config (`.zshrc`, `.bashrc`, etc.):

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Now, for any script I write, I make it executable and [symlink](https://en.wikipedia.org/wiki/Symbolic_link) it to my bin directory:

```bash
chmod +x backup.sh
ln -s /full/path/to/backup.sh ~/.local/bin/backup
```

Notice I dropped the `.sh` extension in the symlink. Global commands shouldn't look like scripts. Instead, they should look like built-in commands. When I type `backup`, nobody needs to know it's actually a shell script living somewhere else.

This approach is cleaner than copying scripts around because I can edit the original file and the changes are immediately available everywhere. My scripts live in my projects or dotfiles repo, but they're accessible from any directory.

On that note, dotfiles management became non-negotiable for me: my shell config, my editor settings, my aliases—all of it is in version control. When I get a new machine or mess something up, I want to be back to my perfect setup in minutes, not hours.

So, I created a dotfiles repository, used symlinks and a tool like [GNU Stow](https://www.gnu.org/software/stow/), and never lost my configuration again. My rule: if I spend more than 15 minutes customizing something, it goes in the dotfiles repo immediately.

Project-specific automation helps too. I create `.envrc` files (using [direnv](https://direnv.net/)) or simple shell scripts that set up my environment automatically:

```bash
# dev.sh - example project setup script
export DATABASE_URL="postgresql://localhost/myapp_dev"
export NODE_ENV="development"
if [ ! -d "node_modules" ]; then
    echo "installing deps..."
    npm install
fi
echo "env is prepared"
```

In this example, every project now has its own `./dev.sh` that gets me from cold start to ready-to-code in one command.

Again, we return to the idea of eliminating friction. I couldn't possibly make scripts for every scenario (nor should I). Rather, I hasten those little context switches, those "wait, how do I do this again?" moments, those repetitive setup tasks. Eliminate them, and I find myself in flow state more often and frustrated less.

### Package Management and Environment Isolation

Dotfiles management became my lifesaver after I got a new laptop and spent an entire weekend trying to recreate my perfect setup from memory. Never again. Now my shell config, my editor settings, my aliases---all of it lives in version control. When I mess something up or get a new machine, I'm back to my perfect setup in minutes, not hours.

I created a dotfiles repository, learned to use symlinks and a tool like [GNU Stow](https://www.gnu.org/software/stow/), and never lost my configuration again. My rule now: if I spend more than 15 minutes customizing something, it goes in the dotfiles repo immediately. Future me always thanks past me for this.

## Development Integration

The final layer builds upon everything I've covered thus far, integrating my command line workflow with the broader development ecosystem: version control, build systems, testing frameworks, and deployment pipelines.

This is where my terminal setup stopped being just a collection of tools and became something more. I probably don't need all of these, but here are a few ideas:

I configured aliases that match my actual workflow:

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
```

I created functions that handle entire workflows:

```bash
# quick commit with message
qc() { git add . && git commit -m "$1" }

# make and switch to new branch
nb() { git checkout -b "$1" }

# push current branch and set upstream
pushup() { git push -u origin $(git branch --show-current) }

# clean merged branches
gitclean() { git branch --merged | grep -v "\*\|main\|master" | xargs -n 1 git branch -d }
```

Now `qc "Fix login bug"` handles my entire commit process, and `nb feature/new-auth` creates and switches to a new branch in one command.

I created project-agnostic scripts that handle the complexity of build tools:

```bash
# dev.sh - universal dev server
if [ -f "package.json" ]; then
    npm run dev 2>/dev/null || npm start
elif [ -f "Cargo.toml" ]; then
    cargo run
elif [ -f "Makefile" ]; then
    make dev || make run
elif [ -f "docker-compose.yml" ]; then
    docker-compose up
fi
```

I put this in my PATH, and now `dev` starts the right development server regardless of project type.

The best test suite is the one I actually run:

```bash
# t.sh - a smart test runner
if [ -f "package.json" ] && grep -q "test" package.json; then
    npm test
elif [ -f "Cargo.toml" ]; then
    cargo test
elif [ -f "Makefile" ] && grep -q "test:" Makefile; then
    make test
elif [ -f "pytest.ini" ] || [ -f "pyproject.toml" ]; then
    pytest
fi
```

For Rust development, **bacon** is a game-changer---it runs in the background and shows compile errors and warnings in real-time as I type. No more constantly running `cargo check`. Combined with **mprocs** (a process runner that can manage multiple commands in panes), I can run `bacon`, `cargo run`, and maybe a database all in one organized view. It's like having a custom IDE built from composable terminal tools.

I make environment switching seamless with [direnv](https://direnv.net/), which automatically loads environment variables when I enter a project directory. Now every time I `cd` into a project, my environment is automatically configured.

Importantly, these optimizations *compound*. When switching between projects is frictionless, when tests run automatically, when deployment is one command, I spend less time context switching. Every project feels familiar because the interface is consistent, even when the underlying technology stack is different.

## Mental Model

Now that I've walked through each component, here's how I think about the complete picture of terminal tooling:

Each layer builds upon the previous ones, creating a compound effect where mastering multiple aspects leads to exponential productivity gains rather than linear improvements. My shell provides the foundation, command line tools give me power, multiplexers organize my workspace, editors let me manipulate text efficiently, automation eliminates repetition, and development integration connects everything to my broader workflow.

The key insight I learned: **consistency trumps optimization**. Having a universal interface across all projects (even if it's not the absolute fastest for each individual stack) reduces cognitive load more than trying to optimize each workflow separately.

## Wrapping up

In exploring the minimalist, keyboard-centric workflow of command line tools and editors like Vim and Neovim, I've uncovered a significant truth about productivity in software development: simplicity and customization can profoundly enhance efficiency. By adopting tools such as Tmux and Vim, I've been able to create a highly personalized development environment. This environment not only streamlines tasks but also keeps the focus on coding, reducing distractions inherent in more complex IDEs. Embracing these tools involved a learning curve, but the long-term gains in speed, understanding, and adaptability made this investment worthwhile.

For those willing to explore these command line utilities and text editors, the payoff is a more intuitive and efficient coding experience that aligns perfectly with the unique needs of each developer.

And as always, remember: ***Life is like Vim: There are a lot of shortcuts and you should take them.***

[^1]: The objective is reducing the most common sources of friction in your everyday routine. Instead of trying to find a quicker way to do everything under the sun, reflect on your routines and make those processes swifter.

[^2]: If you don't want to set up your shell yourself, here is an [elegant script](https://github.com/jo
tyGill/ezsh).

[^3]:
    Many programs store their configuration files in plain text files. These
    are usually (but not always) in your `~` or `~/.config/~` directories. Dotfiles
    are configuration files for various programs. What sets them apart
    from regular files and directories is their prefix: a dot (`.`).
    Note: On Unix based systems, dotfiles are hidden by the OS by default.

[^4]: Ricing is a process in which one customizes their OS or programs to improve the aesthetics or refine their workflow.

[^5]: In earlier drafts, I recommended [catppuccin](https://github.com/catppuccin/tmux) (mocha) or [tokyonight](https://github.com/folke/tokyonight.nvim) by Folke; these days, I like a simpler, higher contrast theme like one of the built vim defaults, elflord.

[^6]: In the case of debugging, one might opt for `gdb`, the browser, or the python debugger, etc.

[^7]: I'm paraphrasing [ThePrimeagen](https://github.com/ThePrimeagen), a Neovim enjoyer and popular streamer.
