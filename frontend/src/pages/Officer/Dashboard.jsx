import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../api/AuthContext";
import QRScanner from "../../components/QRScanner";
import api from "../../api/api";

const OfficerDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Helper to render each field: images inline, PDFs clickable, others as text
  const renderField = (key, value) => {
    const baseUrl = (process.env.REACT_APP_API_BASE || "http://localhost:5000").replace(
      "/api",
      ""
    );
    if (!value) return null;

    if (typeof value === "string" && value.match(/\.(jpg|jpeg|png)$/i)) {
      return (
        <div key={key} style={{ marginBottom: 10 }}>
          <strong>{key}:</strong>
          <br />
          <img
            src={`${baseUrl}/uploads/${value}`}
            alt={key}
            style={{ maxWidth: "200px", border: "1px solid #ccc", padding: 5 }}
          />
        </div>
      );
    }

    if (typeof value === "string" && value.match(/\.pdf$/i)) {
      return (
        <div key={key} style={{ marginBottom: 10 }}>
          <strong>{key}:</strong>{" "}
          <a
            href={`${baseUrl}/uploads/${value}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View PDF
          </a>
        </div>
      );
    }

    if (typeof value === "string" || typeof value === "number") {
      return (
        <div key={key} style={{ marginBottom: 6 }}>
          <strong>{key}:</strong> {value}
        </div>
      );
    }

    // For nested objects (example: crimeHistory)
    if (typeof value === "object" && value !== null) {
      return (
        <div key={key} style={{ marginBottom: 10 }}>
          <strong>{key}:</strong>
          {Object.entries(value).map(([nestedKey, nestedValue]) => (
            <div key={nestedKey} style={{ marginLeft: "10px" }}>
              <strong>{nestedKey}:</strong> {String(nestedValue)}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  // Called on successful QR scan
  const handleScanSuccess = async (decodedText) => {
    try {
      const parsed = JSON.parse(decodedText);
      if (!parsed?.submissionId) throw new Error("Invalid QR code");

      const res = await api.post("/officer/scan", { submissionId: parsed.submissionId });
      setScanResult(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data from QR code");
      setScanResult(null);
    }
  };

  // Called on scanner error
  const handleScanError = (err) => {
    setError("QR scanner error");
    console.error(err);
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto", marginTop: 20 }}>
      <h1>Police Officer Dashboard - QR Scanner</h1>

      <button onClick={handleLogout} style={{ float: "right" }}>
        Logout
      </button>

      <div style={{ margin: "auto", maxWidth: 400 }}>
        <h3>Scan Verification QR Code</h3>
        <QRScanner onSuccess={handleScanSuccess} onError={handleScanError} />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {scanResult && (
        <div style={{ marginTop: 20 }}>
          <h3>Scanned Driver Data:</h3>
          {scanResult.data
            ? Object.entries(scanResult.data).map(([key, value]) =>
                renderField(key, value)
              )
            : "No data available"}
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;
//Aashutosh Kushwaha 