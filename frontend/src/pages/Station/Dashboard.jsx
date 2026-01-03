import React, { useEffect, useState, useContext } from 'react';
import api from '../../api/api';
import { AuthContext } from '../../api/AuthContext';
import { useNavigate } from 'react-router-dom';

const StationDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [history, setHistory] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [rejectReasons, setRejectReasons] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/station/assignments');
        setAssignments(res.data);
        const histRes = await api.get('/station/history');
        setHistory(histRes.data);
      } catch (e) {
        alert('Failed to load data');
      }
    }
    fetchData();
  }, [refresh]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRejectReasonChange = (id, value) => {
    setRejectReasons(prev => ({ ...prev, [id]: value }));
  };

  const handleVerify = async (id, status) => {
    if (status === 'rejected' && (!rejectReasons[id] || rejectReasons[id].trim() === '')) {
      alert('Please add rejection reason');
      return;
    }
    try {
      await api.post(`/station/verify/${id}`, { status, reason: rejectReasons[id] || '' });
      setRejectReasons(prev => ({ ...prev, [id]: '' }));
      setRefresh(r => !r);
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const renderField = (key, value) => {
    if (!value) return null;
    const base = (process.env.REACT_APP_API_BASE || 'http://localhost:5000').replace('/api', '');
    if (typeof value === 'string' && value.match(/\.(jpg|jpeg|png)$/i)) {
      return (
        <div key={key} style={{ marginBottom: 10 }}>
          <strong>{key}:</strong><br />
          <img
            src={`${base}/uploads/${value}`}
            alt={key}
            style={{ maxWidth: '200px', border: '1px solid #ccc', padding: 5 }}
          />
        </div>
      );
    }
    if (typeof value === 'string' && value.match(/\.pdf$/i)) {
      return (
        <div key={key} style={{ marginBottom: 10 }}>
          <strong>{key}:</strong>{' '}
          <a href={`${base}/uploads/${value}`} target="_blank" rel="noopener noreferrer">
            View PDF
          </a>
        </div>
      );
    }
    if (typeof value === 'string' || typeof value === 'number') {
      return (
        <div key={key} style={{ marginBottom: 6 }}>
          <strong>{key}:</strong> {String(value)}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ maxWidth: 1000, margin: 'auto', marginTop: 20 }}>
      <h1>Police Station Dashboard</h1>
      <button onClick={handleLogout} style={{ float: 'right', marginBottom: 20 }}>
        Logout
      </button>

      <h2>Pending Verification Requests</h2>
      {assignments.length === 0 ? (
        <p>No pending verification requests assigned.</p>
      ) : (
        assignments.map(submission => (
          <div key={submission._id} style={{ border: '1px solid grey', padding: 10, marginBottom: 10 }}>
            <p><strong>Driver:</strong> {submission.driver?.username}</p>
            <div>
              <strong>Details:</strong>
              {Object.entries(submission.data).map(([key, val]) => renderField(key, val))}
            </div>
            <button onClick={() => handleVerify(submission._id, 'verified')} style={{ marginRight: 10 }}>
              Verify
            </button>
            <button onClick={() => handleVerify(submission._id, 'rejected')}>Reject</button>
            <textarea
              placeholder="Rejection reason (required if rejecting)"
              rows={3}
              value={rejectReasons[submission._id] || ''}
              onChange={e => handleRejectReasonChange(submission._id, e.target.value)}
              style={{ display: 'block', marginTop: 10, width: '100%' }}
            />
          </div>
        ))
      )}

      <h2>Verified / Rejected Requests History</h2>
      {history.length === 0 ? (
        <p>No history found.</p>
      ) : (
        <table border="1" width="100%" cellPadding="5" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Driver</th>
              <th>Status</th>
              <th>Station Rejection Description</th>
              <th>Submission Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h._id}>
                <td>{h.driver?.username}</td>
                <td>{h.status ? h.status.toUpperCase() : '-'}</td>
                <td>{h.stationRejectedReason || '-'}</td>
                <td>{new Date(h.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StationDashboard;
//Aashutosh Kushwaha 