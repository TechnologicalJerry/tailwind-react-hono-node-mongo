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
