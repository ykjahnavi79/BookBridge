import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import ImageUploader from "../components/ImageUploader";

function AddBook() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "Fiction",
    description: "",
    condition: "Good",
    exchangeType: "Exchange",
    price: "",
    image: ""
  });

  const [customCategory, setCustomCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (newImage) => {
    setFormData((prev) => ({
      ...prev,
      image: newImage
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const finalCategory = formData.category === "Other" && customCategory.trim()
        ? customCategory.trim()
        : formData.category;

      const payload = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        category: finalCategory,
        description: formData.description.trim(),
        condition: formData.condition,
        exchangeType: formData.exchangeType,
        price: formData.exchangeType === "Sell" ? Number(formData.price) || 0 : 0,
        image: formData.image ? formData.image.trim() : "",
        availability: true,
        ownerId: currentUser?.id || null,
        ownerName: currentUser?.name || "Community Reader",
        ownerEmail: currentUser?.email || "community@bookbridge.com"
      };

      await API.post("/books", payload);

      setStatus({
        type: "success",
        message: "🎉 Book listed successfully! Redirecting to browse page..."
      });

      setTimeout(() => {
        navigate("/books");
      }, 1500);

    } catch (error) {
      console.error("Add book error:", error);
      setStatus({
        type: "danger",
        message: error.response?.data?.message || "Failed to add book. Please verify your connection."
      });
      setSubmitting(false);
    }
  };

  // SIGN IN GUARD: If user is not authenticated, prompt them to sign in
  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: "520px" }}>
        <div className="card shadow-sm border-0 rounded-4 p-5 bg-white">
          <div style={{ fontSize: "3.5rem" }}>📚🔐</div>
          <h3 className="fw-bold mt-3 mb-2">Sign In to List a Book</h3>
          <p className="text-muted mb-4">
            You need to be signed in to list books for exchange, sale, or community giveaway.
          </p>
          <div className="d-grid gap-2">
            <Link
              to="/login"
              state={{ from: location }}
              className="btn btn-primary-custom py-2 fw-semibold"
            >
              Sign In to Continue
            </Link>
            <Link to="/" className="btn btn-outline-secondary py-2">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: "720px" }}>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="fw-bold h2 mb-1">List a Book</h1>
          <p className="text-muted mb-0">
            Posting as <strong>{currentUser?.name || "Reader"}</strong> ({currentUser?.email})
          </p>
        </div>
        <Link to="/books" className="btn btn-outline-secondary btn-sm">
          ← Cancel
        </Link>
      </div>

      {status.message && (
        <div className={`alert alert-${status.type} shadow-sm border-0 mb-4`}>
          {status.message}
        </div>
      )}

      <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5 bg-white">
        <form onSubmit={handleSubmit}>
          {/* TITLE & AUTHOR */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Book Title <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. To Kill a Mockingbird"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Author <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Harper Lee"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* CATEGORY & CONDITION */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Category / Genre <span className="text-danger">*</span></label>
              <select
                className="form-select"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Sci-Fi">Sci-Fi & Fantasy</option>
                <option value="Academic">Academic & Textbooks</option>
                <option value="Self-Help">Self-Help & Personal Growth</option>
                <option value="Biography">Biography & Memoir</option>
                <option value="Other">Other...</option>
              </select>
            </div>

            {formData.category === "Other" && (
              <div className="col-md-6">
                <label className="form-label fw-semibold">Specify Category</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Graphic Novel, Poetry"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                />
              </div>
            )}

            <div className={formData.category === "Other" ? "col-12" : "col-md-6"}>
              <label className="form-label fw-semibold">Condition <span className="text-danger">*</span></label>
              <select
                className="form-select"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
              >
                <option value="New">New (Like brand new, unread)</option>
                <option value="Good">Good (Gently read, intact pages)</option>
                <option value="Average">Average (Visible wear, fully readable)</option>
              </select>
            </div>
          </div>

          {/* EXCHANGE TYPE & PRICING */}
          <div className="mb-4 p-3 bg-light rounded-3 border">
            <label className="form-label fw-bold d-block mb-2">How would you like to list this book?</label>
            <div className="d-flex gap-3 flex-wrap mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="exchangeType"
                  id="typeExchange"
                  value="Exchange"
                  checked={formData.exchangeType === "Exchange"}
                  onChange={handleChange}
                />
                <label className="form-check-label fw-medium" htmlFor="typeExchange">
                  🔄 Exchange (Swap with another book)
                </label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="exchangeType"
                  id="typeSell"
                  value="Sell"
                  checked={formData.exchangeType === "Sell"}
                  onChange={handleChange}
                />
                <label className="form-check-label fw-medium text-success" htmlFor="typeSell">
                  💰 Sell
                </label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="exchangeType"
                  id="typeFree"
                  value="Free"
                  checked={formData.exchangeType === "Free"}
                  onChange={handleChange}
                />
                <label className="form-check-label fw-medium text-primary" htmlFor="typeFree">
                  🎁 Free Giveaway
                </label>
              </div>
            </div>

            {formData.exchangeType === "Sell" && (
              <div>
                <label className="form-label fw-semibold">Selling Price (₹) <span className="text-danger">*</span></label>
                <div className="input-group" style={{ maxWidth: "250px" }}>
                  <span className="input-group-text">₹</span>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    min="1"
                    placeholder="250"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* BOOK COVER IMAGE UPLOADER (PC, CAMERA, URL) */}
          <div className="mb-4">
            <ImageUploader
              image={formData.image}
              onChange={handleImageChange}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Description / Notes</label>
            <textarea
              className="form-control"
              name="description"
              rows="4"
              placeholder="Mention details like edition, language, highlights/notes in the book, or pickup location..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="btn btn-primary-custom btn-lg w-100"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Listing Book...
              </>
            ) : (
              "Publish Book Listing"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddBook;
