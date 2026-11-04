import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, currentUser } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    location: ""
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || (currentUser?.role === "admin" ? "/admin-dashboard" : "/user-dashboard");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    if (isRegistering) {
      const result = await register(formData);
      if (result.success) {
        setSuccessMsg("Account created successfully! Redirecting...");
        setTimeout(() => {
          navigate(formData.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
        }, 1000);
      } else {
        setError(result.message);
      }
    } else {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        if (formData.email.toLowerCase().includes("admin")) {
          navigate("/admin-dashboard");
        } else {
          navigate(from);
        }
      } else {
        setError(result.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="container py-5" style={{ maxWidth: "460px" }}>
      <div className="text-center mb-4">
        <span style={{ fontSize: "3rem" }}>📚</span>
        <h2 className="fw-bold mt-2">
          {isRegistering ? "Create an Account" : "Sign In to BookBridge"}
        </h2>
        <p className="text-muted">
          {isRegistering
            ? "Create your personal account to list books, swap reads, and connect."
            : "Enter your email and password to access your account."}
        </p>
      </div>

      {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}
      {successMsg && <div className="alert alert-success shadow-sm border-0">{successMsg}</div>}

      <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5 bg-white">
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="mb-3">
              <label className="form-label small fw-semibold">Full Name <span className="text-danger">*</span></label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="e.g. Komala Jahnavi"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label small fw-semibold">Email Address <span className="text-danger">*</span></label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="e.g. jahnavi@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Password <span className="text-danger">*</span></label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {isRegistering && (
            <>
              <div className="mb-3">
                <label className="form-label small fw-semibold">City / Location</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  placeholder="e.g. Guntur, India"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Account Type</label>
                <select
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">Reader / Community Member</option>
                  <option value="admin">Platform Administrator</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary-custom w-100 py-2 fw-semibold"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" />
            ) : isRegistering ? (
              "Sign Up"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <hr className="my-4 text-muted" />

        <div className="text-center">
          {isRegistering ? (
            <p className="small mb-0 text-muted">
              Already have an account?{" "}
              <button
                type="button"
                className="btn btn-link p-0 small fw-bold text-decoration-none"
                onClick={() => {
                  setIsRegistering(false);
                  setError("");
                  setSuccessMsg("");
                }}
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="small mb-0 text-muted">
              New to BookBridge?{" "}
              <button
                type="button"
                className="btn btn-link p-0 small fw-bold text-decoration-none"
                onClick={() => {
                  setIsRegistering(true);
                  setError("");
                  setSuccessMsg("");
                }}
              >
                Create Account (New Member)
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
