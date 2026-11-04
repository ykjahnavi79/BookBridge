const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load .env relative to current file or working directory
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

const connectDB = require("./config/db");
const bookRoutes = require("./routes/bookRoutes");
const authRoutes = require("./routes/authRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Connect MongoDB
connectDB();

// API Routes
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/admin", adminRoutes);

// Health check / welcome route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to BookBridge Backend API!",
        status: "Running",
        endpoints: {
            books: "/api/books",
            auth: "/api/auth",
            inquiries: "/api/inquiries",
            admin: "/api/admin/stats"
        }
    });
});

// 404 Handler for undefined API routes
app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Start server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`BookBridge Backend Server running on port ${PORT}`);
    });
}

module.exports = app;
