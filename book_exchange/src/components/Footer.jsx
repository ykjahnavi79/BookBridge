import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer-custom">
      <div className="container">
        <div className="row gy-4">
          <div className="col-md-5">
            <h5 className="text-white fw-bold mb-3">
              <span className="me-2">📚</span>BookBridge
            </h5>
            <p className="small pe-md-4">
              A community-driven platform connecting readers to exchange, share, and buy pre-loved books.
              Save money, connect with fellow bookworms, and make reading sustainable.
            </p>
          </div>

          <div className="col-6 col-md-3">
            <h6 className="text-white fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/books">Browse All Books</Link></li>
              <li><Link to="/add-book">List a New Book</Link></li>
              <li><Link to="/my-listings">Manage My Listings</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-4">
            <h6 className="text-white fw-bold mb-3">Community Principles</h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2 text-secondary">
              <li>✨ Fair book exchanges</li>
              <li>🌱 Eco-friendly reuse of paperbacks</li>
              <li>🤝 Respectful reader communication</li>
              <li>📖 Promoting a lifelong love of literature</li>
            </ul>
          </div>
        </div>

        <hr className="my-4 border-secondary opacity-25" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center small">
          <p className="mb-0">© {new Date().getFullYear()} BookBridge. All rights reserved.</p>
          <p className="mb-0 text-secondary">Crafted for book lovers everywhere</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

