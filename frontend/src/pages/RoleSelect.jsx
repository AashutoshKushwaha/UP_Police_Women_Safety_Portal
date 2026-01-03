import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelect = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      overflowX: 'hidden',  // Disable horizontal scrolling here
      background: `linear-gradient(rgba(28,32,48,0.62),rgba(32,42,60,0.50)), url('/bg.png') center/cover no-repeat fixed`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
      overflow: 'hidden'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.94)',
        borderRadius: '18px',
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
        padding: '3.5rem 2.5rem',
        minWidth: 340,
        maxWidth: 480,
        width: '90%',
        textAlign: 'center'
      }}>
        {/* Optional logo */}
        {/* <img src="/logo.png" alt="App Logo" style={{ width: 54, marginBottom: 16 }} /> */}
        <h1 style={{
          marginBottom: 10,
          color: '#2261bf',
          letterSpacing: '0.02em',
          fontWeight: 800,
          fontSize: '2.1rem'
        }}>Welcome Portal</h1>
        <p style={{
          color: '#566178',
          marginBottom: '2rem',
          fontSize: '1.05rem'
        }}>
          Please select your role to continue
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <RoleButton onClick={() => navigate('/driver/signup')}>Driver Signup</RoleButton>
          <RoleButton onClick={() => navigate('/driver/login')}>Driver Login</RoleButton>
          <RoleButton onClick={() => navigate('/officer/login')}>Police Officer Login</RoleButton>
          <RoleButton onClick={() => navigate('/admin/login')}>Police Admin Login</RoleButton>
          <RoleButton onClick={() => navigate('/station/login')}>Police Station Login</RoleButton>
        </div>
      </div>
    </div>
  );
};

function RoleButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '0.92rem 0',
        borderRadius: 8,
        border: 'none',
        fontSize: '1.12rem',
        fontWeight: 600,
        color: '#fff',
        cursor: 'pointer',
        background: 'linear-gradient(90deg,#2568c5 15%,#3190ee 85%)',
        boxShadow: '0 2px 6px rgba(52,143,235,0.06)',
        marginBottom: 0,
        letterSpacing: '0.02em',
        outline: 'none',
        transition: 'transform 0.14s, box-shadow 0.14s, background 0.18s'
      }}
      onMouseOver={e => {
        e.target.style.background = 'linear-gradient(90deg,#1c58ab 10%,#3190ee 95%)';
        e.target.style.transform = 'translateY(-2px) scale(1.03)';
        e.target.style.boxShadow = '0 6px 18px rgba(52,143,235,0.14)';
      }}
      onMouseOut={e => {
        e.target.style.background = 'linear-gradient(90deg,#2568c5 15%,#3190ee 85%)';
        e.target.style.transform = '';
        e.target.style.boxShadow = '0 2px 6px rgba(52,143,235,0.06)';
      }}
    >
      {children}
    </button>
  );
}

export default RoleSelect;
