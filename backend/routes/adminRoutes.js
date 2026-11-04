const express = require("express");
const router = express.Router();

const {
    getStats,
    clearBooks
} = require("../controllers/adminController");

router.get("/stats", getStats);
router.post("/clear-books", clearBooks);

module.exports = router;

