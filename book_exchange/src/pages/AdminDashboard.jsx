import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

function AdminDashboard() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'books' | 'users' | 'inquiries' | 'system'
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [bookSearch, setBookSearch] = useState("");

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, booksRes, usersRes, inqRes] = await Promise.all([
        API.get("/admin/stats").catch(() => null),
        API.get("/books"),
        API.get("/auth/users").catch(() => ({ data: [] })),
        API.get("/inquiries").catch(() => ({ data: [] }))
      ]);

      if (statsRes?.data) {
        setStats(statsRes.data);
      }
      setBooks(booksRes?.data || []);
      setUsers(usersRes?.data || []);
      setInquiries(inqRes?.data || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: "", message: "" }), 3500);
  };

  // ADMIN BOOK ACTIONS
  const handleToggleBook = async (id) => {
    try {
      const res = await API.patch(`/books/${id}/toggle`);
      setBooks((prev) => prev.map((b) => (b._id === id ? res.data.book : b)));
      showNotification("success", "Book status updated.");
    } catch {
      showNotification("danger", "Failed to update book.");
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Permanently delete this book listing?")) return;
    try {
      await API.delete(`/books/${id}`);
      setBooks((prev) => prev.filter((b) => b._id !== id));
      showNotification("success", "Book listing removed by admin.");
    } catch {
      showNotification("danger", "Failed to delete book.");
    }
  };

  // ADMIN USER ACTIONS
  const handleToggleUserRole = async (userId) => {
    try {
      const res = await API.patch(`/auth/users/${userId}/role`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: res.data.user.role } : u))
      );
      showNotification("success", res.data.message);
    } catch {
      showNotification("danger", "Failed to toggle role.");
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await API.patch(`/auth/users/${userId}/status`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: res.data.user.status } : u))
      );
      showNotification("success", res.data.message);
    } catch {
      showNotification("danger", "Failed to toggle user status.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/auth/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      showNotification("success", "User account removed.");
    } catch {
      showNotification("danger", "Failed to delete user.");
    }
  };

  // SYSTEM TOOLS
  const handleReseedBooks = async () => {
    if (!window.confirm("Reseed 15 curated books into the database?")) return;
    try {
      setLoading(true);
      await API.post("/books/seed?force=true");
      await fetchAdminData();
      showNotification("success", "Database seeded with 15 sample books!");
    } catch {
      showNotification("danger", "Seeding failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearBooks = async () => {
    if (!window.confirm("WARNING: Clear all book listings from the database?")) return;
    try {
      setLoading(true);
      await API.post("/admin/clear-books");
      await fetchAdminData();
      showNotification("warning", "All book listings cleared.");
    } catch {
      showNotification("danger", "Failed to clear books.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      books,
      users,
      inquiries
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookbridge-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification("success", "Exported platform data JSON file.");
  };

  // Metrics fallback from state
  const totalBooks = stats?.metrics?.totalBooks ?? books.length;
  const availableBooks = stats?.metrics?.availableBooks ?? books.filter((b) => b.availability).length;
  const exchangedBooks = stats?.metrics?.exchangedBooks ?? (totalBooks - availableBooks);
  const totalUsers = stats?.metrics?.totalUsers ?? (users.length || 3);
  const totalInquiries = stats?.metrics?.totalInquiries ?? inquiries.length;
  const totalValue = stats?.metrics?.totalListingValue ?? books.reduce((s, b) => b.exchangeType === "Sell" ? s + (Number(b.price) || 0) : s, 0);

  const filteredBooks = books.filter((b) => {
    const q = bookSearch.toLowerCase();
    return (
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q)
    );
  });

  if (!isAdmin) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: "500px" }}>
        <div className="card p-5 shadow-sm border-0 rounded-4 bg-white">
          <div style={{ fontSize: "3rem" }}>🛡️🔒</div>
          <h3 className="fw-bold mt-2">Administrator Access Required</h3>
          <p className="text-muted">This portal is reserved for BookBridge administrators. Please sign in with an administrator account.</p>
          <div className="mt-2">
            <Link to="/login" className="btn btn-dark px-4">
              Sign In as Administrator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* ADMIN PORTAL HEADER */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-dark text-white p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fs-3 shadow"
              style={{ width: "65px", height: "65px" }}
            >
              🛡️
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h3 className="fw-bold mb-0">Administrator Portal</h3>
                <span className="badge bg-danger rounded-pill px-3 py-1">Super Admin</span>
              </div>
              <p className="text-secondary small mb-0 mt-1">
                Platform control panel • Logged in as: <strong>{currentUser?.name || "Administrator"}</strong> ({currentUser?.email || "admin@bookbridge.com"})
              </p>
            </div>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <button onClick={handleReseedBooks} className="btn btn-sm btn-outline-warning rounded-pill px-3">
              🔄 Seed 15 Books
            </button>
            <button onClick={handleExportData} className="btn btn-sm btn-outline-light rounded-pill px-3">
              ⬇ Export Data
            </button>
            <Link to="/user-dashboard" className="btn btn-sm btn-outline-info rounded-pill px-3">
              👤 User View
            </Link>
          </div>
        </div>
      </div>

      {feedback.message && (
        <div className={`alert alert-${feedback.type} shadow-sm border-0 mb-4`}>
          {feedback.message}
        </div>
      )}

      {/* KPI METRICS OVERVIEW */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <small className="text-muted fw-bold text-uppercase">Total Books</small>
            <div className="fs-3 fw-bold text-dark mt-1">{totalBooks}</div>
            <span className="text-muted small">In catalog</span>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <small className="text-muted fw-bold text-uppercase">Available</small>
            <div className="fs-3 fw-bold text-success mt-1">{availableBooks}</div>
            <span className="text-success small">Ready for swap</span>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <small className="text-muted fw-bold text-uppercase">Exchanged</small>
            <div className="fs-3 fw-bold text-primary mt-1">{exchangedBooks}</div>
            <span className="text-primary small">Completed</span>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <small className="text-muted fw-bold text-uppercase">Total Users</small>
            <div className="fs-3 fw-bold text-indigo mt-1" style={{ color: "#4f46e5" }}>{totalUsers}</div>
            <span className="text-muted small">Community</span>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <small className="text-muted fw-bold text-uppercase">Inquiries</small>
            <div className="fs-3 fw-bold text-warning mt-1">{totalInquiries}</div>
            <span className="text-muted small">Requests</span>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <small className="text-muted fw-bold text-uppercase">Market Value</small>
            <div className="fs-3 fw-bold text-success mt-1">₹{totalValue}</div>
            <span className="text-muted small">Total catalog</span>
          </div>
        </div>
      </div>

      {/* ADMIN TABS */}
      <ul className="nav nav-pills mb-4 bg-white p-2 rounded-4 shadow-sm border">
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Analytics & Trends
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === "books" ? "active" : ""}`}
            onClick={() => setActiveTab("books")}
          >
            📚 Manage Books ({books.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            👥 Manage Users ({users.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === "inquiries" ? "active" : ""}`}
            onClick={() => setActiveTab("inquiries")}
          >
            📬 Inquiries ({inquiries.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === "system" ? "active" : ""}`}
            onClick={() => setActiveTab("system")}
          >
            ⚙️ System Controls
          </button>
        </li>
      </ul>

      {/* --- TAB 1: OVERVIEW & BREAKDOWNS --- */}
      {activeTab === "overview" && (
        <div className="row g-4">
          {/* CATEGORY BREAKDOWN */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h5 className="fw-bold mb-3">Genre / Category Breakdown</h5>
              {stats?.breakdowns?.categories ? (
                <div className="d-flex flex-column gap-3">
                  {Object.entries(stats.breakdowns.categories).map(([cat, count]) => {
                    const percent = Math.round((count / (totalBooks || 1)) * 100);
                    return (
                      <div key={cat}>
                        <div className="d-flex justify-content-between small fw-semibold mb-1">
                          <span>{cat}</span>
                          <span>{count} books ({percent}%)</span>
                        </div>
                        <div className="progress" style={{ height: "8px" }}>
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted small">Loading category analytics...</p>
              )}
            </div>
          </div>

          {/* LISTING TYPE & CONDITION */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h5 className="fw-bold mb-3">Exchange Model Distribution</h5>
              {stats?.breakdowns?.exchangeTypes ? (
                <div className="d-flex flex-column gap-3 mb-4">
                  {Object.entries(stats.breakdowns.exchangeTypes).map(([type, count]) => {
                    const percent = Math.round((count / (totalBooks || 1)) * 100);
                    const color = type === "Exchange" ? "bg-primary" : type === "Sell" ? "bg-success" : "bg-info";
                    return (
                      <div key={type}>
                        <div className="d-flex justify-content-between small fw-semibold mb-1">
                          <span>{type}</span>
                          <span>{count} ({percent}%)</span>
                        </div>
                        <div className="progress" style={{ height: "8px" }}>
                          <div
                            className={`progress-bar ${color}`}
                            role="progressbar"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              <h6 className="fw-bold mb-2">Book Conditions</h6>
              {stats?.breakdowns?.conditions ? (
                <div className="d-flex flex-column gap-2">
                  {Object.entries(stats.breakdowns.conditions).map(([cond, count]) => (
                    <div key={cond} className="d-flex justify-content-between small text-secondary">
                      <span>Condition: <strong>{cond}</strong></span>
                      <span className="badge bg-light text-dark border">{count} books</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: MANAGE ALL BOOKS --- */}
      {activeTab === "books" && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="input-group" style={{ maxWidth: "340px" }}>
              <span className="input-group-text bg-white border-end-0">🔍</span>
              <input
                type="text"
                className="form-control border-start-0 shadow-none"
                placeholder="Filter catalog by title/author..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
              />
            </div>
            <Link to="/add-book" className="btn btn-primary-custom btn-sm rounded-pill">
              + Add Book
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title & Author</th>
                  <th>Category</th>
                  <th>Type & Price</th>
                  <th>Status</th>
                  <th className="text-end">Admin Controls</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          style={{
                            width: "36px",
                            height: "48px",
                            borderRadius: "4px",
                            overflow: "hidden",
                            backgroundColor: "#1e293b",
                            flexShrink: 0
                          }}
                        >
                          {b.image ? (
                            <img
                              src={b.image}
                              alt={b.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white small">📖</div>
                          )}
                        </div>
                        <div>
                          <Link to={`/books/${b._id}`} className="fw-bold text-dark text-decoration-none">
                            {b.title}
                          </Link>
                          <div className="text-muted small">by {b.author}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge bg-light text-secondary border small">{b.category}</span>
                    </td>

                    <td>
                      <span className="fw-semibold small">
                        {b.exchangeType === "Sell" ? `₹${b.price}` : b.exchangeType}
                      </span>
                    </td>

                    <td>
                      <button
                        onClick={() => handleToggleBook(b._id)}
                        className={`btn btn-xs btn-sm ${
                          b.availability ? "btn-outline-success" : "btn-outline-secondary"
                        } rounded-pill px-2 py-0`}
                        style={{ fontSize: "0.8rem" }}
                      >
                        {b.availability ? "✓ Available" : "Exchanged"}
                      </button>
                    </td>

                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link to={`/books/${b._id}`} className="btn btn-outline-secondary">
                          View
                        </Link>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteBook(b._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: MANAGE USERS --- */}
      {activeTab === "users" && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white p-3">
            <h5 className="fw-bold mb-0">Registered Community Users</h5>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th>Location</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end">Role & Account Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id || u.email}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: "38px", height: "38px" }}
                        >
                          {u.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <strong className="text-dark d-block">{u.name}</strong>
                          <span className="text-muted small">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="small text-muted">{u.location || "India"}</span>
                    </td>

                    <td>
                      <span className={`badge ${u.role === "admin" ? "bg-danger" : "bg-primary"} rounded-pill px-3`}>
                        {u.role === "admin" ? "🛡️ Admin" : "👤 User"}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${u.status === "suspended" ? "bg-warning text-dark" : "bg-success"} rounded-pill px-2`}>
                        {u.status || "active"}
                      </span>
                    </td>

                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => handleToggleUserRole(u._id)}
                          title="Toggle user/admin role"
                        >
                          Toggle Role
                        </button>
                        <button
                          className={`btn ${u.status === "suspended" ? "btn-outline-success" : "btn-outline-warning"}`}
                          onClick={() => handleToggleUserStatus(u._id)}
                        >
                          {u.status === "suspended" ? "Activate" : "Suspend"}
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteUser(u._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: ALL INQUIRIES --- */}
      {activeTab === "inquiries" && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white p-4">
          <h5 className="fw-bold mb-3">All Exchange Inquiries Platform-Wide</h5>
          {inquiries.length === 0 ? (
            <p className="text-muted">No inquiries recorded yet.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {inquiries.map((inq) => (
                <div key={inq._id} className="p-3 border rounded-3 bg-light">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span className="badge bg-primary me-2">{inq.exchangeType}</span>
                      <strong>{inq.bookTitle}</strong>
                    </div>
                    <span className="badge bg-secondary">{inq.status}</span>
                  </div>
                  <p className="small text-secondary mb-1">"{inq.message}"</p>
                  <small className="text-muted">
                    Sender: <strong>{inq.senderName}</strong> ({inq.senderEmail}) • Receiver: {inq.ownerEmail || "Community"}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 5: SYSTEM CONTROLS --- */}
      {activeTab === "system" && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white" style={{ maxWidth: "700px" }}>
          <h5 className="fw-bold mb-3">System Maintenance & Controls</h5>

          <div className="d-flex flex-column gap-3">
            <div className="p-3 border rounded-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-1">Seed Curated Sample Books</h6>
                <p className="text-muted small mb-0">Inserts 15 diverse books across Fiction, Academic, Sci-Fi, and Self-Help.</p>
              </div>
              <button onClick={handleReseedBooks} className="btn btn-warning btn-sm fw-bold px-3">
                Seed Database
              </button>
            </div>

            <div className="p-3 border rounded-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-1">Export Platform Backup</h6>
                <p className="text-muted small mb-0">Downloads a complete JSON snapshot of books, users, and inquiries.</p>
              </div>
              <button onClick={handleExportData} className="btn btn-outline-primary btn-sm px-3">
                Download JSON
              </button>
            </div>

            <div className="p-3 border rounded-3 d-flex justify-content-between align-items-center bg-danger-subtle border-danger-subtle">
              <div>
                <h6 className="fw-bold text-danger mb-1">Clear Entire Catalog</h6>
                <p className="text-muted small mb-0">Removes all books from the database. Use with caution.</p>
              </div>
              <button onClick={handleClearBooks} className="btn btn-danger btn-sm px-3">
                Clear All Books
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

