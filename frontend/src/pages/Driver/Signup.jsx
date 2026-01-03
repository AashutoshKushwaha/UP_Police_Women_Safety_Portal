import React, { useState, useContext } from 'react';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../api/AuthContext';

const DriverSignup = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value.toUpperCase() }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await api.post('/users/register', {
        username: form.username,
        password: form.password
      });
      alert('Signup successful! Please login.');
      navigate('/driver/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', marginTop: 100 }}>
      <h2>Driver Signup</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label>Username (capital letters only)</label><br />
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            autoComplete="off"
            required
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Password</label><br />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Confirm Password</label><br />
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            required
          />
        </div>

        {!!error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" style={{ marginTop: 10 }}>
          Signup
        </button>
      </form>

      <button onClick={() => navigate('/driver/login')} style={{ marginTop: 10 }}>
        Already have an account? Login
      </button>
    </div>
  );
};

export default DriverSignup;
