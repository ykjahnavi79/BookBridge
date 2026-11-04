import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_BOOKS } from "../data/defaultBooks";
import API from "../services/api";
import BookCard from "../components/BookCard";

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [recentBooks, setRecentBooks] = useState(DEFAULT_BOOKS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRecentBooks();
  }, []);

  const fetchRecentBooks = async () => {
    try {
      const response = await API.get("/books");
      if (response.data && response.data.length > 0) {
        setRecentBooks(response.data);
      } else {
        setRecentBooks(DEFAULT_BOOKS);
      }
    } catch (error) {
      console.log("Backend offline or loading, using preview collection:", error.message);
      setRecentBooks(DEFAULT_BOOKS);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/books");
    }
  };

  // Preview only 3 books before sign in, show 6 after sign in
  const visibleBooks = isAuthenticated ? recentBooks.slice(0, 6) : recentBooks.slice(0, 3);

  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero-section text-center">
        <div className="container">
          <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-2 rounded-pill mb-3">
            ✨ India's Friendly Peer-to-Peer Book Community
          </span>
          <h1 className="display-4 fw-extrabold mb-3 text-white">
            Give Your Books a Second Story
          </h1>
          <p className="lead hero-subtitle mb-4 fs-5">
            Connect with avid readers nearby. Swap your finished reads, discover rare gems,
            or sell books at student-friendly prices.
          </p>

          {/* Quick Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="d-flex justify-content-center mb-4 mx-auto"
            style={{ maxWidth: "580px" }}
          >
            <div className="input-group input-group-lg shadow-lg rounded-pill overflow-hidden bg-white p-1">
              <input
                type="text"
                className="form-control border-0 ps-3 shadow-none"
                placeholder="Search by title, author, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-primary-custom rounded-pill px-4" type="submit">
                Search
              </button>
            </div>
          </form>

          {/* Action CTAs */}
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/books" className="btn btn-outline-light btn-lg px-4 rounded-pill fw-semibold">
              Browse Books
            </Link>
            <Link
              to={isAuthenticated ? "/add-book" : "/login"}
              state={!isAuthenticated ? { from: { pathname: "/add-book" } } : undefined}
              className="btn btn-warning btn-lg px-4 rounded-pill fw-bold text-dark"
            >
              + Share / Sell a Book
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-5 bg-white border-bottom">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">How BookBridge Works</h2>
            <p className="text-muted">Simple, transparent, and built for readers</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-box text-center">
                <div className="feature-icon-wrapper mx-auto">1</div>
                <h4 className="fw-bold">List Your Book</h4>
                <p className="text-muted small">
                  Snap a picture or add a cover link. Set whether you'd like to exchange it,
                  sell it, or give it away for free.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-box text-center">
                <div className="feature-icon-wrapper mx-auto">2</div>
                <h4 className="fw-bold">Discover & Connect</h4>
                <p className="text-muted small">
                  Filter by category, condition, or author. Send exchange proposals or purchase
                  inquiries directly to book owners.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-box text-center">
                <div className="feature-icon-wrapper mx-auto">3</div>
                <h4 className="fw-bold">Swap & Enjoy</h4>
                <p className="text-muted small">
                  Meet up locally or ship securely. Keep books in circulation, save money,
                  and make friends who share your reading taste.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED / PREVIEW BOOKS SECTION */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <div className="d-flex align-items-center gap-2">
                <h2 className="fw-bold mb-1">
                  {isAuthenticated ? "Featured Listings" : "Preview Books"}
                </h2>
                {!isAuthenticated && (
                  <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 small">
                    Guest Preview (3 Books)
                  </span>
                )}
              </div>
              <p className="text-muted mb-0">
                {isAuthenticated
                  ? "Explore the freshest additions to our community bookshelf"
                  : "Showing a preview of 3 books. Sign in to browse all listings and request books."}
              </p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/books" className="btn btn-outline-primary fw-medium">
                View All Books →
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading books...</p>
            </div>
          ) : (
            <>
              <div className="row">
                {visibleBooks.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>

              {/* NOTICE FOR GUEST USERS BEFORE SIGN IN */}
              {!isAuthenticated && (
                <div className="card border-0 bg-primary-subtle text-primary p-4 rounded-4 text-center mt-4 shadow-sm">
                  <div style={{ fontSize: "2.2rem" }}>📖✨</div>
                  <h5 className="fw-bold mt-2 mb-1">Want to browse all community books?</h5>
                  <p className="text-secondary small mb-3" style={{ maxWidth: "560px", margin: "0 auto" }}>
                    You are previewing 3 books. Sign in or create an account to browse our entire library, connect with owners, and exchange books!
                  </p>
                  <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <Link to="/login" className="btn btn-primary btn-sm px-4 rounded-pill fw-semibold">
                      Sign In to View All Books →
                    </Link>
                    <Link
                      to="/login"
                      state={{ from: { pathname: "/add-book" } }}
                      className="btn btn-outline-primary btn-sm px-4 rounded-pill fw-semibold"
                    >
                      Sign In to List a Book
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* COMMUNITY HIGHLIGHT BANNER */}
      <section className="py-5 bg-light border-top">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <span className="badge bg-success-subtle text-success fw-bold px-3 py-2 rounded-pill mb-2">
                🌱 Eco-Friendly Reading
              </span>
              <h2 className="fw-bold mb-3">Why choose book exchanging?</h2>
              <ul className="list-unstyled d-flex flex-column gap-3 text-secondary">
                <li className="d-flex align-items-start gap-2">
                  <span className="text-success fs-5">✓</span>
                  <span><strong>Zero Waste:</strong> Reusing books keeps paper out of landfills and reduces carbon footprints.</span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <span className="text-success fs-5">✓</span>
                  <span><strong>Cost Effective:</strong> Read 10x more books for a fraction of the cost of buying brand-new editions.</span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <span className="text-success fs-5">✓</span>
                  <span><strong>Meet Bookworms:</strong> Form friendships with readers who share your passion for literature.</span>
                </li>
              </ul>
            </div>
            <div className="col-lg-6 text-center">
              <div className="card border-0 shadow-lg p-4 bg-primary text-white rounded-4">
                <h3 className="fw-bold mb-2">Have books gathering dust?</h3>
                <p className="mb-4 text-white-50">
                  Join thousands of readers swapping, sharing, and discovering stories every day.
                </p>
                <Link
                  to={isAuthenticated ? "/add-book" : "/login"}
                  state={!isAuthenticated ? { from: { pathname: "/add-book" } } : undefined}
                  className="btn btn-warning btn-lg fw-bold text-dark mx-auto px-4"
                >
                  List Your Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
