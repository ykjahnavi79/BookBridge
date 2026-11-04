import { useState } from "react";
import { Link } from "react-router-dom";

function BookCard({ book }) {
  const [imageError, setImageError] = useState(false);

  // Helper for badge color class
  const getExchangeBadgeClass = (type) => {
    switch (type) {
      case "Exchange":
        return "badge-exchange";
      case "Sell":
        return "badge-sell";
      case "Free":
        return "badge-free";
      default:
        return "bg-secondary";
    }
  };

  const getConditionBadgeClass = (condition) => {
    switch (condition) {
      case "New":
        return "badge-new";
      case "Good":
        return "badge-good";
      case "Average":
        return "badge-average";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="col-sm-6 col-md-4 col-lg-4 mb-4">
      <div className="card h-100 book-card shadow-sm d-flex flex-column">
        {/* Book Cover Image */}
        <div className="book-cover-wrapper position-relative">
          {book.image && !imageError ? (
            <img
              src={book.image}
              alt={book.title}
              className="book-cover-img"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="book-cover-fallback">
              <span style={{ fontSize: "2.8rem" }}>📖</span>
              <span className="fw-semibold small mt-2 text-truncate px-2 w-100 text-center">
                {book.title}
              </span>
            </div>
          )}

          {/* Availability ribbon */}
          {!book.availability && (
            <div
              className="position-absolute top-0 start-0 w-100 bg-dark bg-opacity-75 text-white text-center py-1 fw-bold small"
              style={{ zIndex: 2 }}
            >
              Exchanged / Reserved
            </div>
          )}

          {/* Badges Overlay */}
          <div className="position-absolute bottom-0 start-0 p-2 d-flex gap-1 flex-wrap" style={{ zIndex: 2 }}>
            <span className={`badge ${getExchangeBadgeClass(book.exchangeType)}`}>
              {book.exchangeType}
            </span>
            <span className={`badge ${getConditionBadgeClass(book.condition)}`}>
              {book.condition}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="card-body d-flex flex-column p-3">
          <div className="mb-2">
            <span className="badge bg-light text-secondary border small mb-1">
              {book.category}
            </span>
            <h5
              className="card-title fw-bold text-dark text-truncate mb-1"
              title={book.title}
              style={{ fontSize: "1.1rem" }}
            >
              {book.title}
            </h5>
            <p className="card-subtitle text-muted small text-truncate">
              by <span className="fw-medium text-dark">{book.author}</span>
            </p>
          </div>

          {book.description && (
            <p
              className="text-muted small mb-3 flex-grow-1"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}
            >
              {book.description}
            </p>
          )}

          <div className="mt-auto pt-2 border-top d-flex align-items-center justify-content-between">
            <div>
              {book.exchangeType === "Sell" ? (
                <div>
                  <span className="text-muted small">Price: </span>
                  <span className="fw-bold text-success fs-5">₹{book.price}</span>
                </div>
              ) : book.exchangeType === "Free" ? (
                <span className="badge bg-success-subtle text-success fw-bold px-2 py-1">
                  FREE
                </span>
              ) : (
                <span className="text-primary fw-semibold small">
                  Open to Swap
                </span>
              )}
            </div>

            <Link
              to={`/books/${book._id}`}
              className="btn btn-sm btn-outline-primary fw-medium"
            >
              Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookCard;
