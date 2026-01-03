import React, { useState } from "react";
import api from "../../api/api";

const DriverDatabase = () => {
  const [filters, setFilters] = useState({
    firstName: "",
    fatherName: "",
    mobile: "",
    aadhaarNum: "",
  });
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/driver-database", { params: filters });
      setResults(data);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const handleSelect = async (driverId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/driver-details/${driverId}`);
      setSelected(data);
    } catch {
      setSelected(null);
    }
    setLoading(false);
  };

  const renderField = (key, value) => {
    const base = (process.env.REACT_APP_API_BASE || 'http://localhost:5000').replace('/api', '');
    if (!value) return null;
    if (typeof value === 'string' && value.match(/\.(jpg|jpeg|png)$/i)) {
      return (
        <div key={key}>
          <strong>{key}:</strong>
          <br />
          <img src={`${base}/uploads/${value}`} alt={key} style={{ maxWidth: 200 }} />
        </div>
      );
    }
    if (typeof value === 'string' && value.match(/\.pdf$/i)) {
      return (
        <div key={key}>
          <strong>{key}:</strong>{" "}
          <a href={`${base}/uploads/${value}`} target="_blank" rel="noopener noreferrer">View PDF</a>
        </div>
      );
    }
    if (typeof value === 'string' || typeof value === 'number') {
      return <div key={key}><strong>{key}:</strong> {String(value)}</div>;
    }
    if (typeof value === "object" && value !== null) {
      return (
        <div key={key}><strong>{key}:</strong>
          {Object.entries(value).map(([k, v]) => <div key={k} style={{ marginLeft: 12 }}><strong>{k}:</strong> {String(v)}</div>)}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ maxWidth: 950, margin: "auto", marginTop: 30 }}>
      <h2>Driver Database</h2>
      <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
        <input placeholder="First Name" name="firstName" value={filters.firstName} onChange={handleChange} />
        <input placeholder="Father's Name" name="fatherName" value={filters.fatherName} onChange={handleChange} />
        <input placeholder="Mobile" name="mobile" value={filters.mobile} onChange={handleChange} />
        <input placeholder="Aadhaar" name="aadhaarNum" value={filters.aadhaarNum} onChange={handleChange} />
        <button onClick={handleSearch} disabled={loading}>Search</button>
      </div>
      {loading && <p>Loading...</p>}
      {results.length > 0 &&
        <table border="1" cellPadding={5} width="100%">
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>Mobile</th>
              <th>Aadhaar</th>
              <th>Father's Name</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r._id}>
                <td>{r.firstName + " " + r.lastName}</td>
                <td>{r.mobile}</td>
                <td>{r.aadhaarNum}</td>
                <td>{r.fatherName}</td>
                <td>
                  <button onClick={() => handleSelect(r.driver)}>Open</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
      {selected && (
        <div>
          <h3>Latest Submission Details</h3>
          {selected.data && Object.entries(selected.data).map(([k, v]) => renderField(k, v))}
          {selected.qrCodePath &&
            <div>
              <strong>QR Code:</strong><br />
              <img src={`${(process.env.REACT_APP_API_BASE || 'https://pilot.zoneagrapolice.in').replace('/api', '')}/uploads/${selected.qrCodePath}`} style={{ maxWidth: 180 }} alt="QR" />
            </div>
          }
        </div>
      )}
    </div>
  );
};
export default DriverDatabase;
