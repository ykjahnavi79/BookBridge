import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import ImageUploader from "../components/ImageUploader";

function MyListings() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Modal State
  const [editingBook, setEditingBook] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/books");
      setBooks(response.data);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Unable to load listings. Please check backend connection.");
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
      console.error("Error toggling status:", err);
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/books/${id}`);
      setBooks((prev) => prev.filter((b) => b._id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error("Error deleting book:", err);
      alert("Unable to delete book.");
    }
  };

  const handleEditOpen = (book) => {
    setEditingBook({ ...book });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingBook((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBook) return;

    setSavingEdit(true);
    try {
      const payload = {
        title: editingBook.title,
        author: editingBook.author,
        category: editingBook.category,
        condition: editingBook.condition,
        exchangeType: editingBook.exchangeType,
        price: editingBook.exchangeType === "Sell" ? Number(editingBook.price) || 0 : 0,
        description: editingBook.description,
        image: editingBook.image,
        availability: editingBook.availability
      };

      const response = await API.put(`/books/${editingBook._id}`, payload);
      setBooks((prev) =>
        prev.map((b) => (b._id === editingBook._id ? response.data.book : b))
      );
      setEditingBook(null);
    } catch (err) {
      console.error("Error saving book:", err);
      alert("Failed to save changes.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Metrics
  const totalCount = books.length;
  const availableCount = books.filter((b) => b.availability).length;
  const exchangedCount = totalCount - availableCount;

  // Filtered by local search
  const filteredBooks = books.filter((b) => {
    const q = searchTerm.toLowerCase();
    return (
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container py-5">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold h2 mb-1">My Book Listings</h1>
          <p className="text-muted mb-0">Manage your active listings, edit details, or toggle availability</p>
        </div>
        <Link to="/add-book" className="btn btn-primary-custom align-self-start align-self-md-auto">
          + Add New Listing
        </Link>
      </div>

      {/* METRIC STATS */}
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="card shadow-sm border-0 rounded-3 p-3 bg-white">
            <span className="text-muted small fw-semibold text-uppercase">Total Listings</span>
            <div className="fs-3 fw-bold text-dark mt-1">{totalCount}</div>
          </div>
        </div>

        <div className="col-sm-4">
          <div className="card shadow-sm border-0 rounded-3 p-3 bg-white">
            <span className="text-muted small fw-semibold text-uppercase">Available Now</span>
            <div className="fs-3 fw-bold text-success mt-1">{availableCount}</div>
          </div>
        </div>

        <div className="col-sm-4">
          <div className="card shadow-sm border-0 rounded-3 p-3 bg-white">
            <span className="text-muted small fw-semibold text-uppercase">Exchanged / Sold</span>
            <div className="fs-3 fw-bold text-primary mt-1">{exchangedCount}</div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-warning mb-4">{error}</div>}

      {/* SEARCH WITHIN LISTINGS */}
      {books.length > 0 && (
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Filter your listings by title, author, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* LISTINGS TABLE */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading your listings...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="card text-center p-5 border-0 shadow-sm rounded-4">
          <div style={{ fontSize: "3rem" }}>📚</div>
          <h4 className="fw-bold mt-2">No listings yet!</h4>
          <p className="text-muted max-w-sm mx-auto mb-4">
            You haven't added any books to your profile yet. Start by sharing a book with the community.
          </p>
          <div>
            <Link to="/add-book" className="btn btn-primary-custom">
              + List Your First Book
            </Link>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ minWidth: "220px" }}>Book Details</th>
                  <th>Category</th>
                  <th>Type & Price</th>
                  <th>Status</th>
                  <th className="text-end" style={{ minWidth: "220px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          style={{
                            width: "44px",
                            height: "56px",
                            borderRadius: "6px",
                            overflow: "hidden",
                            backgroundColor: "#1e293b",
                            flexShrink: 0
                          }}
                        >
                          {book.image ? (
                            <img
                              src={book.image}
                              alt={book.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white small">
                              📖
                            </div>
                          )}
                        </div>
                        <div>
                          <Link to={`/books/${book._id}`} className="fw-bold text-dark text-decoration-none">
                            {book.title}
                          </Link>
                          <div className="text-muted small">by {book.author}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge bg-light text-secondary border">
                        {book.category}
                      </span>
                    </td>

                    <td>
                      <span className="fw-semibold">
                        {book.exchangeType === "Sell" ? `₹${book.price}` : book.exchangeType}
                      </span>
                    </td>

                    <td>
                      <button
                        onClick={() => handleToggleAvailability(book._id)}
                        className={`btn btn-sm ${
                          book.availability ? "btn-outline-success" : "btn-outline-secondary"
                        } rounded-pill px-3 py-1`}
                        title="Click to toggle status"
                      >
                        {book.availability ? "✓ Available" : "Exchanged / Reserved"}
                      </button>
                    </td>

                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link
                          to={`/books/${book._id}`}
                          className="btn btn-outline-secondary"
                          title="View public page"
                        >
                          View
                        </Link>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleEditOpen(book)}
                          title="Edit details"
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => setDeletingId(book._id)}
                          title="Delete listing"
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

      {/* EDIT MODAL */}
      {editingBook && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-dialog p-4 position-relative">
            <button
              className="btn btn-sm btn-close position-absolute top-0 end-0 m-3"
              onClick={() => setEditingBook(null)}
            />

            <h4 className="fw-bold mb-3">Edit Book Listing</h4>

            <form onSubmit={handleSaveEdit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Title *</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={editingBook.title}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Author *</label>
                <input
                  type="text"
                  className="form-control"
                  name="author"
                  value={editingBook.author}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Category</label>
                  <input
                    type="text"
                    className="form-control"
                    name="category"
                    value={editingBook.category}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Condition</label>
                  <select
                    className="form-select"
                    name="condition"
                    value={editingBook.condition}
                    onChange={handleEditChange}
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                  </select>
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Exchange Type</label>
                  <select
                    className="form-select"
                    name="exchangeType"
                    value={editingBook.exchangeType}
                    onChange={handleEditChange}
                  >
                    <option value="Exchange">Exchange</option>
                    <option value="Sell">Sell</option>
                    <option value="Free">Free</option>
                  </select>
                </div>
                {editingBook.exchangeType === "Sell" && (
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Price (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      min="0"
                      value={editingBook.price}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="mb-3">
                <ImageUploader
                  image={editingBook.image || ""}
                  onChange={(newImg) => setEditingBook((prev) => ({ ...prev, image: newImg }))}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Description</label>
                <textarea
                  rows="3"
                  className="form-control"
                  name="description"
                  value={editingBook.description || ""}
                  onChange={handleEditChange}
                />
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setEditingBook(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary-custom"
                  disabled={savingEdit}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-dialog p-4 text-center">
            <div style={{ fontSize: "2.5rem" }}>🗑️</div>
            <h4 className="fw-bold mt-2">Delete This Listing?</h4>
            <p className="text-muted">
              Are you sure you want to permanently remove this book from BookBridge? This action cannot be undone.
            </p>
            <div className="d-flex justify-content-center gap-2 mt-4">
              <button
                className="btn btn-outline-secondary px-4"
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger px-4"
                onClick={() => handleDelete(deletingId)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyListings;
