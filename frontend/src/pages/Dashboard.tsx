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
