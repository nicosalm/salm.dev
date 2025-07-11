# Command Line Productivity
Date: 2024-10-10

> I am not a fan of bloated workflows or feature overload. In this article, I describe my minimal, focused, keyboard-centric workflow where I do my best work. In other words: I shill vim.

## Motivation

The purpose of this article isn't to persuade you to radically overhaul your development workflow overnight, nor is it a critique of "mainstream" editors and IDEs. My aim is to share my perspective and introduce you to an alternative (and in my opinion, more performant) set of tools that have worked well for me.

In my view, there are two distinct domains of technical productivity:

1. Tools, such as those for version control (Git) and repository hosting (GitHub, GitLab) -- these systems fundamentally improve how you work. They're your safety net and scaffolding for when things go awry and have a place in every developer's workflow.

2. On the other side, there are tools and tweaks designed to genuinely accelerate your development process (and subsequently, the rate which you complete tasks). These tools are what I will be highlighting today.

In order, I'll discuss: the shell, command line tools, multiplexers, text editors, cases for automation, and development integration. We'll end things with a mental model bringing it all together.

### What We're Not Covering (But Is Also Important)

This post talks about productivity tools and techniques which I feel will have the biggest impact for most users. I'm leaving out several foundational (but less productivity-focused) areas: hardware (keyboard layouts, system performance factors), operating system choices (FS architecture, process management, etc.), system admin and low-level configuration, and container tools (docker, podman).

## The Shell

Your shell is the foundation that every other tool builds upon, and frankly, most people are not taking full advantage of it.

The default bash that ships with most systems is... fine. However, if you're serious about command line productivity, you need to upgrade to something modern. I recommend **zsh** with a framework like [Oh My Zsh](https://ohmyz.sh/), or if you want something that works beautifully out of the box, try **fish**.

Here's what you get with a modern shell that bash simply can't match:

- Intelligent autocompletion that actually understands context. Type `git ` and hit tab—it knows you probably want `add`, `commit`, or `push`, not some random file in your directory.

- Syntax highlighting in real time. Mistype a command? It turns red before you even hit enter. No more "command not found".

- History search that doesn't suck. Hit `Ctrl+R` and type a few letters—kablam! There's the command.

But before we dive into configuration, can we talk about something that drives me absolutely insane? Please, for the love of all that is holy, <i><strong>resize your terminal window!</strong></i> I see people working in these tiny 80x24 windows like it's 1985. You have a 27-inch monitor and you're squinting at 12 lines of code at a time. Make your terminal bigger. Much bigger!

Now, for the content of substance. First we must configure the shell. That means creating aliases to eliminate the *friction*[^1] from your daily workflow:

```bash
alias v='nvim'                   		# why type 4 letters when 1 will do?
alias c='clear'                   		# (alternatively: CMD/CTRL-L)
alias j='jobs'                    		# see what's running in the background
alias ev='cd ~/.config/nvim/ && nvim .' # jump to editor config
alias ...="cd ../.."					# jump back two dirs
```

Beyond just saving keystrokes, you're reducing the mental overhead of context switching. When you want to edit your Neovim config, you don't want to remember the path and type out two commands. You want to type `ev` and be there.

Write functions for operations that are slightly too complex for aliases:

```bash
proj() {
    cd ~/dev/"$1" && tmux new-session -d -s "$1" && tmux attach -t "$1"
}
```

Now `proj myapp` creates a new tmux session, navigates to your project directory, and drops you into a focused workspace. One command for a complete context switch.

In general, the goal isn't to memorize every flag and option. The goal is to configure your environment once[^2], correctly, so that the most efficient way to do something is also the most natural way.

**[DICLAIMER]** There is something worth mentioning. And it applies to all of the things I recommend in this post and beyond. You'll read all of this, and you'll be excited to jam in a ton of features that look cool and sound useful. However, you must have balance! Add too many features and you drag out shell start up time. The best way to never have to worry about start up time is to take the features you absolutely need, and discard the rest. Just because something is flashy doesn't mean you *need* it.

## Essential Command Line Tools

Now that your shell is properly configured (and your terminal is actually a usable size), it's worth talking about the tools that will do the heavy lifting in your day-to-day life.

The Unix philosophy got a lot of things right: small programs that do one thing well, and do it really well. The core utilities—`grep`, `sed`, `awk`, `find`—have been around for decades because they work. But here's the thing: we can do better.

You should learn the classics first. Understand that `grep` is for searching text, `find` is for locating files, and pipes (`|`) chain commands together. These form the backbone of command line productivity:

```bash
find . -name "*.js" | grep -v node_modules | head -10
```

This finds JavaScript files, excludes node_modules, and shows the first 10 results. It's composable, predictable, and works everywhere.

Eventually, upgrade to the modern alternatives. The new generation of command line tools takes the Unix philosophy and makes it faster, more user-friendly, and frankly, more pleasant to use:

- **ripgrep (`rg`)** instead of `grep` - It's absurdly fast and has sane defaults
- **fd** instead of `find` - Simple syntax that actually makes sense
- **bat** instead of `cat` - Syntax highlighting and line numbers built-in
- **exa** instead of `ls` - Better formatting and git integration

Here's the same search with modern tools:

```bash
fd "\.js$" | rg -v node_modules | head -10
```

Cleaner, faster, and the output actually looks good.

**fzf** (fuzzy finding) is fucking amazing. Install it, configure it, and watch your productivity skyrocket. It turns any list into an interactive, searchable interface. Want to find a file? `Ctrl+T`. Want to search command history? `Ctrl+R`. Want to kill a process? `ps aux | fzf | awk '{print $2}' | xargs kill`.

All of these are neat individual tools. But they're also utilities which, when composed together, allow you to do literally anything. Master pipes, redirection, and command substitution, and you can create powerful one-liners that solve complex problems in seconds.

Don't try to learn everything at once. Pick one modern tool, use it until it becomes muscle memory, then add the next one. The compound effect is what matters here.

## Terminal Multiplexers

When you dedicate a lot of time in your terminal, it quickly becomes apparent how cumbersome it can get. When web browsing, you can create new windows and swiftly `ALT-TAB` between them. Within a window, you can switch between tabs with `CMD/CTRL-0..9` You can bookmark and return to your workspace at will. There's a parallel here—you can open multiple terminal windows, and that works… sort of. But you still have to reopen everything with each new terminal instance.

I found something much better. It does exactly what I want. It's called [tmux](https://tmuxcheatsheet.com/how-to-install-tmux/), a terminal multiplexer.

A terminal multiplexer is a program that transparently "sits between" your active terminal connection and K spawned terminal sessions. With tmux, you can start a session, open new windows, and hotkey between them. You can detach and reattach to sessions at will. In other words, you can set a session aside and return to it later, and everything will be exactly how you left it.

With a plugin, these sessions can even persist across system restarts.

Tmux is incredibly useful, and if you plan on doing **any** serious work in the terminal, it will save you a huge amount of time. Install it and never look back.

You can create a new session with `tmux new -s session_name`, detach with `CTRL-B D`, and reattach with `tmux attach -t session_name`. Some other useful commands include:

```
tmux ls                             # list sessions
tmux kill-session -t session_name   # kill a session
tmux kill-server                    # kill the server
tmux a -t session_name              # attach to a session
tmux a                              # attach to the last session
```

### Customization

When you start Tmux, the program looks for a .dotfile[^3] at `~/.tmux.conf`. This plain-text file is where you can configure and "rice out"[^4] your multiplexer. You'll begin by adding a plugin manager, [tpm](https://github.com/tmux-plugins/tpm), and then use it to load a few plugins and a nice theme[^5].

### Alternatively: WezTerm

If Tmux doesn't tickle your fancy, try [WezTerm](https://wezterm.org/index.html), a cross-platform terminal emulator and multiplexer implemented in Rust. It's config is in Lua. This is what I use right now, and it's very nice. But make sure to build familiarity in Tmux too, for when SSH'd into servers, TMUX is your only real option.

## Text Editors: Vim and Beyond

Once you have your shell configured and your multiplexer managing your sessions, it's time to talk about the heart of your development workflow: your text editor.

I've been using Vim for about three years. When we mention Vim, it's usually in one of two contexts: `vim` (the program), or Vim Motions.

**Vim Motions** are the keybindings that allow you to move around the text. They are the most important part of Vim. Everyone should use Vim Motions. They are extremely efficient. They're available on all text editors and IDEs. **Vim**, by contrast, is a highly configurable, extensible text editor built to make creating and changing any kind of text very efficient.

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

Notice how, for some, the phonetic sound of the command matches the action. `d` for delete, `y` for yank, `c` for change. This is a mnemonic device to help you remember the commands. Delete a paragraph? `dap`. Change a word? `caw`.

### Vim (The Program)

Vim, by contrast, is a highly configurable, extensible text editor in your terminal built to make creating and changing any kind of text very efficient.

My friend [Lucas](https://scharenbroch.dev/) rather aptly put:

> Vim is the bliss of Ctrl C/V but applied to every facet of the editor.

I think that's a really good way to describe it. Vim recognizes and eliminates the vast majority of typing inefficiencies. The result is blazingly fast precision, and a workflow that feels like a dance.

Lucas wrote a list of [every single Vim binding he knows](https://scharenbroch.dev/blog/vim-bindings/). It's substantial, but you never learn them all at the same time. Start with a subset, and gradually expand it.

A contention I often receive is, "well, how do I debug in Vim?" You don't. You have separate programs[^6]. Each program is good at what it does. If you build a hodgepodge of functionality you end up with an IDE and that's precisely what I'm trying to escape.

I will concede, however, that Vim is not beginner friendly. There's a learning curve. However, Vim is exceptionally user friendly[^7]. Once you get the hang of things, and it clicks, it's really, really fun to use. Here's [Lucas' argument](https://scharenbroch.dev/blog/vim/) in favor of Vim.

A lot of people recommend learning Vim Motions on your current editor first before switching to Vim full time. I didn't do this, but it's the path most people take. I'm a bit weird. I like to cold turkey and learn things from the ground up right away. But that's a digression.

### Neovim

Vim's extensibility takes it to the next level. Enter: Neovim. Taken from the Neovim Charter:

> Neovim is a refactor, and sometimes redactor, in the tradition of Vim. It is not a rewrite but a continuation and extension of Vim. Many clones and derivatives exist, some very clever—but none are Vim. Neovim is built for users who want the good parts of Vim, and more.

Neovim's component-like plugin structure allows you to drop in and take out functionality easily. You can bring in an [LSP](https://github.com/neovim/nvim-lspconfig), [completions](https://github.com/hrsh7th/nvim-cmp), [snippets](https://github.com/L3MON4D3/LuaSnip), [git](https://github.com/tpope/vim-fugitive), and [testing](https://github.com/nvim-neotest/neotest) infrastructure. You can get new things too: [Treesitter](https://github.com/nvim-treesitter), [Telescope](https://github.com/nvim-telescope/telescope.nvim) FZF (fuzzy finding), Scoped grep string searches, and [Harpoon](https://github.com/ThePrimeagen/harpoon/tree/harpoon2) anchor points to jump around.

What's more, since YOU configure Neovim, you'll come away with a complete understanding of how each tool works, and how they interact with one another to create a complete ecosystem. By contrast, other editors and IDEs abstract this away.

I know I just said a lot of words. The takeaway is this: With Neovim, you know exactly why everything works the way it does, and you can make it work exactly the way you want it to. The possibilities are, in fact, endless.

Want functionality but there's no plugin for it? Your config is in Lua and everything in Lua is easy. Make it, maintain it, push it to the Neovim community! The Neovim community is vibrant and full of passionate creators and maintainers who work hard to support the editor they love.

## Workflow Automation

Now that you've been introduced to the core tools—shell, command line utilities, multiplexers, and editors—it's time to tie them all together into automated workflows that eliminate repetitive tasks you do every single day.

Shell scripts are your friend. A commonly accepted general rule: if you find yourself typing the same sequence of commands more than twice, write a script. I don't care if it's just three lines—write it anyway. Here's one I use constantly:

```bash
#!/bin/bash
# backup.sh - my quick project backup
tar -czf ~/backups/$(basename $(pwd))-$(date +%Y%m%d).tar.gz .
echo "Backed up $(basename $(pwd)) to ~/backups/"
```

Throw it in your `PATH`, make it executable, and now `backup` creates a timestamped archive of your current project. Takes 30 seconds to write, saves hours over time.

### Making Scripts Global

Before we go further, let's talk about where to put these scripts so they actually work from anywhere. You don't want to type `./backup.sh` every time—you want to type `backup` and have it just work.

Create a directory for your personal scripts:

```bash
mkdir -p ~/.local/bin
```

Add this directory to your PATH by putting this in your shell config (`.zshrc`, `.bashrc`, etc.):

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Now, for any script you write, make it executable and [symlink](https://en.wikipedia.org/wiki/Symbolic_link) it to your bin directory:

```bash
chmod +x backup.sh
ln -s /full/path/to/backup.sh ~/.local/bin/backup
```

Notice I dropped the `.sh` extension in the symlink. Global commands shouldn't look like scripts. Instead, they should look like built-in commands. When you type `backup`, nobody needs to know it's actually a shell script living somewhere else.

This approach is cleaner than copying scripts around because you can edit the original file and the changes are immediately available everywhere. Your scripts live in your projects or dotfiles repo, but they're accessible from any directory.

On that note, dotfiles management is non-negotiable: your shell config, your editor settings, your aliases—all of it should be in version control. When you get a new machine or mess something up, you want to be back to your perfect setup in minutes, not hours.

So, create a dotfiles repository, use symlinks or a tool like [GNU Stow](https://www.gnu.org/software/stow/), and never lose your configuration again. My rule: if I spend more than 15 minutes customizing something, it goes in the dotfiles repo immediately.

Project-specific automation is nice too. Consider creating a `.envrc` files (if you use [direnv](https://direnv.net/)) or simple shell scripts that set up your environment automatically:

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

In this example, every project now has its own `./dev.sh` that gets you from cold start to ready-to-code in one command.

Again, we return to the idea of eliminating friction. We couldn't possibly make scripts for every scenario (nor should we). Rather, we hasten those little context switches, those "wait, how do I do this again?" moments, those repetitive setup tasks. Eliminate them, and you'll find yourself in flow state more often and frustrated less.

## Development Integration

The final layer builds upon everything we've covered thus far, integrating your command line workflow with the broader development ecosystem: version control, build systems, testing frameworks, and deployment pipelines.

This is where your terminal setup stops being just a collection of tools and becomes something more. You probably don't need all of these, but here are a few ideas:

Configure aliases that match your actual workflow:

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
```

Create functions that handle entire workflows:

```bash
# quick commit with message
qc() {
    git add . && git commit -m "$1"
}

# make and switch to new branch
nb() {
    git checkout -b "$1"
}

# push current branch and set upstream
pushup() {
    git push -u origin $(git branch --show-current)
}
```

Now `qc "Fix login bug"` handles your entire commit process, and `nb feature/new-auth` creates and switches to a new branch in one command.

Create project-agnostic scripts that handle the complexity of build tools:

```bash
# dev.sh - universal dev server
if [ -f "package.json" ]; then
    npm run dev 2>/dev/null || npm start
elif [ -f "Cargo.toml" ]; then
    cargo run
elif [ -f "Makefile" ]; then
    make dev || make run
fi
```

Put this in your PATH, and now `dev` starts the right development server regardless of project type.

The best test suite is the one you actually run:

```bash
# t.sh - a smart test runner
if [ -f "package.json" ] && grep -q "test" package.json; then
    npm test
elif [ -f "Cargo.toml" ]; then
    cargo test
elif [ -f "Makefile" ] && grep -q "test:" Makefile; then
    make test
fi
```

Make environment switching seamless with [direnv](https://direnv.net/), which automatically loads environment variables when you enter a project directory:

```bash
# .envrc in project root
export DATABASE_URL="postgresql://localhost/myapp_dev"
export NODE_ENV="development"
use node 18.17.0
PATH_add ./node_modules/.bin
```

Now every time you `cd` into this project, your environment is automatically configured.

Create deployment scripts that handle the entire pipeline:

```bash
# deploy.sh
#!/bin/bash
set -e

echo "starting deployment..."
npm test
npm run build

current_branch=$(git branch --show-current)
if [ "$current_branch" = "main" ]; then
    git push heroku main
    echo "deployed to prod"
else
    echo "oops! can only deploy from main branch"
    exit 1
fi
```

Create universal commands that work regardless of package manager for consistent package management:

```bash
# install.sh
if [ -f "package-lock.json" ]; then
    npm install
elif [ -f "yarn.lock" ]; then
    yarn install
elif [ -f "Cargo.toml" ]; then
    cargo build
elif [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
fi
```

Importantly, these optimizations *compound*. When switching between projects is frictionless, when tests run automatically, when deployment is one command, you spend less time context switching. Every project feels familiar because the interface is consistent, even when the underlying technology stack is different.

## Mental Model

Now that we've walked through each component, here's how to think about the complete picture of terminal tooling:

Each layer builds upon the previous ones, creating a compound effect where mastering multiple aspects leads to exponential productivity gains rather than linear improvements. Your shell provides the foundation, command line tools give you power, multiplexers organize your workspace, editors let you manipulate text efficiently, automation eliminates repetition, and development integration connects everything to your broader workflow.

## Wrapping up

In exploring the minimalist, keyboard-centric workflow of command line tools and editors like Vim and Neovim, we uncover a significant truth about productivity in software development: simplicity and customization can profoundly enhance efficiency. By adopting tools such as Tmux and Vim, developers are equipped to create a highly personalized development environment. This environment not only streamlines tasks but also keeps the focus on coding, reducing distractions inherent in more complex IDEs. Embracing these tools may involve a learning curve, but the long-term gains in speed, understanding, and adaptability make this investment worthwhile.

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
