// Terminal.tsx
import React, { useState, useRef } from 'react';

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

    const commands = {
        help: () => `Available commands:
• help - Show this help message
• about - About me
• clear - Clear terminal
• projects - View my projects
• skills - List my technical skills
• contact - Get contact information
• github - Open my GitHub profile`,

        about: () => `Hi! I'm a Software Engineer and Data Scientist passionate about building cool things.`,

        clear: () => {
            setDisplayHistory([]);
            return null;
        },

        projects: () => `Recent projects:
• Data Engineering Pipeline
• ML Model Deployment
• System Architecture Design
• This Website!`,

        skills: () => `Technical Skills:
• Languages: Python, JavaScript, SQL
• Frameworks: React, Node.js, FastAPI
• Cloud: AWS, GCP
• ML/AI: PyTorch, TensorFlow
• Data: Pandas, NumPy, Scikit-learn`,

        contact: () => `Feel free to reach out:
• Email: hello@salm.dev
• LinkedIn: in/nicosalm`,

        github: () => {
            window.open('https://github.com/nicosalm', '_blank');
            return 'Opening GitHub profile...';
        }
    };

    const executeCommand = (cmd: string) => {
        const trimmedCmd = cmd.trim().toLowerCase();

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
        if (!isExpanded && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div
                className={`w-full max-w-2xl bg-black/90 border border-neutral-800 rounded font-ibm-vga transition-all duration-300 transform origin-bottom-right ${
                    isExpanded ? 'scale-100' : 'scale-90 hover:scale-95'
                }`}
            >
                <div
                    className="border-b border-neutral-800 px-3 h-8 cursor-pointer relative flex items-center"
                    onClick={toggleTerminal}
                >
                    <div className={`absolute left-3 flex items-center gap-3 ${isExpanded ? '' : 'opacity-0'}`}>
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-3" />
                    </div>
                    <div className={`text-neutral-500 text-sm w-full text-center pt-0.5 ${
                        isExpanded ? 'pl-20' : ''
                    }`}>
                        bash - salm.dev
                    </div>
                </div>

                {isExpanded && (
                    <div
                        ref={terminalRef}
                        className="p-4 h-96 overflow-y-auto"
                        onClick={() => inputRef.current?.focus()}
                    >
                        <div className="text-cyan-400 mb-4">
                            Welcome to salm.dev terminal. Type 'help' for available commands.
                        </div>

                        <div ref={historyRef}>
                            {displayHistory.map((item, index) => (
                                <div key={index} className="mb-2">
                                    <div className="flex">
                                        <span className="text-cyan-400">guest@salm.dev</span>
                                        <span className="text-red-400 mx-1">~</span>
                                        <span className="text-neutral-500">$</span>
                                        <span className="text-white ml-2">{item.command}</span>
                                    </div>
                                    {item.output && (
                                        <div className={`mt-1 whitespace-pre-line ${
                                            item.error ? 'text-red-400' : 'text-neutral-300'
                                        }`}>
                                            {item.output}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex">
                            <span className="text-cyan-400">guest@salm.dev</span>
                            <span className="text-red-400 mx-1">~</span>
                            <span className="text-neutral-500">$</span>
                            <input
                                ref={inputRef}
                                type="text"
                                className="flex-1 ml-2 bg-transparent text-white outline-none border-none"
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
