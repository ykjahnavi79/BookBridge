const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        default: null
    },
    bookTitle: {
        type: String,
        required: true
    },
    bookImage: {
        type: String,
        default: ""
    },
    senderName: {
        type: String,
        required: true
    },
    senderEmail: {
        type: String,
        required: true
    },
    senderPhone: {
        type: String,
        default: ""
    },
    message: {
        type: String,
        default: ""
    },
    exchangeType: {
        type: String,
        default: "Exchange"
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Declined"],
        default: "Pending"
    },
    ownerEmail: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const Inquiry = mongoose.model("Inquiry", inquirySchema);

module.exports = Inquiry;
