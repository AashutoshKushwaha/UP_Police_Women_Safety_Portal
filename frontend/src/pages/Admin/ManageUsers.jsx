import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'officer' });
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    })();
  }, [refresh]);

  const handleChange = e => {
    const { name, value } = e.target;
    // Apply toUpperCase only to username and password, not role
    const newValue = name === 'username' || name === 'password' ? value.toUpperCase() : value;
    setForm(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password) {
      setError('Username and password required');
      return;
    }
    try {
      await api.post('/admin/create', form);
      setForm({ username: '', password: '', role: 'officer' });
      setRefresh(!refresh);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: 'auto', marginTop: 20 }}>
      <h2>Manage Police Officers and Stations</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
        <label>Username</label>
        <input name="username" value={form.username} onChange={handleChange} required autoComplete="off" />
        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required />
        <label>Role</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="officer">Police Officer</option>
          <option value="station">Police Station</option>
        </select>
        {!!error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Create User</button>
      </form>

      <h3>Existing Users</h3>
      <table border="1" width="100%" cellPadding="5">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.username}</td>
              <td>{u.role}</td>
              <td>{new Date(u.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;