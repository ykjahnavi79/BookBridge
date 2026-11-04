const Inquiry = require("../models/Inquiry");

// Sample initial inquiries
const defaultInquiries = [
    {
        bookTitle: "Atomic Habits",
        bookImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80",
        senderName: "Priya Sharma",
        senderEmail: "priya@example.com",
        senderPhone: "+91 98111 22334",
        message: "Hi! I have 'The Alchemist' in brand new condition. Would love to swap for Atomic Habits!",
        exchangeType: "Exchange",
        status: "Pending",
        ownerEmail: "admin@bookbridge.com"
    },
    {
        bookTitle: "Clean Code",
        bookImage: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80",
        senderName: "Arjun Mehta",
        senderEmail: "arjun@example.com",
        senderPhone: "+91 97222 33445",
        message: "Hello, I am interested in purchasing Clean Code. Can we arrange weekend pickup?",
        exchangeType: "Sell",
        status: "Accepted",
        ownerEmail: "admin@bookbridge.com"
    }
];

// CREATE INQUIRY
const createInquiry = async (req, res) => {
    try {
        const { bookId, bookTitle, bookImage, senderName, senderEmail, senderPhone, message, exchangeType, ownerEmail } = req.body;

        if (!bookTitle || !senderName || !senderEmail) {
            return res.status(400).json({ message: "Book title, sender name, and sender email are required." });
        }

        const inquiry = await Inquiry.create({
            bookId: bookId || "000000000000000000000000",
            bookTitle,
            bookImage: bookImage || "",
            senderName,
            senderEmail,
            senderPhone: senderPhone || "",
            message: message || "",
            exchangeType: exchangeType || "Exchange",
            ownerEmail: ownerEmail || "community@bookbridge.com",
            status: "Pending"
        });

        res.status(201).json({
            message: "Inquiry / Exchange proposal sent successfully!",
            inquiry
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET INQUIRIES
const getInquiries = async (req, res) => {
    try {
        const { email, role } = req.query;

        let filter = {};
        if (role !== "admin" && email) {
            // normal user sees inquiries they sent or received
            filter = {
                $or: [
                    { senderEmail: email.toLowerCase() },
                    { ownerEmail: email.toLowerCase() }
                ]
            };
        }

        const inquiries = await Inquiry.find(filter).sort({ createdAt: -1 });
        res.status(200).json(inquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE STATUS (Accepted, Declined, Pending)
const updateInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const inquiry = await Inquiry.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found." });
        }

        res.status(200).json({
            message: `Inquiry status marked as ${status}!`,
            inquiry
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE INQUIRY
const deleteInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Inquiry.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Inquiry not found." });
        }

        res.status(200).json({ message: "Inquiry deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// SEED SAMPLE INQUIRIES
const seedInquiries = async (req, res) => {
    try {
        const count = await Inquiry.countDocuments();
        if (count === 0) {
            await Inquiry.insertMany(defaultInquiries);
        }
        res.status(200).json({ message: "Inquiries seeded successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createInquiry,
    getInquiries,
    updateInquiryStatus,
    deleteInquiry,
    seedInquiries
};

