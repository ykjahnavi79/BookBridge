import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_BOOKS } from "../data/defaultBooks";
import API from "../services/api";
import BookCard from "../components/BookCard";

const CATEGORIES = ["All", "Fiction", "Non-Fiction", "Sci-Fi", "Academic", "Self-Help", "Fantasy", "Biography", "Other"];
const EXCHANGE_TYPES = ["All", "Exchange", "Sell", "Free"];
const CONDITIONS = ["All", "New", "Good", "Average"];

function filterLocalBooks(list, { search, category, exchangeType, condition, sort }) {
  let result = [...list];
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(b =>
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q)
    );
  }
  if (category && category !== "All") {
    result = result.filter(b => b.category?.toLowerCase() === category.toLowerCase());
  }
  if (exchangeType && exchangeType !== "All") {
    result = result.filter(b => b.exchangeType === exchangeType);
  }
  if (condition && condition !== "All") {
    result = result.filter(b => b.condition === condition);
  }
  if (sort === "price-asc") {
    result.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sort === "price-desc") {
    result.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sort === "title-asc") {
    result.sort((a, b) => a.title.localeCompare(b.title));
  }
  return result;
}

function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [books, setBooks] = useState(DEFAULT_BOOKS);
  const [loading, setLoading] = useState(false);

  // Filters state from URL or defaults
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "All";
  const exchangeType = searchParams.get("exchangeType") || "All";
  const condition = searchParams.get("condition") || "All";
  const sort = searchParams.get("sort") || "newest";

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    fetchBooks();
  }, [searchParams]);

  const fetchBooks = async () => {
    setLoading(true);

    try {
      const params = {};
      if (search) params.search = search;
      if (category && category !== "All") params.category = category;
      if (exchangeType && exchangeType !== "All") params.exchangeType = exchangeType;
      if (condition && condition !== "All") params.condition = condition;
      if (sort) params.sort = sort;

      const response = await API.get("/books", { params, timeout: 5000 });
      if (response.data && response.data.length > 0) {
        setBooks(response.data);
      } else if (!search && category === "All" && exchangeType === "All" && condition === "All") {
        setBooks(DEFAULT_BOOKS);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.log("Using preview books fallback:", err.message);
      const filtered = filterLocalBooks(DEFAULT_BOOKS, { search, category, exchangeType, condition, sort });
      setBooks(filtered);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === "All" || value === "newest") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam("search", searchInput.trim());
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const hasActiveFilters = search || category !== "All" || exchangeType !== "All" || condition !== "All" || sort !== "newest";

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold h2 mb-1">Explore Books</h1>
          <p className="text-muted mb-0">Discover novels, textbooks, non-fiction and more</p>
        </div>
        <Link
          to={isAuthenticated ? "/add-book" : "/login"}
          state={!isAuthenticated ? { from: { pathname: "/add-book" } } : undefined}
          className="btn btn-primary-custom align-self-start align-self-md-auto"
        >
          + List a Book
        </Link>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="card shadow-sm p-3 mb-4 border-0">
        <form onSubmit={handleSearchSubmit} className="mb-3">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">🔍</span>
            <input
              type="text"
              className="form-control border-start-0 ps-0 shadow-none"
              placeholder="Search by book title, author, category, or keywords..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchInput("");
                  updateParam("search", "");
                }}
              >
                ✕
              </button>
            )}
            <button className="btn btn-primary-custom" type="submit">
              Search
            </button>
          </div>
        </form>

        <div className="row g-2 align-items-center">
          {/* Category Filter */}
          <div className="col-sm-6 col-md-3">
            <label className="form-label small fw-semibold text-secondary mb-1">Category</label>
            <select
              className="form-select form-select-sm"
              value={category}
              onChange={(e) => updateParam("category", e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Exchange Type Filter */}
          <div className="col-sm-6 col-md-3">
            <label className="form-label small fw-semibold text-secondary mb-1">Exchange Type</label>
            <select
              className="form-select form-select-sm"
              value={exchangeType}
              onChange={(e) => updateParam("exchangeType", e.target.value)}
            >
              {EXCHANGE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === "All" ? "All Types (Exchange/Sell/Free)" : type}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div className="col-sm-6 col-md-3">
            <label className="form-label small fw-semibold text-secondary mb-1">Condition</label>
            <select
              className="form-select form-select-sm"
              value={condition}
              onChange={(e) => updateParam("condition", e.target.value)}
            >
              {CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond === "All" ? "All Conditions" : cond}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="col-sm-6 col-md-3">
            <label className="form-label small fw-semibold text-secondary mb-1">Sort By</label>
            <select
              className="form-select form-select-sm"
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title-asc">Title: A to Z</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
            <span className="small text-muted">
              Active filters applied
            </span>
            <button
              onClick={handleResetFilters}
              className="btn btn-sm btn-link text-danger text-decoration-none p-0"
            >
              Reset All Filters ✕
            </button>
          </div>
        )}
      </div>

      {/* BOOK LISTINGS CONTENT */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading books from library...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="card text-center py-5 px-3 border-0 shadow-sm rounded-4">
          <div style={{ fontSize: "3rem" }}>🔍</div>
          <h4 className="fw-bold mt-2">No matching books found</h4>
          <p className="text-muted max-w-sm mx-auto mb-4">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <div className="d-flex justify-content-center gap-2">
            {hasActiveFilters && (
              <button onClick={handleResetFilters} className="btn btn-outline-secondary">
                Clear Filters
              </button>
            )}
            <Link
              to={isAuthenticated ? "/add-book" : "/login"}
              state={!isAuthenticated ? { from: { pathname: "/add-book" } } : undefined}
              className="btn btn-primary-custom"
            >
              + Add a Book
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="text-muted small mb-0">
              Showing <strong>{books.length}</strong> {books.length === 1 ? "book" : "books"}
            </p>
            {!isAuthenticated && (
              <Link to="/login" className="small fw-semibold text-primary text-decoration-none">
                Sign in to list & swap books →
              </Link>
            )}
          </div>
          <div className="row">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Books;
