import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Square, Trash2, Copy } from 'lucide-react';

interface TerminalProps {
  onCommandExecute?: (command: string, output: string) => void;
  workingDirectory?: string;
}

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

const Terminal: React.FC<TerminalProps> = ({ onCommandExecute, workingDirectory = '/project' }) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'info',
      content: 'Terminal ready. Type commands to interact with your project.',
      timestamp: new Date()
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [lines]);

  const addLine = (type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setLines(prev => [...prev, newLine]);
    return newLine;
  };

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    setIsExecuting(true);
    addLine('command', `$ ${command}`);
    
    // Add to history
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    try {
      const output = await simulateCommand(command);
      addLine('output', output);
      onCommandExecute?.(command, output);
    } catch (error) {
      addLine('error', `Error: ${error instanceof Error ? error.message : 'Command failed'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const simulateCommand = async (command: string): Promise<string> => {
    const cmd = command.trim().toLowerCase();
    
    // Simulate command execution delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    if (cmd.startsWith('npm install') || cmd.startsWith('npm i')) {
      const packages = cmd.split(' ').slice(2);
      if (packages.length === 0) {
        return `npm WARN read-shrinkwrap This version of npm is compatible with lockfileVersion@1
npm WARN read-shrinkwrap but package-lock.json was generated for lockfileVersion@2

> project@1.0.0 prepare
> husky install

husky - Git hooks installed

added 1423 packages from 679 contributors and audited 1424 packages in 12.456s

142 packages are looking for funding
  run \`npm fund\` for details

found 0 vulnerabilities`;
      } else {
        return `npm WARN deprecated ${packages[0]}@1.0.0: This package is deprecated

+ ${packages.join('@latest\n+ ')}@latest

added ${packages.length} package${packages.length > 1 ? 's' : ''} from ${Math.floor(Math.random() * 50) + 10} contributors and audited ${Math.floor(Math.random() * 100) + 50} packages in ${(Math.random() * 5 + 2).toFixed(3)}s

found 0 vulnerabilities`;
      }
    }

    if (cmd.startsWith('npm uninstall') || cmd.startsWith('npm remove')) {
      const packages = cmd.split(' ').slice(2);
      return `removed ${packages.length} package${packages.length > 1 ? 's' : ''} and audited ${Math.floor(Math.random() * 100) + 50} packages in ${(Math.random() * 2 + 1).toFixed(3)}s

found 0 vulnerabilities`;
    }

    if (cmd.startsWith('npm run')) {
      const script = cmd.split(' ')[2];
      if (script === 'dev' || script === 'start') {
        return `> project@1.0.0 ${script}
> vite

  VITE v5.4.2  ready in ${Math.floor(Math.random() * 1000) + 500}ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help`;
      }
      if (script === 'build') {
        return `> project@1.0.0 build
> tsc && vite build

vite v5.4.2 building for production...
✓ ${Math.floor(Math.random() * 50) + 20} modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-DiwrgTda.css     1.39 kB │ gzip:  0.72 kB
dist/assets/index-C2PWqlFX.js    143.61 kB │ gzip: 46.11 kB
✓ built in ${(Math.random() * 5 + 2).toFixed(2)}s`;
      }
      if (script === 'test') {
        return `> project@1.0.0 test
> vitest

 RUN  v1.3.1

 ✓ src/App.test.tsx (${Math.floor(Math.random() * 5) + 3}) ${Math.floor(Math.random() * 500) + 100}ms
 ✓ src/components/Header.test.tsx (${Math.floor(Math.random() * 3) + 2}) ${Math.floor(Math.random() * 300) + 50}ms

 Test Files  ${Math.floor(Math.random() * 3) + 2} passed (${Math.floor(Math.random() * 3) + 2})
      Tests  ${Math.floor(Math.random() * 10) + 5} passed (${Math.floor(Math.random() * 10) + 5})
   Start at  ${new Date().toLocaleTimeString()}
   Duration  ${(Math.random() * 2 + 1).toFixed(2)}s (transform ${Math.floor(Math.random() * 100) + 50}ms, setup 0ms, collect ${Math.floor(Math.random() * 200) + 100}ms, tests ${Math.floor(Math.random() * 1000) + 500}ms)`;
      }
      return `npm ERR! Missing script: "${script}"
npm ERR! 
npm ERR! To see a list of scripts, run:
npm ERR!   npm run`;
    }

    if (cmd === 'ls' || cmd === 'dir') {
      return `total 24
drwxr-xr-x  3 user user 4096 ${new Date().toLocaleDateString()} src/
-rw-r--r--  1 user user 1234 ${new Date().toLocaleDateString()} package.json
-rw-r--r--  1 user user  567 ${new Date().toLocaleDateString()} vite.config.ts
-rw-r--r--  1 user user  890 ${new Date().toLocaleDateString()} tsconfig.json
-rw-r--r--  1 user user  234 ${new Date().toLocaleDateString()} index.html
drwxr-xr-x  2 user user 4096 ${new Date().toLocaleDateString()} node_modules/`;
    }

    if (cmd === 'pwd') {
      return workingDirectory;
    }

    if (cmd.startsWith('cd ')) {
      const dir = cmd.split(' ')[1];
      return `Changed directory to ${dir}`;
    }

    if (cmd === 'clear' || cmd === 'cls') {
      setLines([]);
      return '';
    }

    if (cmd === 'node --version' || cmd === 'node -v') {
      return 'v18.17.0';
    }

    if (cmd === 'npm --version' || cmd === 'npm -v') {
      return '9.6.7';
    }

    if (cmd === 'git status') {
      return `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/App.tsx
        modified:   src/components/Header.tsx

no changes added to commit (use "git add ." or "git commit -a")`;
    }

    if (cmd.startsWith('git ')) {
      return `git: '${cmd}' executed successfully`;
    }

    if (cmd === 'help') {
      return `Available commands:
  npm install [package]  - Install dependencies
  npm uninstall [package] - Remove dependencies  
  npm run [script]       - Run npm scripts
  ls / dir              - List directory contents
  pwd                   - Show current directory
  cd [directory]        - Change directory
  clear / cls           - Clear terminal
  node -v               - Show Node.js version
  npm -v                - Show npm version
  git [command]         - Git commands
  help                  - Show this help`;
    }

    // Default for unknown commands
    throw new Error(`'${command}' is not recognized as an internal or external command`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExecuting) {
      executeCommand(currentCommand);
      setCurrentCommand('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  const clearTerminal = () => {
    setLines([]);
  };

  const copyTerminalContent = () => {
    const content = lines.map(line => {
      const time = line.timestamp.toLocaleTimeString();
      return `[${time}] ${line.content}`;
    }).join('\n');
    navigator.clipboard.writeText(content);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command': return 'text-blue-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="bg-gray-900 text-gray-300 font-mono text-sm h-full flex flex-col">
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="h-4 w-4" />
          <span className="text-gray-300">Terminal</span>
          <span className="text-gray-500">({workingDirectory})</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyTerminalContent}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            title="Copy terminal content"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={clearTerminal}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            title="Clear terminal"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line) => (
          <div key={line.id} className="flex items-start space-x-2 mb-1">
            <span className="text-gray-500 text-xs min-w-[60px]">
              {formatTimestamp(line.timestamp)}
            </span>
            <span className={getLineColor(line.type)}>
              {line.content}
            </span>
          </div>
        ))}
        
        {/* Current Input Line */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 text-xs min-w-[60px]">
            {new Date().toLocaleTimeString()}
          </span>
          <span className="text-blue-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            className="flex-1 bg-transparent border-none outline-none text-green-400 placeholder-gray-500"
            placeholder={isExecuting ? "Executing..." : "Type a command..."}
            autoFocus
          />
          {isExecuting && (
            <div className="animate-spin rounded-full h-3 w-3 border-b border-green-400"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Terminal;