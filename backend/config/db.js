const mongoose = require("mongoose");

const connectDB = async () => {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bookbridge";
    try {
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        console.log("Tip: If using MongoDB Atlas, check your network and ensure your IP is whitelisted (0.0.0.0/0) in Atlas Network Access settings.");
    }
};

module.exports = connectDB;
