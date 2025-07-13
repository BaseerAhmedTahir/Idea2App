export interface CleanCodeOptions {
  removeComments: boolean;
  removeExplanations: boolean;
  minifyImports: boolean;
  productionReady: boolean;
}

export class CleanCodeGenerator {
  static generateReactComponent(idea: string, features: string[], options: CleanCodeOptions = {
    removeComments: true,
    removeExplanations: true,
    minifyImports: true,
    productionReady: true
  }): string {
    
    const hasAuth = features.some(f => f.toLowerCase().includes('auth'));
    const hasForm = features.some(f => f.toLowerCase().includes('form') || f.toLowerCase().includes('input'));
    const hasNavigation = features.some(f => f.toLowerCase().includes('nav') || f.toLowerCase().includes('route'));
    const hasData = features.some(f => f.toLowerCase().includes('data') || f.toLowerCase().includes('list'));

    let imports = ['React', 'useState'];
    if (hasData) imports.push('useEffect');
    
    const componentCode = `import ${imports.join(', ')} from 'react';

function App() {
  ${hasAuth ? `const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);` : ''}
  ${hasData ? `const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);` : ''}
  ${hasForm ? `const [formData, setFormData] = useState({});` : ''}

  ${hasData ? `useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setItems([
        { id: 1, title: 'Sample Item 1', description: 'This is a sample item' },
        { id: 2, title: 'Sample Item 2', description: 'Another sample item' },
        { id: 3, title: 'Sample Item 3', description: 'Yet another item' }
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

  ${hasForm ? `const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };` : ''}

  ${hasAuth ? `if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            handleLogin(email, password);
          }}>
            <div className="mb-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }` : ''}

  return (
    <div className="min-h-screen bg-gray-100">
      ${hasNavigation ? `<nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">${this.generateTitle(idea)}</h1>
            </div>
            ${hasAuth ? `<div className="flex items-center space-x-4">
              {user && <span className="text-gray-700">Welcome, {user.name}</span>}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>` : ''}
          </div>
        </div>
      </nav>` : ''}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              ${this.generateTitle(idea)}
            </h2>

            ${hasForm ? `<form onSubmit={handleSubmit} className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </form>` : ''}

            ${hasData ? `{loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                    <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}` : `<div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to your app!</h3>
              <p className="text-gray-600">This is your generated application based on: ${idea}</p>
            </div>`}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;`;

    return options.removeComments ? this.removeComments(componentCode) : componentCode;
  }

  static generateBackendCode(idea: string, features: string[]): string {
    const hasAuth = features.some(f => f.toLowerCase().includes('auth'));
    const hasAPI = features.some(f => f.toLowerCase().includes('api') || f.toLowerCase().includes('data'));
    const hasDatabase = features.some(f => f.toLowerCase().includes('database') || f.toLowerCase().includes('storage'));

    return `const express = require('express');
const cors = require('cors');
${hasAuth ? `const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');` : ''}
${hasDatabase ? `const { Pool } = require('pg');` : ''}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

${hasDatabase ? `const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});` : ''}

${hasAuth ? `const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.rows[0].id, email: user.rows[0].email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );

    const token = jwt.sign(
      { userId: newUser.rows[0].id, email: newUser.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, user: newUser.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});` : ''}

${hasAPI ? `app.get('/api/items', ${hasAuth ? 'authenticateToken, ' : ''}async (req, res) => {
  try {
    ${hasDatabase ? `const result = await pool.query('SELECT * FROM items ORDER BY created_at DESC');
    res.json(result.rows);` : `res.json([
      { id: 1, title: 'Sample Item 1', description: 'This is a sample item' },
      { id: 2, title: 'Sample Item 2', description: 'Another sample item' },
      { id: 3, title: 'Sample Item 3', description: 'Yet another item' }
    ]);`}
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/items', ${hasAuth ? 'authenticateToken, ' : ''}async (req, res) => {
  try {
    const { title, description } = req.body;
    
    ${hasDatabase ? `const result = await pool.query(
      'INSERT INTO items (title, description${hasAuth ? ', user_id' : ''}) VALUES ($1, $2${hasAuth ? ', $3' : ''}) RETURNING *',
      [title, description${hasAuth ? ', req.user.userId' : ''}]
    );
    
    res.status(201).json(result.rows[0]);` : `const newItem = {
      id: Date.now(),
      title,
      description,
      created_at: new Date().toISOString()
    };
    
    res.status(201).json(newItem);`}
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});` : ''}

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;
  }

  static generateDatabaseSchema(features: string[]): string {
    const hasAuth = features.some(f => f.toLowerCase().includes('auth'));
    const hasItems = features.some(f => f.toLowerCase().includes('item') || f.toLowerCase().includes('post') || f.toLowerCase().includes('product'));
    const hasComments = features.some(f => f.toLowerCase().includes('comment'));

    let schema = '';

    if (hasAuth) {
      schema += `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

`;
    }

    if (hasItems) {
      schema += `CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ${hasAuth ? 'user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,' : ''}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

${hasAuth ? 'CREATE INDEX idx_items_user_id ON items(user_id);' : ''}
CREATE INDEX idx_items_created_at ON items(created_at DESC);

`;
    }

    if (hasComments && hasItems) {
      schema += `CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  ${hasAuth ? 'user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,' : ''}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_item_id ON comments(item_id);
${hasAuth ? 'CREATE INDEX idx_comments_user_id ON comments(user_id);' : ''}

`;
    }

    return schema || `CREATE TABLE app_data (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
  }

  private static generateTitle(idea: string): string {
    if (idea.toLowerCase().includes('social')) return 'Social Platform';
    if (idea.toLowerCase().includes('ecommerce') || idea.toLowerCase().includes('store')) return 'Online Store';
    if (idea.toLowerCase().includes('blog')) return 'Blog Platform';
    if (idea.toLowerCase().includes('task') || idea.toLowerCase().includes('todo')) return 'Task Manager';
    if (idea.toLowerCase().includes('chat')) return 'Chat Application';
    return 'My Application';
  }

  private static removeComments(code: string): string {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/^\s*\n/gm, '')
      .trim();
  }
}