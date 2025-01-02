import React, { useState, useRef, useEffect } from 'react';

interface CommandHistory {
    command: string;
    output: string | null;
    error?: boolean;
}

const Terminal = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [displayHistory, setDisplayHistory] = useState<CommandHistory[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);
    const historyRef = useRef<HTMLDivElement>(null);

    // Auto-focus when expanded
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    const commands = {
        // Basic Commands
        help: () => `Available commands:
- help - Show this help message
- clear - Clear terminal
- projects - View my projects
- skills - List my technical skills
- contact - Get contact information
- github - Open my GitHub profile

Navigation:
- ls - List directory contents
- pwd - Print working directory
- whoami - Display current user
- date - Show current date/time

Information:
- education - View educational background
- experience - View work experience
- talks - List recent talks
- stack - View tech stack
- tools - List daily tools
- config - View configs

Social:
- social - View social links
- pgp - Display PGP key
- newsletter - Newsletter info

Fun:
- weather - Check weather
- joke - Tell a programming joke
- coffee - Brew virtual coffee
- matrix - Try to enter the Matrix`,

        // Navigation & System
        ls: () => `~/blog
~/about
~/contact`,

        pwd: () => `/users/guest`,

        date: () => new Date().toLocaleString(),

        // Personal/Professional
        education: () => `Education:
- M.S. Computer Science - (coming soon)
- B.S. Computer Science - University of Wisconsin, Madison`,

        experience: () => `Experience:
- Current: Software Engineer @ Company
- Previous: Data Scientist @ Company
- Intern: ML Engineer @ Company`,

        // publications: () => `Recent publications and writings:
        // - Paper Title 1 (2024)
        // - Paper Title 2 (2023)`,

        talks: () => `Recent talks and presentations:
- Conference Talk 1
- Workshop 2
- Meetup Presentation 3`,

        // Tech Stack
        stack: () => `My current tech stack:
Frontend: React, TypeScript, Tailwind
Backend: Python, Go, Node.js
Data: PyTorch, Pandas, PostgreSQL`,

        tools: () => `Daily tools:
            - Editor: Neovim
            - Terminal: WezTerm
            - Shell: zsh
            - OS: macOS`,

        config: () => `My dotfiles and configurations:
                    Visit: github.com/nicosalm/dotfiles`,

        // Fun/Interactive
        weather: () => `Fetching weather for Cambridge, MA...
                        🌤️  72°F | Partly Cloudy`,

        joke: () => `Why do programmers prefer dark mode?
                     Because light attracts bugs!`,

        coffee: () => `☕ Brewing a virtual coffee...`,

        matrix: () => `Loading the Matrix...
                    Access Denied: You're not The One.`,

        // Social/Contact
        social: () => `Find me on:
- Twitter: @nicosalm
- LinkedIn: in/nicosalm
- GitHub: @nicosalm`,

        pgp: () => `My PGP Public Key:
[Key Block]`,

        newsletter: () => `Subscribe to my newsletter:
newsletter.salm.dev`,

        // Keep your existing commands
        about: () => `Hi! I'm a Software Engineer and Data Scientist passionate about building cool things.`,

        clear: () => {
            setDisplayHistory([]);
            return null;
        },

        projects: () => `Recent projects:
- Data Engineering Pipeline
- ML Model Deployment
- System Architecture Design
- This Website!`,

        skills: () => `Technical Skills:
- Languages: Python, JavaScript, SQL
- Frameworks: React, Node.js, FastAPI
- Cloud: AWS, GCP
- ML/AI: PyTorch, TensorFlow
- Data: Pandas, NumPy, Scikit-learn`,

        contact: () => `Feel free to reach out:
- Email: hello@salm.dev
- LinkedIn: in/nicosalm`,

        github: () => {
            window.open('https://github.com/nicosalm', '_blank');
            return 'Opening GitHub profile...';
        }
    };

    const executeCommand = (cmd: string) => {
        const trimmedCmd = cmd.trim().toLowerCase();

        // clear clears everything
        if (trimmedCmd === 'clear') {
            setDisplayHistory([]);
            return;
        }

        if (trimmedCmd) {
            setCommandHistory(prev => [...prev, cmd]);
            setHistoryIndex(commandHistory.length + 1);
        }

        if (!trimmedCmd) {
            setDisplayHistory(prev => [...prev, { command: cmd, output: null }]);
            return;
        }

        const output = commands[trimmedCmd as keyof typeof commands]
            ? commands[trimmedCmd as keyof typeof commands]()
            : `Command not found: ${cmd}. Type 'help' for available commands.`;

        setDisplayHistory(prev => [...prev, {
            command: cmd,
            output,
            error: !commands[trimmedCmd as keyof typeof commands]
        }]);

        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const command = e.currentTarget.value;
            e.currentTarget.value = '';
            executeCommand(command);
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                setHistoryIndex(prev => prev - 1);
                if (inputRef.current && commandHistory[historyIndex - 1]) {
                    inputRef.current.value = commandHistory[historyIndex - 1];
                }
            }
        }
        else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                setHistoryIndex(prev => prev + 1);
                if (inputRef.current) {
                    inputRef.current.value = commandHistory[historyIndex + 1];
                }
            } else {
                setHistoryIndex(commandHistory.length);
                if (inputRef.current) {
                    inputRef.current.value = '';
                }
            }
        }
    };

    const toggleTerminal = () => {
        setIsExpanded(prev => !prev);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className={`
                w-full max-w-2xl bg-black border border-neutral-800
                transition-all duration-300 transform origin-bottom-right
                shadow-lg backdrop-blur-sm
                ${isExpanded ? 'scale-100' : 'scale-90 hover:scale-95'}
            `}>
                {/* Terminal Header */}
                <div
                    className="flex items-center justify-between px-4 h-8 border-b border-neutral-800 cursor-pointer"
                    onClick={toggleTerminal}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-red-500">◆</span>
                        <span className="text-neutral-500 font-ibm-vga text-sm">guest@salm.dev</span>
                    </div>
                    <span className="text-neutral-600 font-ibm-vga text-sm">~/terminal</span>
                </div>

                {/* Terminal Content */}
                {isExpanded && (
                    <div
                        ref={terminalRef}
                        className="p-4 h-96 overflow-y-auto font-ibm-vga"
                        onClick={() => inputRef.current?.focus()}
                    >
                        <div className="text-cyan-400 mb-4">
                            Welcome to salm.dev terminal. Type 'help' for available commands.
                        </div>

                        <div ref={historyRef} className="space-y-2">
                            {displayHistory.map((item, index) => (
                                <div key={index}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-red-500">»</span>
                                        <span className="text-white">{item.command}</span>
                                    </div>
                                    {item.output && (
                                        <div className={`mt-1 ml-6 whitespace-pre-line ${
                                            item.error ? 'text-red-400' : 'text-neutral-300'
                                        }`}>
                                            {item.output}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-red-500">»</span>
                            <input
                                ref={inputRef}
                                type="text"
                                className="flex-1 bg-transparent text-white outline-none border-none font-ibm-vga"
                                spellCheck="false"
                                autoComplete="off"
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Terminal;
