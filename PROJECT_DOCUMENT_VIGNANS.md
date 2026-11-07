# VIGNAN'S FOUNDATION FOR SCIENCE, TECHNOLOGY & RESEARCH
### (Deemed to be University) - Estd. u/s 3 of UGC Act 1956
**Department of Computer Science and Engineering**

---

| **Course Code** | **24CS810** | **Faculty Signature** | ____________________ |
| :--- | :--- | :--- | :--- |
| **Course Name** | **Modern Front-End Frameworks and SPA Development** | | |
| **NAME OF STUDENT** | **KOMALA JAHNAVI** | | |
| **REGD NO** | **241FA04000** *(Enter your Register No)* | **SECTION** | **CSE** |
| **PROJECT TITLE** | **BookBridge — Peer-to-Peer Book Exchange & Marketplace Full Stack Single Page Application** | | |

---

## AIM:
To develop a modern full stack single-page web application (SPA) using the **MERN Stack (MongoDB, Express.js, React.js, and Node.js)** that facilitates peer-to-peer book exchange and marketplace management. The platform allows readers to search, filter, list, exchange, and purchase pre-loved books, featuring multi-source image capture (device camera snapshot and PC upload), role-based authentication (Reader Community Member and Super Administrator), interactive analytics dashboards, and RESTful API communication with persistent storage in MongoDB.

---

## SOFTWARE REQUIREMENTS:
- **Operating System:** Windows 10 / 11
- **Frontend Framework & Libraries:** React.js 19, Vite, React Router DOM (v7), Bootstrap 5, Axios, CSS3, HTML5
- **Backend Runtime & Framework:** Node.js (v20+) & Express.js (v5)
- **Database:** MongoDB / MongoDB Atlas (Cloud NoSQL Database)
- **ODM Library:** Mongoose (v8)
- **Code Editor:** Visual Studio Code
- **Web Browser:** Google Chrome / Microsoft Edge
- **Package Manager:** npm (Node Package Manager)

---

## OBJECTIVE:
1. To architect a responsive, single-page application (SPA) utilizing React 19 functional components, custom hooks, and React Router for client-side routing without full page refreshes.
2. To build a modular RESTful backend API using Express.js following MVC patterns (Models, Controllers, Routes) for complete CRUD operations on books, users, and reader inquiries.
3. To model schematized MongoDB collections via Mongoose with data types, enums, defaults, timestamps, and relational object references.
4. To implement an intelligent multi-source image uploader with automated client-side canvas compression for local files, native mobile device camera triggers, and live webcam capture.
5. To provide role-based authentication and navigation with distinct dashboards for regular readers (bookshelf management, proposal inbox) and administrators (catalog supervision, category/genre breakdowns, user governance, 1-click database seeding, and data export).

---

## PROJECT STRUCTURE:
```text
book_project/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & diagnostics
│   ├── controllers/
│   │   ├── adminController.js    # Platform analytics & catalog governance
│   │   ├── authController.js     # User registration, login & roles
│   │   ├── bookController.js     # Book CRUD, search, filter & seed logic
│   │   └── inquiryController.js  # Reader swap proposals & inquiry messaging
│   ├── models/
│   │   ├── Book.js               # Book listing schema
│   │   ├── Inquiry.js            # Reader swap proposal schema
│   │   └── User.js               # User account & role schema
│   ├── routes/
│   │   ├── adminRoutes.js        # /api/admin
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── bookRoutes.js         # /api/books
│   │   └── inquiryRoutes.js      # /api/inquiries
│   ├── .env                      # Environment variables (PORT, MONGO_URI)
│   ├── package.json              # Backend dependencies
│   ├── seed.js                   # Database initialization script
│   └── server.js                 # Express server & API routes mount
│
└── book_exchange/                # Frontend SPA (React.js + Vite)
    ├── src/
    │   ├── components/
    │   │   ├── BookCard.jsx      # Reusable book presentation card with badges
    │   │   ├── Footer.jsx        # Footer component
    │   │   ├── ImageUploader.jsx # PC upload with canvas compression & camera snapshot
    │   │   └── Navbar.jsx        # Navigation bar with role indicators
    │   ├── context/
    │   │   └── AuthContext.jsx   # Authentication context & user state
    │   ├── data/
    │   │   └── defaultBooks.js   # Fallback catalog & preview dataset
    │   ├── pages/
    │   │   ├── AddBook.jsx       # Book creation form with camera uploader
    │   │   ├── AdminDashboard.jsx# Admin portal with genre/category breakdown
    │   │   ├── BookDetails.jsx   # Details view & swap proposal modal
    │   │   ├── Books.jsx         # Full catalog with search & multi-filter toolbar
    │   │   ├── Home.jsx          # Homepage & featured books section
    │   │   ├── Login.jsx         # Sign in & registration portal
    │   │   └── UserDashboard.jsx # Reader personal dashboard & inquiries inbox
    │   ├── services/
    │   │   └── api.js            # Axios REST API client
    │   ├── app.jsx               # Application route definitions
    │   ├── index.css             # Custom utility & layout styling
    │   └── main.jsx              # React root entry point
    ├── index.html                # HTML template
    └── package.json              # Frontend dependencies
```

---

## SOURCE CODE:

### BACKEND

#### `backend/models/Book.js`
```javascript
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    title:        { type: String, required: true },
    author:       { type: String, required: true },
    category:     { type: String, required: true },
    description:  { type: String, default: "" },
    condition:    { type: String, enum: ["New", "Good", "Average"], default: "Good" },
    exchangeType: { type: String, enum: ["Exchange", "Sell", "Free"], required: true },
    price:        { type: Number, default: 0 },
    image:        { type: String, default: "" },
    availability: { type: Boolean, default: true },
    ownerId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    ownerName:    { type: String, default: "Community Reader" },
    ownerEmail:   { type: String, default: "community@bookbridge.com" }
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);
```

#### `backend/models/User.js`
```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ["user", "admin"], default: "user" },
    avatar:   { type: String, default: "" },
    phone:    { type: String, default: "" },
    location: { type: String, default: "" },
    bio:      { type: String, default: "" },
    status:   { type: String, enum: ["active", "suspended"], default: "active" }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
```

#### `backend/models/Inquiry.js`
```javascript
const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
    bookId:       { type: mongoose.Schema.Types.ObjectId, ref: "Book", default: null },
    bookTitle:    { type: String, required: true },
    bookImage:    { type: String, default: "" },
    senderName:   { type: String, required: true },
    senderEmail:  { type: String, required: true },
    senderPhone:  { type: String, default: "" },
    message:      { type: String, default: "" },
    exchangeType: { type: String, default: "Exchange" },
    status:       { type: String, enum: ["Pending", "Accepted", "Declined"], default: "Pending" },
    ownerEmail:   { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Inquiry", inquirySchema);
```

#### `backend/routes/bookRoutes.js`
```javascript
const express = require("express");
const router = express.Router();
const {
    seedBooks, addBook, getBooks, getBookById,
    updateBook, toggleAvailability, deleteBook
} = require("../controllers/bookController");

router.post("/seed", seedBooks);
router.post("/", addBook);
router.get("/", getBooks);
router.get("/:id", getBookById);
router.put("/:id", updateBook);
router.patch("/:id/toggle", toggleAvailability);
router.delete("/:id", deleteBook);

module.exports = router;
```

#### `backend/controllers/bookController.js` (Key CRUD & Filtering Logic)
```javascript
const Book = require("../models/Book");

// GET ALL BOOKS (with keyword search, category, condition, exchangeType, sort)
exports.getBooks = async (req, res) => {
    try {
        const { search, category, exchangeType, condition, availability, sort } = req.query;
        let filter = {};

        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [{ title: regex }, { author: regex }, { category: regex }, { description: regex }];
        }
        if (category && category !== "All") filter.category = new RegExp(`^${category.trim()}$`, "i");
        if (exchangeType && exchangeType !== "All") filter.exchangeType = exchangeType;
        if (condition && condition !== "All") filter.condition = condition;
        if (availability !== undefined && availability !== "All") filter.availability = (availability === "true");

        let sortOption = { createdAt: -1 };
        if (sort === "price-asc") sortOption = { price: 1 };
        if (sort === "price-desc") sortOption = { price: -1 };
        if (sort === "title-asc") sortOption = { title: 1 };

        const books = await Book.find(filter).sort(sortOption);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CREATE A NEW BOOK
exports.addBook = async (req, res) => {
    try {
        const { title, author, category, description, condition, exchangeType, price, image, ownerName, ownerEmail } = req.body;
        const newBook = new Book({
            title, author, category, description, condition, exchangeType,
            price: exchangeType === "Sell" ? Number(price) : 0,
            image: image || "",
            ownerName: ownerName || "Community Reader",
            ownerEmail: ownerEmail || "community@bookbridge.com"
        });
        const savedBook = await newBook.save();
        res.status(201).json({ message: "Book listed successfully", book: savedBook });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// TOGGLE BOOK AVAILABILITY
exports.toggleAvailability = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });
        book.availability = !book.availability;
        await book.save();
        res.status(200).json({ message: "Availability toggled", book });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE BOOK
exports.deleteBook = async (req, res) => {
    try {
        const deleted = await Book.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Book not found" });
        res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
```

#### `backend/server.js`
```javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const bookRoutes = require("./routes/bookRoutes");
const authRoutes = require("./routes/authRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Supports Base64 compressed image uploads
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Connect Database
connectDB();

// API Endpoints
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
    res.json({ message: "BookBridge API Operational", status: "Running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

#### `backend/.env`
```ini
PORT=5000
MONGO_URI=mongodb+srv://ykjahnavi79_db_user:SISHKmJH2v6CKd9r@bookbridgecluster.7n7fgyy.mongodb.net/bookbridge?retryWrites=true&w=majority
```

---

### FRONTEND

#### `book_exchange/src/app.jsx`
```jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Books from "./pages/Books";
import AddBook from "./pages/AddBook";
import BookDetails from "./pages/BookDetails";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/add-book" element={<AddBook />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
```

#### `book_exchange/src/services/api.js`
```javascript
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

export default API;
```

#### `book_exchange/src/components/BookCard.jsx`
```jsx
import { useState } from "react";
import { Link } from "react-router-dom";

export default function BookCard({ book }) {
  const [imageError, setImageError] = useState(false);

  const getExchangeClass = (type) =>
    type === "Sell" ? "badge-sell" : type === "Free" ? "badge-free" : "badge-exchange";

  return (
    <div className="col-sm-6 col-md-4 col-lg-4 mb-4">
      <div className="card h-100 book-card shadow-sm d-flex flex-column">
        <div className="book-cover-wrapper position-relative">
          {book.image && !imageError ? (
            <img src={book.image} alt={book.title} className="book-cover-img" onError={() => setImageError(true)} />
          ) : (
            <div className="book-cover-fallback">📖 {book.title}</div>
          )}
          {!book.availability && (
            <div className="position-absolute top-0 start-0 w-100 bg-dark bg-opacity-75 text-white text-center py-1 fw-bold small">
              Exchanged / Reserved
            </div>
          )}
          <div className="position-absolute bottom-0 start-0 p-2 d-flex gap-1 flex-wrap">
            <span className={`badge ${getExchangeClass(book.exchangeType)}`}>{book.exchangeType}</span>
            <span className="badge bg-light text-dark border">{book.condition}</span>
          </div>
        </div>
        <div className="card-body d-flex flex-column">
          <span className="badge bg-secondary mb-1 align-self-start">{book.category}</span>
          <h5 className="card-title fw-bold">{book.title}</h5>
          <p className="card-subtitle text-muted small mb-2">by {book.author}</p>
          <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
            <span className="fw-bold fs-5 text-primary">
              {book.exchangeType === "Sell" ? `₹${book.price}` : book.exchangeType}
            </span>
            <Link to={`/books/${book._id}`} className="btn btn-outline-primary btn-sm rounded-pill">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### `book_exchange/src/components/ImageUploader.jsx` (Multi-Source Photo Upload)
```jsx
import { useState, useRef } from "react";

export default function ImageUploader({ onImageSelected, currentImage }) {
  const [sourceMode, setSourceMode] = useState("file"); // 'file' | 'camera' | 'url'
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Canvas Image Compression (Converts any uploaded file to lightweight Base64)
  const compressImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxDim = 800;
        let w = img.width, h = img.height;
        if (w > h && w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
        else if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
        canvas.width = w; canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        onImageSelected(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Camera Live Capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setCameraActive(true);
    } catch { alert("Camera access denied or unavailable."); }
  };

  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0);
    onImageSelected(canvas.toDataURL("image/jpeg", 0.8));
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    setCameraActive(false);
  };

  return (
    <div className="border rounded-4 p-3 bg-light">
      <div className="btn-group w-100 mb-3">
        <button type="button" className={`btn btn-sm ${sourceMode === "file" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setSourceMode("file")}>📁 Upload PC</button>
        <button type="button" className={`btn btn-sm ${sourceMode === "camera" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setSourceMode("camera")}>📷 Live Camera</button>
        <button type="button" className={`btn btn-sm ${sourceMode === "url" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setSourceMode("url")}>🔗 Image URL</button>
      </div>

      {sourceMode === "file" && (
        <input type="file" accept="image/*" className="form-control" onChange={(e) => e.target.files[0] && compressImage(e.target.files[0])} />
      )}

      {sourceMode === "camera" && (
        <div className="text-center">
          {!cameraActive ? (
            <button type="button" onClick={startCamera} className="btn btn-outline-dark btn-sm">🎥 Open Camera Viewfinder</button>
          ) : (
            <div>
              <video ref={videoRef} style={{ width: "100%", maxHeight: "240px", borderRadius: "8px" }} />
              <div className="mt-2 d-flex gap-2 justify-content-center">
                <button type="button" onClick={takeSnapshot} className="btn btn-danger btn-sm">📸 Take Snapshot</button>
                <button type="button" onClick={stopCamera} className="btn btn-secondary btn-sm">Cancel</button>
              </div>
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      )}
    </div>
  );
}
```

#### `book_exchange/src/pages/Books.jsx` (Search & Multi-Attribute Filter Toolbar)
```jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import BookCard from "../components/BookCard";

const CATEGORIES = ["All", "Fiction", "Non-Fiction", "Sci-Fi", "Academic", "Self-Help", "Fantasy", "Biography"];

export default function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "All";
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    fetchBooks();
  }, [searchParams]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await API.get("/books", { params: { search, category } });
      setBooks(res.data);
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchInput, category });
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Explore Books Catalog</h2>
      <form onSubmit={handleSearchSubmit} className="input-group mb-4">
        <input type="text" className="form-control" placeholder="Search by title, author, genre..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>
      <div className="d-flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map((cat) => (
          <button key={cat} className={`btn btn-sm rounded-pill ${category === cat ? "btn-dark" : "btn-outline-secondary"}`} onClick={() => setSearchParams({ search, category: cat })}>
            {cat}
          </button>
        ))}
      </div>
      <div className="row">
        {books.map((book) => <BookCard key={book._id} book={book} /)}
      </div>
    </div>
  );
}
```

#### `book_exchange/src/pages/AdminDashboard.jsx` (Genre Breakdown & Platform Analytics)
```jsx
import { useState, useEffect } from "react";
import API from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    API.get("/admin/stats").then(res => setStats(res.data)).catch(() => {});
    API.get("/books").then(res => setBooks(res.data)).catch(() => {});
  }, []);

  const totalBooks = stats?.metrics?.totalBooks ?? books.length;
  const categories = stats?.breakdowns?.categories || {};

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">Administrator Portal & Analytics</h3>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card p-4 rounded-4 shadow-sm">
            <h5 className="fw-bold mb-3">Genre / Category Breakdown</h5>
            {Object.entries(categories).map(([cat, count]) => {
              const percent = Math.round((count / (totalBooks || 1)) * 100);
              return (
                <div key={cat} className="mb-2">
                  <div className="d-flex justify-content-between small fw-semibold">
                    <span>{cat}</span><span>{count} books ({percent}%)</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div className="progress-bar bg-primary" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## STEPS TO RUN THE PROJECT:
1. **Start Database:** Ensure MongoDB is running locally on `mongodb://127.0.0.1:27017` or ensure the cloud MongoDB Atlas connection URI is set in `backend/.env`.
2. **Run Backend API Server:**
   - Open a terminal in the `backend/` directory.
   - Run `npm install` to install backend dependencies (`express`, `mongoose`, `cors`, `dotenv`).
   - Execute `node server.js` or `npm run dev`. The server will start and log: `BookBridge Backend Server running on port 5000`.
3. **Run Frontend React Application:**
   - Open a second terminal in the `book_exchange/` directory.
   - Run `npm install` to install frontend dependencies (`react`, `react-dom`, `react-router-dom`, `bootstrap`, `axios`).
   - Run `npm run dev` to start the Vite development server.
4. **Open Application:** Open Google Chrome or Microsoft Edge and navigate to the local URL displayed by Vite (typically `http://localhost:5173`).
5. **(Optional) Seed Database:** In the Administrator portal or via terminal (`node seed.js`), click **"Seed 15 Books"** to populate sample records with authors, prices, conditions, and categories.

---

## OUTPUT: [Paste Your Outputs Here]

### Figure 1: Application Home Page & Hero Showcase
> *(Paste screenshot of `http://localhost:5173` showing the BookBridge header, hero banner, featured carousel, and navigation links here)*
```
+-------------------------------------------------------------------------+
|                                                                         |
|                [ PASTE HOME PAGE SCREENSHOT HERE ]                      |
|                                                                         |
+-------------------------------------------------------------------------+
```

### Figure 2: Books Catalog with Full-Text Search and Category Filters
> *(Paste screenshot of `/books` page demonstrating keyword search query and dynamic category filtering: Fiction, Academic, Self-Help)*
```
+-------------------------------------------------------------------------+
|                                                                         |
|             [ PASTE CATALOG & FILTER SEARCH SCREENSHOT HERE ]           |
|                                                                         |
+-------------------------------------------------------------------------+
```

### Figure 3: Multi-Source Image Uploader (PC Upload & Live Camera Capture)
> *(Paste screenshot of `/add-book` showing the multi-tab photo selector with file upload, canvas compression, and live webcam capture viewfinder)*
```
+-------------------------------------------------------------------------+
|                                                                         |
|            [ PASTE MULTI-SOURCE IMAGE UPLOADER SCREENSHOT HERE ]        |
|                                                                         |
+-------------------------------------------------------------------------+
```

### Figure 4: Reader / Community Member Dashboard (`/user-dashboard`)
> *(Paste screenshot showing reader's personal bookshelf, availability toggles "Available" vs "Exchanged", and swap inquiry messages inbox)*
```
+-------------------------------------------------------------------------+
|                                                                         |
|              [ PASTE USER DASHBOARD & INQUIRIES SCREENSHOT HERE ]       |
|                                                                         |
+-------------------------------------------------------------------------+
```

### Figure 5: Super Administrator Portal with Genre Breakdown Analytics (`/admin-dashboard`)
> *(Paste screenshot showing platform KPI cards, Genre/Category Breakdown progress bars, and exchange distribution charts)*
```
+-------------------------------------------------------------------------+
|                                                                         |
|          [ PASTE ADMIN DASHBOARD & GENRE BREAKDOWN SCREENSHOT HERE ]     |
|                                                                         |
+-------------------------------------------------------------------------+
```

### Figure 6: MongoDB Atlas / MongoDB Compass Stored Collections
> *(Paste screenshot of MongoDB database showing stored JSON documents in the `books`, `users`, and `inquiries` collections)*
```
+-------------------------------------------------------------------------+
|                                                                         |
|               [ PASTE MONGODB DATABASE SCREENSHOT HERE ]                |
|                                                                         |
+-------------------------------------------------------------------------+
```

---

## RESULT:
The full stack web application **BookBridge** was successfully designed, developed, and deployed following the Single-Page Application (SPA) architecture using the MERN stack. The React front end executes responsive client-side routing, state management, search/filtering, and multimedia capture, communicating seamlessly with the Express/Node.js REST API. Persistent CRUD operations, user role authorization, and platform analytics were verified with live data stored in MongoDB.

