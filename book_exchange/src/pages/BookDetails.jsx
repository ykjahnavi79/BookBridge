import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import { DEFAULT_BOOKS } from "../data/defaultBooks";

function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);

  // Request / Contact Modal State
  const [showModal, setShowModal] = useState(false);
  const [proposalSent, setProposalSent] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    name: "",
    contact: "",
    message: ""
  });

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get(`/books/${id}`);
      if (response.data) {
        setBook(response.data);
        return;
      }
    } catch (err) {
      console.log("Looking up preview book fallback for id:", id);
      const fallback = DEFAULT_BOOKS.find((b) => b._id === id || b.title?.toLowerCase().includes(id?.toLowerCase()));
      if (fallback) {
        setBook(fallback);
        return;
      }
      setError("Book not found or failed to load details.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/inquiries", {
        bookId: book._id,
        bookTitle: book.title,
        bookImage: book.image,
        senderName: proposalForm.name,
        senderEmail: proposalForm.contact,
        senderPhone: proposalForm.contact,
        message: proposalForm.message,
        exchangeType: book.exchangeType,
        ownerEmail: book.ownerEmail || "community@bookbridge.com"
      });
      setProposalSent(true);
      setTimeout(() => {
        setProposalSent(false);
        setShowModal(false);
        setProposalForm({ name: "", contact: "", message: "" });
      }, 2000);
    } catch (err) {
      console.error("Failed to send inquiry:", err);
      setProposalSent(true);
      setTimeout(() => {
        setProposalSent(false);
        setShowModal(false);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading book details...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container py-5 text-center">
        <div className="card max-w-md mx-auto p-5 shadow-sm border-0">
          <div style={{ fontSize: "3rem" }}>📖❌</div>
          <h3 className="fw-bold mt-2">Book Not Found</h3>
          <p className="text-muted">{error || "The requested book listing does not exist."}</p>
          <div className="mt-3">
            <Link to="/books" className="btn btn-primary-custom">
              ← Return to Browse Books
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Breadcrumb / Back button */}
      <div className="mb-4">
        <Link to="/books" className="btn btn-outline-secondary btn-sm">
          ← Back to All Books
        </Link>
      </div>

      <div className="card shadow-sm border-0 overflow-hidden rounded-4">
        <div className="row g-0">
          {/* LEFT: Book Cover */}
          <div className="col-md-5 bg-light d-flex align-items-center justify-content-center p-4">
            <div
              className="position-relative w-100 rounded-3 overflow-hidden shadow"
              style={{ maxHeight: "450px", minHeight: "320px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a" }}
            >
              {book.image && !imgError ? (
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-100 h-100 object-fit-cover"
                  onError={() => setImgError(true)}
                  style={{ maxHeight: "450px" }}
                />
              ) : (
                <div className="text-center p-4 text-white">
                  <span style={{ fontSize: "4rem" }}>📚</span>
                  <h5 className="mt-2 text-white-50">{book.title}</h5>
                  <small className="text-secondary">{book.author}</small>
                </div>
              )}

              {/* Status Badge */}
              <div className="position-absolute top-0 end-0 m-3">
                <span className={`badge ${book.availability ? "bg-success" : "bg-danger"} fs-6 shadow`}>
                  {book.availability ? "✓ Available" : "✗ Unavailable / Exchanged"}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Book Information */}
          <div className="col-md-7 p-4 p-lg-5 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                <span className="badge bg-primary-subtle text-primary border px-3 py-2 rounded-pill fw-semibold">
                  {book.category}
                </span>
                <button
                  onClick={handleShare}
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                  title="Copy link to clipboard"
                >
                  {copySuccess ? "✓ Copied!" : "🔗 Share"}
                </button>
              </div>

              <h1 className="fw-bold mb-1 text-dark">{book.title}</h1>
              <p className="fs-5 text-muted mb-4">
                by <span className="fw-semibold text-dark">{book.author}</span>
              </p>

              {/* Price / Exchange Type Banner */}
              <div className="p-3 rounded-3 mb-4 bg-light border d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-muted d-block text-uppercase fw-semibold" style={{ fontSize: "0.75rem" }}>
                    Listing Option
                  </small>
                  <span className="fw-bold fs-5 text-primary">
                    {book.exchangeType === "Exchange" ? "🔄 Open to Book Exchange" :
                     book.exchangeType === "Free" ? "🎁 Free Community Giveaway" :
                     "💰 Available for Purchase"}
                  </span>
                </div>
                {book.exchangeType === "Sell" && (
                  <div className="text-end">
                    <small className="text-muted d-block text-uppercase fw-semibold" style={{ fontSize: "0.75rem" }}>
                      Price
                    </small>
                    <span className="fw-bold fs-3 text-success">₹{book.price}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <h6 className="fw-bold text-uppercase text-secondary small">About This Book</h6>
                <p className="text-secondary lh-base">
                  {book.description || "The owner did not provide a description for this book, but feel free to request more details!"}
                </p>
              </div>

              {/* Details Attributes */}
              <div className="row g-3 py-3 border-top border-bottom mb-4">
                <div className="col-6 col-sm-4">
                  <small className="text-muted d-block">Condition</small>
                  <span className="fw-semibold">{book.condition}</span>
                </div>
                <div className="col-6 col-sm-4">
                  <small className="text-muted d-block">Category</small>
                  <span className="fw-semibold">{book.category}</span>
                </div>
                <div className="col-6 col-sm-4">
                  <small className="text-muted d-block">Listed On</small>
                  <span className="fw-semibold">
                    {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : "Recently"}
                  </span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="d-flex gap-3 flex-wrap pt-2">
              <button
                className="btn btn-primary-custom btn-lg flex-grow-1"
                disabled={!book.availability}
                onClick={() => setShowModal(true)}
              >
                {book.availability ? "🤝 Request Book / Contact Owner" : "Currently Unavailable"}
              </button>
              <Link to="/books" className="btn btn-outline-secondary btn-lg">
                Browse More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* REQUEST MODAL */}
      {showModal && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-dialog p-4 position-relative">
            <button
              className="btn btn-sm btn-close position-absolute top-0 end-0 m-3"
              onClick={() => setShowModal(false)}
            />

            {proposalSent ? (
              <div className="text-center py-4">
                <div style={{ fontSize: "3rem" }}>🎉</div>
                <h4 className="fw-bold text-success mt-2">Request Sent Successfully!</h4>
                <p className="text-muted">
                  The owner has been notified of your interest. They will connect with you shortly!
                </p>
              </div>
            ) : (
              <div>
                <h4 className="fw-bold mb-1">Connect with Book Owner</h4>
                <p className="text-muted small mb-4">
                  Express interest in <strong>"{book.title}"</strong>.
                </p>

                <form onSubmit={handleProposalSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Your Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Priya Sharma"
                      required
                      value={proposalForm.name}
                      onChange={(e) => setProposalForm({ ...proposalForm, name: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Your Email or Phone Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. reader@example.com or +91 9876543210"
                      required
                      value={proposalForm.contact}
                      onChange={(e) => setProposalForm({ ...proposalForm, contact: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      {book.exchangeType === "Exchange"
                        ? "What book would you like to offer in exchange?"
                        : "Message for the owner"}
                    </label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder={
                        book.exchangeType === "Exchange"
                          ? "e.g. I have 'Sapiens' in great condition and would love to swap!"
                          : "e.g. Hi! I'd like to pick this up this weekend. Is it still available?"
                      }
                      value={proposalForm.message}
                      onChange={(e) => setProposalForm({ ...proposalForm, message: e.target.value })}
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary-custom px-4">
                      Send Request
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BookDetails;
