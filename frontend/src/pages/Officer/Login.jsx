import React, { useState, useContext } from 'react';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../api/AuthContext';

const OfficerLogin = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value.toUpperCase() }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/users/login', form);
      login(res.data.token, res.data.role, res.data.username);
      navigate('/officer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', marginTop: 100 }}>
      <h2>Police Officer Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Username (CAPITAL letters only)</label>
        <input name="username" value={form.username} onChange={handleChange} required autoComplete="off" />
        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required />
        {!!error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ marginTop: 10 }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default OfficerLogin;
