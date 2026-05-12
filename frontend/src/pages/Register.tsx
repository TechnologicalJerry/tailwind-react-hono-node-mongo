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
