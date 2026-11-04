import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

function UserDashboard() {
  const { currentUser, updateProfile, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("listings"); // 'listings' | 'inquiries' | 'profile'
  const [books, setBooks] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
    location: currentUser?.location || "",
    bio: currentUser?.bio || "",
    avatar: currentUser?.avatar || ""
  });
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [booksRes, inqRes] = await Promise.all([
        API.get("/books"),
        API.get("/inquiries")
      ]);
      setBooks(booksRes.data || []);
      setInquiries(inqRes.data || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      const response = await API.patch(`/books/${id}/toggle`);
      setBooks((prev) =>
        prev.map((b) => (b._id === id ? response.data.book : b))
      );
    } catch (err) {
      console.error("Error toggling book:", err);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Remove this book from your listings?")) return;
    try {
      await API.delete(`/books/${id}`);
      setBooks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Error deleting book:", err);
    }
  };

  const handleInquiryStatus = async (id, newStatus) => {
    try {
      const res = await API.patch(`/inquiries/${id}/status`, { status: newStatus });
      setInquiries((prev) =>
        prev.map((inq) => (inq._id === id ? res.data.inquiry : inq))
      );
    } catch (err) {
      console.error("Failed to update inquiry status:", err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(profileForm);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // Metrics
  const totalListings = books.length;
  const availableListings = books.filter((b) => b.availability).length;
  const exchangedListings = totalListings - availableListings;
  const totalInquiriesCount = inquiries.length;

  if (!currentUser) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: "500px" }}>
        <div className="card p-5 shadow-sm border-0 rounded-4 bg-white">
          <div style={{ fontSize: "3rem" }}>🔐</div>
          <h3 className="fw-bold mt-2">Sign In Required</h3>
          <p className="text-muted">Please sign in to view your dashboard, manage your listings, and check reader inquiries.</p>
          <div className="mt-2">
            <Link to="/login" className="btn btn-primary-custom px-4">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* USER PROFILE HEADER BANNER */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
        <div
          style={{
            height: "110px",
            background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)"
          }}
        />
        <div className="card-body p-4 pt-0">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 position-relative" style={{ marginTop: "-50px" }}>
            <div className="d-flex align-items-end gap-3">
              <div
                className="rounded-circle shadow-lg border border-4 border-white bg-dark overflow-hidden flex-shrink-0"
                style={{ width: "95px", height: "95px" }}
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-100 h-100 object-fit-cover"
                  />
                ) : (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white fs-2 fw-bold">
                    {currentUser?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>

              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h3 className="fw-bold mb-0 text-dark">{currentUser?.name || "Reader"}</h3>
                  <span className="badge bg-primary-subtle text-primary border rounded-pill px-3 py-1">
                    👤 Community Reader
                  </span>
                </div>
                <p className="text-muted small mb-0">
                  {currentUser?.email} • 📍 {currentUser?.location || "India"}
                </p>
              </div>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <Link to="/add-book" className="btn btn-primary-custom btn-sm rounded-pill px-3">
                + List a Book
              </Link>
              <Link to="/books" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                Browse Library
              </Link>
            </div>
          </div>

          {currentUser?.bio && (
            <p className="text-secondary small mt-3 mb-0 pt-2 border-top">
              "{currentUser.bio}"
            </p>
          )}
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <span className="text-muted small fw-semibold text-uppercase">Listed Books</span>
            <div className="fs-3 fw-bold text-dark mt-1">{totalListings}</div>
            <small className="text-muted">Total items posted</small>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <span className="text-muted small fw-semibold text-uppercase">Available</span>
            <div className="fs-3 fw-bold text-success mt-1">{availableListings}</div>
            <small className="text-success">Ready for swap/sale</small>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <span className="text-muted small fw-semibold text-uppercase">Exchanged</span>
            <div className="fs-3 fw-bold text-primary mt-1">{exchangedListings}</div>
            <small className="text-primary">Books shared</small>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <span className="text-muted small fw-semibold text-uppercase">Inquiries</span>
            <div className="fs-3 fw-bold text-warning mt-1">{totalInquiriesCount}</div>
            <small className="text-muted">Reader proposals</small>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <ul className="nav nav-pills mb-4 bg-white p-2 rounded-4 shadow-sm border">
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === "listings" ? "active" : ""}`}
            onClick={() => setActiveTab("listings")}
          >
            📚 My Listings ({totalListings})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === "inquiries" ? "active" : ""}`}
            onClick={() => setActiveTab("inquiries")}
          >
            📬 Exchange Inquiries ({totalInquiriesCount})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            ⚙️ Profile Settings
          </button>
        </li>
      </ul>

      {/* --- TAB 1: LISTINGS --- */}
      {activeTab === "listings" && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">Active Bookshelf</h5>
            <Link to="/add-book" className="btn btn-sm btn-outline-primary rounded-pill">
              + Add Another Book
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-5 p-3">
              <div style={{ fontSize: "2.5rem" }}>📖</div>
              <h5 className="fw-bold mt-2">No books listed yet</h5>
              <p className="text-muted small">Share a book with your fellow community readers today.</p>
              <Link to="/add-book" className="btn btn-primary-custom btn-sm">
                List Your First Book
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Book</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div
                            style={{
                              width: "38px",
                              height: "50px",
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
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white small">
                                📖
                              </div>
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
                        <span className="badge bg-light text-secondary border small">
                          {b.category}
                        </span>
                      </td>
                      <td>
                        <span className="fw-semibold small">
                          {b.exchangeType === "Sell" ? `₹${b.price}` : b.exchangeType}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleAvailability(b._id)}
                          className={`btn btn-xs btn-sm ${
                            b.availability ? "btn-outline-success" : "btn-outline-secondary"
                          } rounded-pill px-2 py-0`}
                          style={{ fontSize: "0.8rem" }}
                          title="Click to toggle status"
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
          )}
        </div>
      )}

      {/* --- TAB 2: INQUIRIES & PROPOSALS --- */}
      {activeTab === "inquiries" && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white p-3 p-md-4">
          <h5 className="fw-bold mb-3">Reader Exchange Inquiries & Messages</h5>

          {inquiries.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: "2.5rem" }}>📬</div>
              <h5 className="fw-bold mt-2">No incoming requests yet</h5>
              <p className="text-muted small">
                When readers request your books or send swap offers, they will appear here.
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {inquiries.map((inq) => (
                <div key={inq._id} className="card border rounded-3 p-3 bg-light shadow-none">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                    <div>
                      <span className="badge bg-primary me-2">{inq.exchangeType}</span>
                      <strong className="fs-6 text-dark">{inq.bookTitle}</strong>
                    </div>
                    <span
                      className={`badge ${
                        inq.status === "Accepted"
                          ? "bg-success"
                          : inq.status === "Declined"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      } rounded-pill px-3 py-1`}
                    >
                      Status: {inq.status}
                    </span>
                  </div>

                  <p className="mb-2 text-secondary small bg-white p-3 rounded-2 border">
                    "{inq.message || "Hi, I am interested in exchanging or getting this book!"}"
                  </p>

                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 text-muted small">
                    <div>
                      From: <strong>{inq.senderName}</strong> • 📧 {inq.senderEmail} {inq.senderPhone && `• 📞 ${inq.senderPhone}`}
                    </div>

                    <div className="d-flex gap-2">
                      {inq.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleInquiryStatus(inq._id, "Accepted")}
                            className="btn btn-sm btn-success rounded-pill px-3 py-0"
                          >
                            ✓ Accept Offer
                          </button>
                          <button
                            onClick={() => handleInquiryStatus(inq._id, "Declined")}
                            className="btn btn-sm btn-outline-danger rounded-pill px-3 py-0"
                          >
                            ✕ Decline
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: PROFILE SETTINGS --- */}
      {activeTab === "profile" && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white" style={{ maxWidth: "650px" }}>
          <h5 className="fw-bold mb-3">Update Profile Information</h5>

          {profileSaved && (
            <div className="alert alert-success small mb-3">
              ✓ Profile saved successfully!
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Display Name</label>
              <input
                type="text"
                className="form-control"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label small fw-semibold">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>
              <div className="col-6">
                <label className="form-label small fw-semibold">City / Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Bengaluru"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Avatar Image URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://..."
                value={profileForm.avatar}
                onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Reader Bio</label>
              <textarea
                rows="3"
                className="form-control"
                placeholder="Share your favorite genres or reading preferences..."
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary-custom px-4">
              Save Profile Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;

