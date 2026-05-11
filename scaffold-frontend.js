const fs = require('fs');
const path = require('path');

function createFiles(baseDir, structure) {
    for (const [key, value] of Object.entries(structure)) {
        const fullPath = path.join(baseDir, key);
        if (typeof value === 'string') {
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, value.trim() + '\n', 'utf-8');
        } else {
            fs.mkdirSync(fullPath, { recursive: true });
            createFiles(fullPath, value);
        }
    }
}

const frontendStructure = {
    'package.json': `
{
  "name": "frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "webpack serve --mode development --open",
    "build": "webpack --mode production",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "axios": "^1.7.9",
    "lucide-react": "^0.465.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.2"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "clean-webpack-plugin": "^4.0.0",
    "css-loader": "^7.1.2",
    "dotenv-webpack": "^8.1.0",
    "html-webpack-plugin": "^5.6.3",
    "style-loader": "^4.0.0",
    "ts-loader": "^9.5.1",
    "typescript": "^5.7.2",
    "webpack": "^5.97.1",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.1.0"
  }
}
    `,
    'tsconfig.json': `
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"]
    }
  },
  "include": ["src"]
}
    `,
    'webpack.config.js': `
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\\.(png|jpg|gif|svg)$/,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new Dotenv()
  ],
  devServer: {
    historyApiFallback: true,
    port: 3000,
    hot: true,
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:5000',
      },
    ],
  },
  devtool: 'source-map'
};
    `,
    '.env.example': `
REACT_APP_API_URL=http://localhost:5000/api
    `,
    'src/index.html': `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern App</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div id="root"></div>
</body>
</html>
    `,
    'src/styles/index.css': `
:root {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --accent: #3b82f6;
  --accent-hover: #2563eb;
  --border: #334155;
  --danger: #ef4444;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
}

a { text-decoration: none; color: var(--accent); }
a:hover { color: var(--accent-hover); }

/* Layout Utilities */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--border);
}

/* Forms & Inputs */
.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

.input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

.btn-danger {
  background: var(--danger);
  color: white;
}

/* Navbar */
.navbar {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

/* Table */
.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

th {
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

/* Grid layout */
.grid-cols-3 {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
    `,
    'src/index.tsx': `
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
    `,
    'src/api/axios.ts': `
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(
          \`\${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh\`,
          {},
          { withCredentials: true }
        );
        return api(originalRequest);
      } catch (err) {
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
    `,
    'src/context/AuthContext.tsx': `
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.data.user);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = (token: string, userData: User) => {
    api.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
    `,
    'src/components/Layout.tsx': `
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Users, Package } from 'lucide-react';

export const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="nav-brand">App</Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard" style={{display:'flex', alignItems:'center', gap:'0.5rem'}}><Home size={18}/> Dashboard</Link>
              <Link to="/products" style={{display:'flex', alignItems:'center', gap:'0.5rem'}}><Package size={18}/> Products</Link>
              {user.role === 'admin' && <Link to="/users" style={{display:'flex', alignItems:'center', gap:'0.5rem'}}><Users size={18}/> Users</Link>}
              <button onClick={logout} className="btn btn-danger" style={{padding:'0.5rem 1rem', display:'flex', alignItems:'center', gap:'0.5rem'}}><LogOut size={18}/> Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
};
    `,
    'src/components/ProtectedRoute.tsx': `
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode, adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};
    `,
    'src/pages/Login.tsx': `
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data.accessToken, res.data.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Welcome Back</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
        </form>
      </div>
    </div>
  );
};
    `,
    'src/pages/Register.tsx': `
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Create Account</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Name</label>
            <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register</button>
        </form>
      </div>
    </div>
  );
};
    `,
    'src/pages/Dashboard.tsx': `
import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
      <div className="card">
        <h2>Welcome, {user?.name}!</h2>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Role: {user?.role}</p>
        <p style={{ color: 'var(--text-secondary)' }}>Email: {user?.email}</p>
      </div>
    </div>
  );
};
    `,
    'src/pages/ProductsList.tsx': `
import React, { useEffect, useState } from 'react';
import api from '../api/axios';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
}

export const ProductsList = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        if (res.data.success) {
          setProducts(res.data.data.products);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Products</h1>
        <button className="btn btn-primary">Add Product</button>
      </div>
      <div className="grid-cols-3">
        {products.map(p => (
          <div key={p._id} className="card">
            <h3>{p.title}</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0' }}>{p.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <span style={{ fontWeight: 'bold' }}>$\${p.price}</span>
              <span style={{ fontSize: '0.875rem', background: 'var(--border)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{p.category}</span>
            </div>
          </div>
        ))}
        {products.length === 0 && <p>No products found.</p>}
      </div>
    </div>
  );
};
    `,
    'src/pages/UsersList.tsx': `
import React, { useEffect, useState } from 'react';
import api from '../api/axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        if (res.data.success) {
          setUsers(res.data.data.users);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Manage Users</h1>
      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
    `,
    'src/routes/index.tsx': `
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { ProductsList } from '../pages/ProductsList';
import { UsersList } from '../pages/UsersList';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
        <Route path="dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="products" element={
          <ProtectedRoute>
            <ProductsList />
          </ProtectedRoute>
        } />
        
        <Route path="users" element={
          <ProtectedRoute adminOnly>
            <UsersList />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};
    `,
    'src/App.tsx': `
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
    `
};

createFiles(path.join(__dirname, 'frontend'), frontendStructure);
console.log('Frontend generated');
