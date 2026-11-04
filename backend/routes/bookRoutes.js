const express = require("express");
const router = express.Router();

const {
    seedBooks,
    addBook,
    getBooks,
    getBookById,
    updateBook,
    toggleAvailability,
    deleteBook
} = require("../controllers/bookController");

// Seed sample data
router.post("/seed", seedBooks);

// Book CRUD operations
router.post("/", addBook);
router.get("/", getBooks);
router.get("/:id", getBookById);
router.put("/:id", updateBook);
router.patch("/:id/toggle", toggleAvailability);
router.delete("/:id", deleteBook);

module.exports = router;
