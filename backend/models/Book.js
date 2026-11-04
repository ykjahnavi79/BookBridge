const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    condition: {
        type: String,
        enum: ["New", "Good", "Average"],
        default: "Good"
    },
    exchangeType: {
        type: String,
        enum: ["Exchange", "Sell", "Free"],
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        default: ""
    },
    availability: {
        type: Boolean,
        default: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    ownerName: {
        type: String,
        default: "Community Reader"
    },
    ownerEmail: {
        type: String,
        default: "community@bookbridge.com"
    }
}, { timestamps: true });

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
