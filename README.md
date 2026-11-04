# 📚 BookBridge — Peer-to-Peer Book Exchange & Sharing Platform

BookBridge is a full-stack web application designed for avid readers, students, and book lovers to list, exchange, sell, or giveaway pre-loved books within their local community.

---

## 🌟 Key Features

### 1. 👤 User Dashboard (`/user-dashboard`)
- **Profile Overview:** Display name, reader bio, avatar, contact details, and location.
- **Personal Metrics:** Track your total listings, currently available books, exchanged titles, and reader inquiries.
- **My Bookshelf:** Toggle availability status ("Available" vs "Exchanged"), inspect public links, and delete books.
- **Exchange Inquiries & Offers Inbox:** Receive book swap proposals and purchase messages from other readers with 1-click **"Accept Offer"** or **"Decline"** actions.
- **Profile Settings:** Update contact number, location, reading bio, and avatar.

### 2. 🛡️ Administrator Dashboard (`/admin-dashboard`)
- **Platform Analytics & KPI Metrics:**
  - Total Books in Catalog, Available Books, Exchanged Titles.
  - Total Registered Users, Active Users.
  - Total Market Value of listings (₹).
  - Exchange Type Distribution (% Exchange, % Sell, % Free).
  - Genre / Category visual distribution progress bars.
- **Full Catalog Governance:** Search, inspect, toggle status, or remove any book across the platform.
- **User Management:** View registered users, toggle roles (`user` ↔ `admin`), suspend/activate accounts, or delete users.
- **Inquiry Supervision:** Platform-wide oversight of all reader swap inquiries and message exchanges.
- **System Maintenance Tools:**
  - 🔄 **Seed Database:** 1-click seed of 15 curated books, users, and inquiries.
  - 💾 **Export Platform Backup:** Download a complete JSON snapshot of books, users, and inquiries.
  - ⚠️ **Clear Catalog:** Controlled platform reset.

### 3. 📸 Multi-Source Book Image Uploader
- **📁 Upload from PC / Files:** Drag-and-drop or select any JPG/PNG/WEBP image with automated client-side canvas compression.
- **📷 Take Photo (Camera):** Live webcam viewfinder with snapshot shutter button, plus a native **"📱 Device Camera App"** trigger for smartphones.
- **🔗 Web URL & Presets:** Paste external image links or pick from curated sample book covers.

### 4. 🔍 Browse & Filter Books (`/books`)
- **Full-Text Search:** Search across title, author, category, and synopsis.
- **Multi-Filter Toolbar:** Filter by Genre, Exchange Type, Condition, and Sort order.
- **Rich Book Cards:** Responsive covers, condition tags, exchange ribbons, and pricing badges.

### 5. 📖 Book Details & Exchange Inquiry (`/books/:id`)
- High-resolution cover view, complete synopsis, book metadata, and listing date.
- **Connect with Owner Modal:** Submit an exchange proposal or purchase inquiry directly to the book owner.
- **1-Click Share:** Copy the book's direct link to clipboard with visual confirmation.

### 6. 🔐 Authentication
- Standard **Sign In** and **Sign Up** forms.
- Any registered reader logs in and accesses their **User Dashboard**.
- Administrator account (`admin@bookbridge.com` / `admin123`) has access to the **Admin Portal**.

---

## 🏗️ Project Architecture

```
book_project/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & diagnostics
│   ├── controllers/
│   │   ├── adminController.js    # Platform analytics & system maintenance
│   │   ├── authController.js     # User registration, login, role management
│   │   ├── bookController.js     # Book CRUD, search, filter, and seed logic
│   │   └── inquiryController.js  # Reader exchange requests & proposals
│   ├── models/
│   │   ├── Book.js               # Book listing schema
│   │   ├── Inquiry.js            # Exchange inquiry schema
│   │   └── User.js               # User account & role schema
│   ├── routes/
│   │   ├── adminRoutes.js        # /api/admin
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── bookRoutes.js         # /api/books
│   │   └── inquiryRoutes.js      # /api/inquiries
│   ├── .env                      # Environment config (PORT, MONGO_URI)
│   ├── seed.js                   # Database seeder (books, users, inquiries)
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Express application & server entry point
│
├── book_exchange/                # Frontend application (React + Vite)
│   ├── public/                   # Static assets & icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookCard.jsx      # Reusable book presentation card
│   │   │   ├── Footer.jsx        # Community footer
│   │   │   ├── ImageUploader.jsx # PC upload, camera, URL image uploader
│   │   │   └── Navbar.jsx        # Responsive navigation with role indicators
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # User & Admin authentication provider
│   │   ├── pages/
│   │   │   ├── AddBook.jsx       # Listing creation form with image uploader
│   │   │   ├── AdminDashboard.jsx# Administrator control portal & analytics
│   │   │   ├── BookDetails.jsx   # Detail view & inquiry proposal modal
│   │   │   ├── Books.jsx         # Catalog with search & filter toolbar
│   │   │   ├── Home.jsx          # Homepage & featured books
│   │   │   ├── Login.jsx         # Login & registration with 1-click demo buttons
│   │   │   ├── MyListings.jsx    # Dashboard for managing listings
│   │   │   └── UserDashboard.jsx # Reader personal dashboard & inquiries inbox
│   │   ├── services/
│   │   │   └── api.js            # Axios client
│   │   ├── app.jsx               # App routing configuration
│   │   ├── index.css             # Modern styling & badges
│   │   └── main.jsx              # React 19 application mount
│   ├── index.html                # HTML entry point
│   └── package.json              # Frontend dependencies
│
└── package.json                  # Root workspace runner scripts
```

---

## 🚀 Getting Started

### 1. Running the Backend Server
```powershell
cd backend
npm start
```
*Backend runs on `http://localhost:5000`.*

### 2. Running the Frontend Application
In a separate terminal:
```powershell
cd book_exchange
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

### 🔑 Administrator Access
To access the Administrator Dashboard (`/admin-dashboard`), sign in with:
- **Email:** `admin@bookbridge.com`
- **Password:** `admin123`

To access the User Dashboard, simply click **Sign Up** to create an account with any name and email, or sign in with your credentials.
