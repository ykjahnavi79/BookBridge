const mongoose = require("mongoose");
const Book = require("../models/Book");
const User = require("../models/User");
const Inquiry = require("../models/Inquiry");
const { sampleBooks } = require("./bookController");

// Helper to calculate fallback stats from sample books
const getFallbackStats = () => {
    const books = sampleBooks || [];
    const totalBooks = books.length;
    const availableBooks = books.filter(b => b.availability).length;
    const exchangedBooks = totalBooks - availableBooks;
    const totalListingValue = books.reduce((sum, b) => b.exchangeType === "Sell" ? sum + (Number(b.price) || 0) : sum, 0);

    const categoryMap = {};
    books.forEach(b => {
        const cat = b.category || "Other";
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const exchangeTypeMap = {};
    books.forEach(b => {
        const type = b.exchangeType || "Exchange";
        exchangeTypeMap[type] = (exchangeTypeMap[type] || 0) + 1;
    });

    const conditionMap = {};
    books.forEach(b => {
        const cond = b.condition || "Good";
        conditionMap[cond] = (conditionMap[cond] || 0) + 1;
    });

    return {
        metrics: {
            totalBooks,
            availableBooks,
            exchangedBooks,
            totalUsers: 3,
            activeUsers: 3,
            totalInquiries: 2,
            totalListingValue
        },
        breakdowns: {
            categories: categoryMap,
            exchangeTypes: exchangeTypeMap,
            conditions: conditionMap
        },
        recent: {
            books: books.slice(0, 5),
            users: [],
            inquiries: []
        }
    };
};

// GET PLATFORM ANALYTICS
const getStats = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.log("MongoDB not ready in getStats, returning fallback analytics");
            return res.status(200).json(getFallbackStats());
        }

        const [
            totalBooks,
            availableBooks,
            totalUsers,
            activeUsers,
            totalInquiries,
            allBooks,
            recentBooks,
            recentUsers,
            recentInquiries
        ] = await Promise.all([
            Book.countDocuments(),
            Book.countDocuments({ availability: true }),
            User.countDocuments(),
            User.countDocuments({ status: "active" }),
            Inquiry.countDocuments(),
            Book.find().select("category exchangeType condition price availability"),
            Book.find().sort({ createdAt: -1 }).limit(5),
            User.find().select("-password").sort({ createdAt: -1 }).limit(5),
            Inquiry.find().sort({ createdAt: -1 }).limit(5)
        ]);

        const exchangedBooks = totalBooks - availableBooks;

        // Total listing value
        const totalListingValue = allBooks.reduce((sum, b) => {
            return b.exchangeType === "Sell" ? sum + (Number(b.price) || 0) : sum;
        }, 0);

        // Category breakdown
        const categoryMap = {};
        allBooks.forEach(b => {
            const cat = b.category || "Other";
            categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });

        // Exchange type breakdown
        const exchangeTypeMap = {};
        allBooks.forEach(b => {
            const type = b.exchangeType || "Exchange";
            exchangeTypeMap[type] = (exchangeTypeMap[type] || 0) + 1;
        });

        // Condition breakdown
        const conditionMap = {};
        allBooks.forEach(b => {
            const cond = b.condition || "Good";
            conditionMap[cond] = (conditionMap[cond] || 0) + 1;
        });

        res.status(200).json({
            metrics: {
                totalBooks,
                availableBooks,
                exchangedBooks,
                totalUsers,
                activeUsers,
                totalInquiries,
                totalListingValue
            },
            breakdowns: {
                categories: categoryMap,
                exchangeTypes: exchangeTypeMap,
                conditions: conditionMap
            },
            recent: {
                books: recentBooks,
                users: recentUsers,
                inquiries: recentInquiries
            }
        });
    } catch (error) {
        console.error("Error in getStats, using fallback:", error.message);
        res.status(200).json(getFallbackStats());
    }
};

// ADMIN CLEAR ALL BOOKS
const clearBooks = async (req, res) => {
    try {
        const result = await Book.deleteMany({});
        res.status(200).json({
            message: `Cleared ${result.deletedCount} books from database.`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStats,
    clearBooks
};

