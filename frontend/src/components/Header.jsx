import React from 'react';
import logo from '../assets/OIP.webp'; // Adjust path if needed

const Header = () => (
  <header style={{ display: 'flex', alignItems: 'center', padding: 10, backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
    <img src={logo} alt="Company Logo" style={{ height: 50, marginRight: 10 }} />
    <h1 style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>JAGRITI SURAKSHA PORTAL</h1>
  </header>
);

export default Header;
//Aashutosh Kushwaha ,IIT KANPUR