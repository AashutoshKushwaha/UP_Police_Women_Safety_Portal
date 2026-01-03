import React, { useContext, useEffect, useState, useRef } from 'react';
import api from '../../api/api';
import { AuthContext } from '../../api/AuthContext';
import { useNavigate } from 'react-router-dom';
import qrTemplate from '../../assets/qrtemplate.png';

const DriverDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  const base = (process.env.REACT_APP_API_BASE || 'http://localhost:5000').replace('/api', '');

  const qrImgRef = useRef();
  const templateImgRef = useRef();

  async function fetchSubmission() {
    try {
      const res = await api.get('/driver/my');
      setSubmission(res.data);
    } catch {
      setSubmission(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubmission();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDownloadQR = () => {
    const canvas = document.createElement('canvas');
    const size = 400;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    const template = templateImgRef.current;
    const qrImg = qrImgRef.current;
    if (!template || !qrImg) {
      alert("Images not loaded, please wait.");
      return;
    }
    ctx.drawImage(template, 0, 0, size, size);
    ctx.drawImage(qrImg, 110, 110, 180, 180);

    canvas.toBlob(blob => {
      const link = document.createElement('a');
      link.download = 'verification-qr.png';
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    }, 'image/png', 1);
  };

  const renderField = (key, value) => {
    if (!value) return null;
    if (typeof value === 'string' && value.match(/\.(jpg|jpeg|png)$/i)) {
      return (
        <div key={key} style={{ marginBottom: 10 }}>
          <strong>{key}:</strong>
          <br />
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
          <a
            href={`${base}/uploads/${value}`}
            target="_blank"
            rel="noopener noreferrer"
          >
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
    <div style={{ maxWidth: 900, margin: 'auto', marginTop: 20 }}>
      <h1>Driver Dashboard</h1>
      <button onClick={handleLogout} style={{ float: 'right', marginBottom: 20 }}>
        Logout
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : submission ? (
        <div>
          <h3>Submission Status: {submission.status.toUpperCase()}</h3>
          {submission.status === 'rejected' && (
            <p style={{ color: 'red' }}>Reason: {submission.adminReason}</p>
          )}
          <h4>Submitted Data:</h4>
          <div>
            {submission.data &&
              Object.entries(submission.data).map(([key, val]) => renderField(key, val))}
          </div>
          <button onClick={() => navigate('/driver/submit')} style={{ marginTop: 15 }}>
            Submit / Edit Form
          </button>

          {submission.status === 'verified' && submission.qrCodePath && (
            <div style={{ marginTop: 20 }}>
              <h4>Your Verification QR Code:</h4>
              <img
                ref={qrImgRef}
                src={`${base}/uploads/${submission.qrCodePath}`}
                alt="QR Code"
                style={{
                  maxWidth: '200px',
                  marginBottom: 10,
                  border: '1px solid #ccc',
                  padding: 5,
                  display: 'block'
                }}
                crossOrigin="anonymous"
              />
              <img
                ref={templateImgRef}
                src={qrTemplate}
                alt="Background Template"
                style={{ display: 'none' }}
                crossOrigin="anonymous"
              />
              <button onClick={handleDownloadQR} style={{ marginTop: 10 }}>
                Download QR Template PNG
              </button>
              <p>Paste this on your vehicle</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p>No submission data found yet.</p>
          <button onClick={() => navigate('/driver/submit')}>Submit Form</button>
        </div>
      )}
    </div>
  );
};
export default DriverDashboard;
