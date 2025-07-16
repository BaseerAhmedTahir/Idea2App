import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Copy, CheckCircle2, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    code?: any;
    features?: string[];
    isGenerating?: boolean;
  };
}

interface EnhancedChatInterfaceProps {
  onCodeGenerated?: (code: any) => void;
  onPreviewGenerated?: (preview: any) => void;
}

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({ 
  onCodeGenerated, 
  onPreviewGenerated 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI assistant. Describe the app you'd like to build and I'll generate clean, production-ready code with a live preview.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const updateLastMessage = (updates: Partial<Message>) => {
    setMessages(prev => prev.map((msg, index) => 
      index === prev.length - 1 ? { ...msg, ...updates } : msg
    ));
  };

  const extractFeatures = (idea: string): string[] => {
    const features: string[] = [];
    const lowerIdea = idea.toLowerCase();

    if (lowerIdea.includes('auth') || lowerIdea.includes('login') || lowerIdea.includes('user')) {
      features.push('authentication');
    }
    if (lowerIdea.includes('form') || lowerIdea.includes('input') || lowerIdea.includes('submit')) {
      features.push('forms');
    }
    if (lowerIdea.includes('nav') || lowerIdea.includes('menu') || lowerIdea.includes('route')) {
      features.push('navigation');
    }
    if (lowerIdea.includes('data') || lowerIdea.includes('list') || lowerIdea.includes('item') || lowerIdea.includes('post')) {
      features.push('data management');
    }
    if (lowerIdea.includes('search')) {
      features.push('search');
    }
    if (lowerIdea.includes('comment') || lowerIdea.includes('review')) {
      features.push('comments');
    }
    if (lowerIdea.includes('real-time') || lowerIdea.includes('chat') || lowerIdea.includes('notification')) {
      features.push('real-time features');
    }
    if (lowerIdea.includes('todo') || lowerIdea.includes('task')) {
      features.push('todo management');
    }
    if (lowerIdea.includes('calculator') || lowerIdea.includes('math')) {
      features.push('calculator');
    }
    if (lowerIdea.includes('weather')) {
      features.push('weather');
    }
    if (lowerIdea.includes('blog')) {
      features.push('blog');
    }
    if (lowerIdea.includes('ecommerce') || lowerIdea.includes('store') || lowerIdea.includes('shop')) {
      features.push('ecommerce');
    }

    return features.length > 0 ? features : ['basic functionality'];
  };

  const generateSpecificApp = (idea: string, features: string[]) => {
    const lowerIdea = idea.toLowerCase();

    // Todo App
    if (features.includes('todo management') || lowerIdea.includes('todo') || lowerIdea.includes('task')) {
      return generateTodoApp();
    }

    // Calculator
    if (features.includes('calculator') || lowerIdea.includes('calculator') || lowerIdea.includes('math')) {
      return generateCalculatorApp();
    }

    // Weather App
    if (features.includes('weather') || lowerIdea.includes('weather')) {
      return generateWeatherApp();
    }

    // Blog App
    if (features.includes('blog') || lowerIdea.includes('blog')) {
      return generateBlogApp();
    }

    // E-commerce App
    if (features.includes('ecommerce') || lowerIdea.includes('store') || lowerIdea.includes('shop')) {
      return generateEcommerceApp();
    }

    // Default to a more functional generic app
    return generateGenericApp(idea, features);
  };

  const generateTodoApp = () => {
    const appComponent = `import React, { useState, useEffect } from 'react';

function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: false, priority: 'medium' },
    { id: 2, text: 'Build a todo app', completed: true, priority: 'high' },
    { id: 3, text: 'Deploy to production', completed: false, priority: 'low' }
  ]);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [priority, setPriority] = useState('medium');

  const addTodo = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      const newTodo = {
        id: Date.now(),
        text: inputText.trim(),
        completed: false,
        priority: priority
      };
      setTodos([...todos, newTodo]);
      setInputText('');
      setPriority('medium');
    }
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = (id) => {
    if (editText.trim()) {
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, text: editText.trim() } : todo
      ));
    }
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = todos.length - completedCount;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <h1 className="text-3xl font-bold text-white text-center">Todo App</h1>
            <p className="text-blue-100 text-center mt-2">Organize your tasks efficiently</p>
          </div>

          <div className="p-6">
            <form onSubmit={addTodo} className="mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Add Task
                </button>
              </div>
            </form>

            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilter('all')}
                className={\`px-4 py-2 rounded-lg font-medium transition-colors \${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }\`}
              >
                All ({todos.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={\`px-4 py-2 rounded-lg font-medium transition-colors \${
                  filter === 'active' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }\`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={\`px-4 py-2 rounded-lg font-medium transition-colors \${
                  filter === 'completed' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }\`}
              >
                Completed ({completedCount})
              </button>
            </div>

            <div className="space-y-3">
              {filteredTodos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📝</div>
                  <p className="text-gray-500 text-lg">
                    {filter === 'all' ? 'No tasks yet' : \`No \${filter} tasks\`}
                  </p>
                </div>
              ) : (
                filteredTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={\`border-l-4 \${getPriorityColor(todo.priority)} rounded-lg p-4 transition-all hover:shadow-md\`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleComplete(todo.id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        {editingId === todo.id ? (
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                            onBlur={() => saveEdit(todo.id)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            autoFocus
                          />
                        ) : (
                          <span
                            className={\`flex-1 \${
                              todo.completed
                                ? 'text-gray-500 line-through'
                                : 'text-gray-900'
                            }\`}
                            onDoubleClick={() => startEdit(todo.id, todo.text)}
                          >
                            {todo.text}
                          </span>
                        )}
                        <span className={\`px-2 py-1 rounded text-xs font-medium \${
                          todo.priority === 'high' ? 'bg-red-100 text-red-800' :
                          todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }\`}>
                          {todo.priority}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {editingId === todo.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(todo.id)}
                              className="text-green-600 hover:text-green-800 font-medium text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(todo.id, todo.text)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="text-red-600 hover:text-red-800 font-medium text-sm"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {todos.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>{activeCount} active task{activeCount !== 1 ? 's' : ''}</span>
                  <span>{completedCount} completed task{completedCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;`;

    return {
      'src/App.js': appComponent,
      'src/index.js': getIndexJs(),
      'src/index.css': getIndexCss(),
      'public/index.html': getIndexHtml('Todo App'),
      'package.json': getPackageJson('todo-app'),
      'README.md': getReadme('Todo App', 'A fully functional todo application with add, edit, delete, and priority features.')
    };
  };

  const generateCalculatorApp = () => {
    const appComponent = `import React, { useState } from 'react';

function App() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState([]);

  const inputNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
      
      // Add to history
      setHistory(prev => [...prev, \`\${currentValue} \${operation} \${inputValue} = \${newValue}\`].slice(-5));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const percentage = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  const toggleSign = () => {
    const value = parseFloat(display);
    setDisplay(String(value * -1));
  };

  const Button = ({ onClick, className = '', children, ...props }) => (
    <button
      onClick={onClick}
      className={\`h-16 text-xl font-semibold rounded-lg transition-all duration-150 active:scale-95 \${className}\`}
      {...props}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-black rounded-3xl p-6 shadow-2xl max-w-sm w-full">
        <div className="mb-6">
          <div className="bg-gray-900 rounded-2xl p-4 mb-4">
            <div className="text-right">
              <div className="text-4xl font-light text-white mb-2 min-h-[3rem] flex items-end justify-end">
                {display}
              </div>
              {operation && previousValue !== null && (
                <div className="text-gray-400 text-sm">
                  {previousValue} {operation}
                </div>
              )}
            </div>
          </div>
          
          {history.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-3 max-h-32 overflow-y-auto">
              <div className="text-xs text-gray-400 mb-1">History</div>
              {history.map((calc, index) => (
                <div key={index} className="text-xs text-gray-300 py-1">
                  {calc}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3">
          <Button
            onClick={clear}
            className="bg-gray-600 hover:bg-gray-500 text-white col-span-2"
          >
            Clear
          </Button>
          <Button
            onClick={percentage}
            className="bg-gray-600 hover:bg-gray-500 text-white"
          >
            %
          </Button>
          <Button
            onClick={() => performOperation('÷')}
            className="bg-orange-500 hover:bg-orange-400 text-white"
          >
            ÷
          </Button>

          <Button
            onClick={() => inputNumber(7)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            7
          </Button>
          <Button
            onClick={() => inputNumber(8)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            8
          </Button>
          <Button
            onClick={() => inputNumber(9)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            9
          </Button>
          <Button
            onClick={() => performOperation('×')}
            className="bg-orange-500 hover:bg-orange-400 text-white"
          >
            ×
          </Button>

          <Button
            onClick={() => inputNumber(4)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            4
          </Button>
          <Button
            onClick={() => inputNumber(5)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            5
          </Button>
          <Button
            onClick={() => inputNumber(6)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            6
          </Button>
          <Button
            onClick={() => performOperation('-')}
            className="bg-orange-500 hover:bg-orange-400 text-white"
          >
            -
          </Button>

          <Button
            onClick={() => inputNumber(1)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            1
          </Button>
          <Button
            onClick={() => inputNumber(2)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            2
          </Button>
          <Button
            onClick={() => inputNumber(3)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            3
          </Button>
          <Button
            onClick={() => performOperation('+')}
            className="bg-orange-500 hover:bg-orange-400 text-white"
          >
            +
          </Button>

          <Button
            onClick={() => inputNumber(0)}
            className="bg-gray-700 hover:bg-gray-600 text-white col-span-2"
          >
            0
          </Button>
          <Button
            onClick={inputDecimal}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            .
          </Button>
          <Button
            onClick={() => performOperation('=')}
            className="bg-orange-500 hover:bg-orange-400 text-white"
          >
            =
          </Button>
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            onClick={toggleSign}
            className="bg-gray-600 hover:bg-gray-500 text-white px-6"
          >
            +/-
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;`;

    return {
      'src/App.js': appComponent,
      'src/index.js': getIndexJs(),
      'src/index.css': getIndexCss(),
      'public/index.html': getIndexHtml('Calculator App'),
      'package.json': getPackageJson('calculator-app'),
      'README.md': getReadme('Calculator App', 'A fully functional calculator with history and advanced operations.')
    };
  };

  const generateWeatherApp = () => {
    const appComponent = `import React, { useState, useEffect } from 'react';

function App() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('New York');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState([]);

  // Mock weather data since we can't use real API in this demo
  const mockWeatherData = {
    'new york': {
      city: 'New York',
      country: 'US',
      temperature: 22,
      description: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
      pressure: 1013,
      icon: '⛅',
      forecast: [
        { day: 'Today', high: 24, low: 18, icon: '⛅', desc: 'Partly Cloudy' },
        { day: 'Tomorrow', high: 26, low: 20, icon: '☀️', desc: 'Sunny' },
        { day: 'Wednesday', high: 23, low: 17, icon: '🌧️', desc: 'Light Rain' },
        { day: 'Thursday', high: 25, low: 19, icon: '☀️', desc: 'Sunny' },
        { day: 'Friday', high: 21, low: 15, icon: '⛈️', desc: 'Thunderstorm' }
      ]
    },
    'london': {
      city: 'London',
      country: 'UK',
      temperature: 15,
      description: 'Rainy',
      humidity: 80,
      windSpeed: 8,
      pressure: 1008,
      icon: '🌧️',
      forecast: [
        { day: 'Today', high: 17, low: 12, icon: '🌧️', desc: 'Rainy' },
        { day: 'Tomorrow', high: 16, low: 11, icon: '☁️', desc: 'Cloudy' },
        { day: 'Wednesday', high: 18, low: 13, icon: '⛅', desc: 'Partly Cloudy' },
        { day: 'Thursday', high: 19, low: 14, icon: '☀️', desc: 'Sunny' },
        { day: 'Friday', high: 17, low: 12, icon: '🌧️', desc: 'Light Rain' }
      ]
    },
    'tokyo': {
      city: 'Tokyo',
      country: 'JP',
      temperature: 28,
      description: 'Sunny',
      humidity: 55,
      windSpeed: 6,
      pressure: 1020,
      icon: '☀️',
      forecast: [
        { day: 'Today', high: 30, low: 24, icon: '☀️', desc: 'Sunny' },
        { day: 'Tomorrow', high: 32, low: 26, icon: '☀️', desc: 'Hot' },
        { day: 'Wednesday', high: 29, low: 23, icon: '⛅', desc: 'Partly Cloudy' },
        { day: 'Thursday', high: 27, low: 21, icon: '🌧️', desc: 'Rainy' },
        { day: 'Friday', high: 25, low: 19, icon: '⛈️', desc: 'Thunderstorm' }
      ]
    }
  };

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const weatherData = mockWeatherData[cityName.toLowerCase()];
    
    if (weatherData) {
      setWeather(weatherData);
      setForecast(weatherData.forecast);
    } else {
      setError('City not found. Try New York, London, or Tokyo.');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city.trim());
    }
  };

  const getBackgroundClass = () => {
    if (!weather) return 'from-blue-400 to-blue-600';
    
    switch (weather.description.toLowerCase()) {
      case 'sunny':
      case 'hot':
        return 'from-yellow-400 to-orange-500';
      case 'rainy':
      case 'light rain':
        return 'from-gray-400 to-gray-600';
      case 'partly cloudy':
        return 'from-blue-400 to-blue-600';
      case 'cloudy':
        return 'from-gray-500 to-gray-700';
      case 'thunderstorm':
        return 'from-gray-700 to-gray-900';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  return (
    <div className={\`min-h-screen bg-gradient-to-br \${getBackgroundClass()} p-4\`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Weather App</h1>
          <p className="text-white/80">Get current weather and 5-day forecast</p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name..."
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-4 focus:ring-white/30 outline-none text-gray-800"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-8 text-center">
            <p className="text-white">{error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center mb-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-white mt-2">Loading weather data...</p>
          </div>
        )}

        {weather && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Weather */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold">{weather.city}</h2>
                    <p className="text-white/80">{weather.country}</p>
                  </div>
                  <div className="text-6xl">{weather.icon}</div>
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-6xl font-light">{weather.temperature}°C</div>
                    <div className="text-xl text-white/80">{weather.description}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-1">💧</div>
                    <div className="text-sm text-white/80">Humidity</div>
                    <div className="font-semibold">{weather.humidity}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">💨</div>
                    <div className="text-sm text-white/80">Wind Speed</div>
                    <div className="font-semibold">{weather.windSpeed} km/h</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🌡️</div>
                    <div className="text-sm text-white/80">Pressure</div>
                    <div className="font-semibold">{weather.pressure} hPa</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Cities */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-4">Quick Access</h3>
              <div className="space-y-3">
                {['New York', 'London', 'Tokyo'].map((cityName) => (
                  <button
                    key={cityName}
                    onClick={() => {
                      setCity(cityName);
                      fetchWeather(cityName);
                    }}
                    className="w-full text-left p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <div className="font-medium">{cityName}</div>
                    <div className="text-sm text-white/80">
                      {mockWeatherData[cityName.toLowerCase()]?.temperature}°C
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {forecast.length > 0 && !loading && (
          <div className="mt-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-4">5-Day Forecast</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {forecast.map((day, index) => (
                  <div key={index} className="text-center p-4 bg-white/10 rounded-lg">
                    <div className="font-medium mb-2">{day.day}</div>
                    <div className="text-3xl mb-2">{day.icon}</div>
                    <div className="text-sm text-white/80 mb-2">{day.desc}</div>
                    <div className="flex justify-between text-sm">
                      <span>{day.high}°</span>
                      <span className="text-white/60">{day.low}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;`;

    return {
      'src/App.js': appComponent,
      'src/index.js': getIndexJs(),
      'src/index.css': getIndexCss(),
      'public/index.html': getIndexHtml('Weather App'),
      'package.json': getPackageJson('weather-app'),
      'README.md': getReadme('Weather App', 'A beautiful weather application with current conditions and 5-day forecast.')
    };
  };

  const generateBlogApp = () => {
    const appComponent = `import React, { useState } from 'react';

function App() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Getting Started with React',
      content: 'React is a powerful JavaScript library for building user interfaces. In this post, we will explore the basics of React and how to create your first component.',
      author: 'John Doe',
      date: '2024-01-15',
      category: 'Technology',
      likes: 24,
      comments: [
        { id: 1, author: 'Jane Smith', content: 'Great introduction to React!', date: '2024-01-16' },
        { id: 2, author: 'Mike Johnson', content: 'Very helpful for beginners.', date: '2024-01-16' }
      ]
    },
    {
      id: 2,
      title: 'The Future of Web Development',
      content: 'Web development is constantly evolving. From static websites to dynamic web applications, the landscape has changed dramatically over the past decade.',
      author: 'Sarah Wilson',
      date: '2024-01-10',
      category: 'Web Development',
      likes: 18,
      comments: [
        { id: 3, author: 'Alex Brown', content: 'Interesting perspective on the future!', date: '2024-01-11' }
      ]
    },
    {
      id: 3,
      title: 'CSS Grid vs Flexbox',
      content: 'Both CSS Grid and Flexbox are powerful layout systems. Understanding when to use each one is crucial for modern web development.',
      author: 'David Lee',
      date: '2024-01-05',
      category: 'CSS',
      likes: 31,
      comments: []
    }
  ]);

  const [selectedPost, setSelectedPost] = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', author: '', category: '' });
  const [newComment, setNewComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Technology', 'Web Development', 'CSS', 'JavaScript'];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (newPost.title && newPost.content && newPost.author) {
      const post = {
        id: Date.now(),
        ...newPost,
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        comments: []
      };
      setPosts([post, ...posts]);
      setNewPost({ title: '', content: '', author: '', category: '' });
      setShowNewPost(false);
    }
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const handleAddComment = (postId) => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        author: 'Anonymous User',
        content: newComment.trim(),
        date: new Date().toISOString().split('T')[0]
      };
      
      setPosts(posts.map(post =>
        post.id === postId 
          ? { ...post, comments: [...post.comments, comment] }
          : post
      ));
      
      setNewComment('');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={() => setSelectedPost(null)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Blog
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <article className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <header className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{selectedPost.title}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <span>By {selectedPost.author}</span>
                <span>•</span>
                <span>{formatDate(selectedPost.date)}</span>
                <span>•</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {selectedPost.category}
                </span>
              </div>
            </header>
            
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 leading-relaxed text-lg">{selectedPost.content}</p>
            </div>
            
            <footer className="flex items-center justify-between pt-6 border-t">
              <button
                onClick={() => handleLike(selectedPost.id)}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <span>❤️</span>
                <span>{selectedPost.likes} likes</span>
              </button>
              <div className="text-gray-600">
                {selectedPost.comments.length} comment{selectedPost.comments.length !== 1 ? 's' : ''}
              </div>
            </footer>
          </article>

          <section className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Comments</h3>
            
            <div className="mb-6">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => handleAddComment(selectedPost.id)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Post
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {selectedPost.comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
              ) : (
                selectedPost.comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-200 pb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">{comment.author}</span>
                      <span className="text-gray-500 text-sm">{formatDate(comment.date)}</span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Blog</h1>
              <p className="text-gray-600 mt-1">Thoughts, stories and ideas</p>
            </div>
            <button
              onClick={() => setShowNewPost(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Post
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold mb-4">Search</h3>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search posts..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={\`w-full text-left px-3 py-2 rounded-lg transition-colors \${
                      selectedCategory === category
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-gray-100'
                    }\`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="grid gap-6">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No posts found matching your criteria.</p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <article key={post.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                    <header className="mb-4">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer"
                          onClick={() => setSelectedPost(post)}>
                        {post.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-gray-600 text-sm">
                        <span>By {post.author}</span>
                        <span>•</span>
                        <span>{formatDate(post.date)}</span>
                        <span>•</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {post.category}
                        </span>
                      </div>
                    </header>
                    
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {post.content.substring(0, 200)}...
                    </p>
                    
                    <footer className="flex items-center justify-between">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Read More →
                      </button>
                      <div className="flex items-center space-x-4 text-gray-600 text-sm">
                        <span>❤️ {post.likes}</span>
                        <span>💬 {post.comments.length}</span>
                      </div>
                    </footer>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {showNewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Create New Post</h2>
                <button
                  onClick={() => setShowNewPost(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  <input
                    type="text"
                    value={newPost.author}
                    onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.slice(1).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewPost(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Publish Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;`;

    return {
      'src/App.js': appComponent,
      'src/index.js': getIndexJs(),
      'src/index.css': getIndexCss(),
      'public/index.html': getIndexHtml('Blog App'),
      'package.json': getPackageJson('blog-app'),
      'README.md': getReadme('Blog App', 'A full-featured blog application with posts, comments, categories, and search functionality.')
    };
  };

  const generateEcommerceApp = () => {
    const appComponent = `import React, { useState } from 'react';

function App() {
  const [products] = useState([
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 99.99,
      image: '🎧',
      category: 'Electronics',
      description: 'High-quality wireless headphones with noise cancellation',
      rating: 4.5,
      stock: 15
    },
    {
      id: 2,
      name: 'Smart Watch',
      price: 199.99,
      image: '⌚',
      category: 'Electronics',
      description: 'Feature-rich smartwatch with health tracking',
      rating: 4.3,
      stock: 8
    },
    {
      id: 3,
      name: 'Coffee Mug',
      price: 12.99,
      image: '☕',
      category: 'Home',
      description: 'Ceramic coffee mug with ergonomic design',
      rating: 4.7,
      stock: 25
    },
    {
      id: 4,
      name: 'Laptop Bag',
      price: 49.99,
      image: '💼',
      category: 'Accessories',
      description: 'Durable laptop bag with multiple compartments',
      rating: 4.2,
      stock: 12
    },
    {
      id: 5,
      name: 'Desk Lamp',
      price: 34.99,
      image: '💡',
      category: 'Home',
      description: 'LED desk lamp with adjustable brightness',
      rating: 4.6,
      stock: 20
    },
    {
      id: 6,
      name: 'Phone Case',
      price: 19.99,
      image: '📱',
      category: 'Accessories',
      description: 'Protective phone case with wireless charging support',
      rating: 4.4,
      stock: 30
    }
  ]);

  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ['All', 'Electronics', 'Home', 'Accessories'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }
    return stars.join('');
  };

  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <button
              onClick={() => setSelectedProduct(null)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Store
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="text-9xl mb-4">{selectedProduct.image}</div>
            </div>
            
            <div className="bg-white rounded-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedProduct.name}</h1>
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">{renderStars(selectedProduct.rating)}</span>
                <span className="text-gray-600">({selectedProduct.rating})</span>
              </div>
              <p className="text-gray-700 mb-6">{selectedProduct.description}</p>
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-bold text-blue-600">\${selectedProduct.price}</span>
                <span className="text-green-600">
                  {selectedProduct.stock > 0 ? \`\${selectedProduct.stock} in stock\` : 'Out of stock'}
                </span>
              </div>
              <button
                onClick={() => addToCart(selectedProduct)}
                disabled={selectedProduct.stock === 0}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {selectedProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">🛍️ My Store</h1>
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cart ({getTotalItems()})
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold mb-4">Search</h3>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={\`w-full text-left px-3 py-2 rounded-lg transition-colors \${
                      selectedCategory === category
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-gray-100'
                    }\`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6 text-center">
                    <div className="text-6xl mb-4">{product.image}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex items-center justify-center mb-2">
                      <span className="mr-1">{renderStars(product.rating)}</span>
                      <span className="text-gray-600 text-sm">({product.rating})</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">\${product.price}</span>
                      <span className="text-green-600 text-sm">
                        {product.stock > 0 ? \`\${product.stock} left\` : 'Out of stock'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="text-3xl">{item.image}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-gray-600">\${item.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-semibold">Total: \${getTotalPrice()}</span>
                      <span className="text-gray-600">{getTotalItems()} items</span>
                    </div>
                    <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium">
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;`;

    return {
      'src/App.js': appComponent,
      'src/index.js': getIndexJs(),
      'src/index.css': getIndexCss(),
      'public/index.html': getIndexHtml('E-commerce Store'),
      'package.json': getPackageJson('ecommerce-app'),
      'README.md': getReadme('E-commerce Store', 'A complete e-commerce application with product catalog, shopping cart, and checkout functionality.')
    };
  };

  const generateGenericApp = (idea: string, features: string[]) => {
    const hasAuth = features.includes('authentication');
    const hasForms = features.includes('forms');
    const hasNavigation = features.includes('navigation');
    const hasData = features.includes('data management');

    const appComponent = `import React, { useState, useEffect } from 'react';

function App() {
  ${hasAuth ? `const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);` : ''}
  ${hasData ? `const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);` : ''}
  ${hasForms ? `const [formData, setFormData] = useState({});` : ''}

  ${hasData ? `useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setItems([
        { id: 1, title: 'Sample Item 1', description: 'This is a sample item for your application' },
        { id: 2, title: 'Sample Item 2', description: 'Another sample item with different content' },
        { id: 3, title: 'Sample Item 3', description: 'Yet another item to demonstrate functionality' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);` : ''}

  ${hasAuth ? `const handleLogin = (email, password) => {
    if (email && password) {
      setUser({ email, name: email.split('@')[0] });
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };` : ''}

  ${hasForms ? `const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Form submitted successfully!');
  };` : ''}

  ${hasAuth ? `if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your account</p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            handleLogin(email, password);
          }}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }` : ''}

  return (
    <div className="min-h-screen bg-gray-50">
      ${hasNavigation ? `<nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">${getAppTitle(idea)}</h1>
            </div>
            ${hasAuth ? `<div className="flex items-center space-x-4">
              {user && <span className="text-gray-700">Welcome, {user.name}</span>}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>` : ''}
          </div>
        </div>
      </nav>` : ''}

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ${getAppTitle(idea)}
            </h2>
            <p className="text-gray-600 text-lg">
              ${getAppDescription(idea)}
            </p>
          </div>

          ${hasForms ? `<div className="mb-8">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter title"
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select category</option>
                    <option value="general">General</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  placeholder="Enter description"
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>` : ''}

          ${hasData ? `<div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-4 text-gray-600">Loading...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <div className="flex space-x-3">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        View Details
                      </button>
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>` : `<div className="text-center py-12">
            <div className="text-6xl mb-6">🚀</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Your Application is Ready!</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              This is your generated application based on: "${idea}". 
              The app includes the features you requested and is ready for customization.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Get Started
              </button>
              <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                Learn More
              </button>
            </div>
          </div>`}
        </div>
      </main>
    </div>
  );
}

export default App;`;

    return {
      'src/App.js': appComponent,
      'src/index.js': getIndexJs(),
      'src/index.css': getIndexCss(),
      'public/index.html': getIndexHtml(getAppTitle(idea)),
      'package.json': getPackageJson('generated-app'),
      'README.md': getReadme(getAppTitle(idea), `A custom application generated based on: ${idea}`)
    };
  };

  const getAppTitle = (idea: string): string => {
    const lowerIdea = idea.toLowerCase();
    if (lowerIdea.includes('todo') || lowerIdea.includes('task')) return 'Task Manager';
    if (lowerIdea.includes('blog')) return 'Blog Platform';
    if (lowerIdea.includes('store') || lowerIdea.includes('shop') || lowerIdea.includes('ecommerce')) return 'Online Store';
    if (lowerIdea.includes('chat')) return 'Chat Application';
    if (lowerIdea.includes('social')) return 'Social Platform';
    if (lowerIdea.includes('dashboard')) return 'Dashboard';
    if (lowerIdea.includes('portfolio')) return 'Portfolio';
    return 'My Application';
  };

  const getAppDescription = (idea: string): string => {
    return `A modern web application built with React, designed to ${idea.toLowerCase()}`;
  };

  const getIndexJs = () => `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

  const getIndexCss = () => `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}`;

  const getIndexHtml = (title: string) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Generated React App" />
    <title>${title}</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;

  const getPackageJson = (name: string) => JSON.stringify({
    name: name,
    version: "0.1.0",
    private: true,
    dependencies: {
      "@testing-library/jest-dom": "^5.16.4",
      "@testing-library/react": "^13.3.0",
      "@testing-library/user-event": "^13.5.0",
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "react-scripts": "5.0.1",
      "web-vitals": "^2.1.4"
    },
    scripts: {
      "start": "react-scripts start",
      "build": "react-scripts build",
      "test": "react-scripts test",
      "eject": "react-scripts eject"
    },
    eslintConfig: {
      extends: [
        "react-app",
        "react-app/jest"
      ]
    },
    browserslist: {
      production: [
        ">0.2%",
        "not dead",
        "not op_mini all"
      ],
      development: [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version"
      ]
    },
    devDependencies: {
      "tailwindcss": "^3.3.0",
      "autoprefixer": "^10.4.14",
      "postcss": "^8.4.24"
    }
  }, null, 2);

  const getReadme = (title: string, description: string) => `# ${title}

${description}

## Features

- Modern React application
- Responsive design with Tailwind CSS
- Interactive user interface
- Production-ready code structure

## Getting Started

1. Extract the downloaded files
2. Run \`npm install\` to install dependencies
3. Run \`npm start\` to start the development server
4. Open [http://localhost:3000](http://localhost:3000) to view the app

## Available Scripts

### \`npm start\`
Runs the app in development mode.

### \`npm test\`
Launches the test runner.

### \`npm run build\`
Builds the app for production.

## Technologies Used

- React 18
- Tailwind CSS
- Modern JavaScript (ES6+)
- Responsive Design

## Customization

This application is fully customizable. You can:
- Modify the styling in the component files
- Add new features and components
- Integrate with APIs and databases
- Deploy to your preferred hosting platform

Enjoy building with React!
`;

  const generateCode = async (idea: string) => {
    const features = extractFeatures(idea);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const generatedFiles = generateSpecificApp(idea, features);
    
    return { code: generatedFiles, features };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    
    addMessage({
      type: 'user',
      content: userMessage
    });

    setIsProcessing(true);

    try {
      const processingMessage = addMessage({
        type: 'assistant',
        content: "🔄 Analyzing your request and generating a fully functional application...",
        metadata: { isGenerating: true }
      });

      const { code, features } = await generateCode(userMessage);
      
      onCodeGenerated?.(code);
      
      onPreviewGenerated?.({
        url: '',
        status: 'ready',
        code: code['src/App.js']
      });
      
      updateLastMessage({
        content: `✅ **Application Generated Successfully!**

I've created a complete, fully functional application based on your request:

**Generated Application:**
${getAppTitle(userMessage)} - A modern React application

**Features Implemented:**
${features.map(f => `• ${f.charAt(0).toUpperCase() + f.slice(1)}`).join('\n')}

**What's Included:**
• Complete React application with modern UI
• Responsive design that works on all devices
• Interactive functionality and state management
• Production-ready code structure
• Tailwind CSS for beautiful styling
• Full project setup with package.json

**Ready to Use:**
• View the live preview in the Preview tab
• Download the complete source code
• Run locally with \`npm install\` and \`npm start\`

Your application is fully functional and ready for customization or deployment!`,
        metadata: {
          code: code['src/App.js'],
          features,
          isGenerating: false
        }
      });

    } catch (error) {
      updateLastMessage({
        content: `❌ **Generation Failed**

I encountered an issue while generating your app: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again with a different description.`,
        metadata: { isGenerating: false }
      });
      
      onPreviewGenerated?.({
        url: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExamplePrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const examplePrompts = [
    "Create a todo app with add, edit, and delete functionality",
    "Build a calculator with basic math operations",
    "Make a weather app with current conditions",
    "Design a blog platform with posts and comments",
    "Create an e-commerce store with shopping cart",
    "Build a portfolio website with projects showcase"
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-blue-500 text-white ml-3' 
                  : 'bg-gray-100 text-gray-600 mr-3'
              }`}>
                {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              
              <div className={`rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                
                {message.metadata?.isGenerating && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-xs text-gray-600">Creating your application...</span>
                    </div>
                  </div>
                )}
                
                {message.type === 'assistant' && (
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="mt-2 text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-600">Building your application...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">Try these examples:</p>
          <div className="grid grid-cols-1 gap-2">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleExamplePrompt(prompt)}
                className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Describe the app you want to build..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={isProcessing}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
