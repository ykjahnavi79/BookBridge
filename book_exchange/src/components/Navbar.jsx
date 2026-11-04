import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [navOpen, setNavOpen] = useState(false);
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const toggleNav = () => {
    setNavOpen(!navOpen);
  };

  const closeNav = () => {
    setNavOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeNav();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={closeNav}>
          <span style={{ fontSize: "1.4rem" }}>📚</span>
          <span>BookBridge</span>
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNav}
          aria-expanded={navOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className={`collapse navbar-collapse ${navOpen ? "show" : ""}`}>
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <NavLink
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              to="/"
              onClick={closeNav}
            >
              Home
            </NavLink>

            <NavLink
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              to="/books"
              onClick={closeNav}
            >
              Browse Books
            </NavLink>

            <NavLink
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              to="/my-listings"
              onClick={closeNav}
            >
              My Listings
            </NavLink>

            {/* DASHBOARD / SIGN IN */}
            {isAuthenticated ? (
              <>
                <NavLink
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  to="/user-dashboard"
                  onClick={closeNav}
                >
                  Dashboard
                </NavLink>

                {isAdmin && (
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    to="/admin-dashboard"
                    onClick={closeNav}
                  >
                    🛡️ Admin Portal
                  </NavLink>
                )}

                {/* Profile Pill & Logout */}
                <div className="d-flex align-items-center gap-2 ms-lg-2 mt-2 mt-lg-0">
                  <span className="badge bg-secondary-subtle text-light border px-2 py-1 small">
                    {isAdmin ? "🛡️ Admin" : currentUser?.name || "User"}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-danger btn-sm py-1 px-2 rounded-pill"
                    title="Sign out"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <NavLink
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                to="/login"
                onClick={closeNav}
              >
                Sign In
              </NavLink>
            )}

            <Link
              to={isAuthenticated ? "/add-book" : "/login"}
              state={!isAuthenticated ? { from: { pathname: "/add-book" } } : undefined}
              className="btn btn-primary-custom ms-lg-2 mt-2 mt-lg-0"
              onClick={closeNav}
            >
              + List a Book
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
