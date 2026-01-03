import React, { useContext, useEffect, useState } from "react";
import api from "../../api/api";
import { AuthContext } from "../../api/AuthContext";
import { useNavigate, Link } from "react-router-dom";


const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedAssign, setSelectedAssign] = useState({});
  const [reason, setReason] = useState("");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const subRes = await api.get("/admin/submissions");
        setSubmissions(subRes.data);
        const usersRes = await api.get("/admin/users");
        setStations(usersRes.data.filter((u) => u.role === "station"));
      } catch (err) {
        alert("Failed to load data");
      }
    }
    fetchData();
  }, [refresh]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAssign = async (submissionId) => {
    const stationId = selectedAssign[submissionId];
    if (!stationId) {
      alert("Select a police station first");
      return;
    }
    try {
      await api.post(`/admin/assign/${submissionId}`, { stationId });
      alert("Assigned successfully");
      setSelectedAssign((prev) => ({ ...prev, [submissionId]: "" }));
      setRefresh((r) => !r);
    } catch (error) {
      alert(error.response?.data?.message || "Assign failed");
    }
  };

  const handleFinalVerify = async (submissionId, finalStatus) => {
    if (finalStatus === "rejected") {
      if (!reason) {
        alert("Please supply a rejection reason");
        return;
      }
    }
    try {
      await api.post(`/admin/verify/${submissionId}`, { finalStatus, reason });
      alert(`Submission ${finalStatus}`);
      setReason("");
      setSelectedAssign({});
      setRefresh((r) => !r);
    } catch (error) {
      alert(error.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "auto", marginTop: 20, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: 20 }}>Police Admin Dashboard</h1>
      <button onClick={handleLogout} style={{ float: "right", marginBottom: 10 }}>
        Logout
      </button>
      <Link to="/admin/manage-users" style={{ display: "inline-block", marginBottom: 20 }}>
        Manage Users
      </Link>
      
      <h2>Submissions</h2>
      <table
        style={{ width: "100%", borderCollapse: "collapse" }}
        border="1"
        cellPadding="5"
        cellSpacing="0"
      >
        <thead>
          <tr>
            <th>Driver</th>
            <th>Status</th>
            <th>Assigned Station</th>
            <th>Driver Chosen Station</th> {/* New Column */}
            <th>Station Verified</th>
            <th>Assign</th>
            <th>Final Verify / Reject</th>
            <th>Station Rejection Description</th>
            <th>Admin Rejection Reason</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s._id}>
              <td>{s.driver?.username || "-"}</td>
              <td>{s.adminFinalStatus?.toUpperCase() || "-"}</td>
              <td>{s.station?.username || "Not assigned"}</td>
              <td>{s.data?.nearestStation || "-"}</td> {/* Display driver chosen station */}
              <td>{s.stationVerified ? "Yes" : "No"}</td>
              <td>
                {s.adminFinalStatus === "pending" ? (
                  <>
                    <select
                      value={selectedAssign[s._id] || ""}
                      onChange={(e) =>
                        setSelectedAssign((prev) => ({ ...prev, [s._id]: e.target.value }))
                      }
                    >
                      <option value="">Select</option>
                      {stations.map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.username}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => handleAssign(s._id)} style={{ marginLeft: 8 }}>
                      Assign
                    </button>
                  </>
                ) : (
                  "N/A"
                )}
              </td>
              <td>
                {s.adminFinalStatus === "pending" && s.station ? (
                  <>
                    <button onClick={() => handleFinalVerify(s._id, "verified")} style={{ marginRight: 5 }}>
                      Verify
                    </button>
                    <button onClick={() => handleFinalVerify(s._id, "rejected")}>Reject</button>
                  </>
                ) : (
                  "N/A"
                )}
              </td>
              <td>{s.stationRejectedReason || "-"}</td>
              <td>
                {s.adminFinalStatus === "rejected" ? (
                  s.adminReason || "Rejected"
                ) : s.adminFinalStatus === "pending" ? (
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Rejection reason"
                    style={{ width: "100%" }}
                  />
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
//Aashutosh Kushwaha ,IIT KANPUR