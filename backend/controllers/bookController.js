const mongoose = require("mongoose");
const Book = require("../models/Book");

// Sample initial books for seeding
const sampleBooks = [
    {
        title: "The Alchemist",
        author: "Paulo Coelho",
        category: "Fiction",
        description: "A magical story about Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure. Gently read copy with pristine pages.",
        condition: "Good",
        exchangeType: "Exchange",
        price: 0,
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
        availability: true,
        ownerName: "Priya Sharma",
        ownerEmail: "priya@example.com"
    },
    {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        category: "Fiction",
        description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, exploring compassion and justice.",
        condition: "Good",
        exchangeType: "Exchange",
        price: 0,
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
        availability: true
    },
    {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        category: "Fiction",
        description: "A classic 1925 novel following Jay Gatsby and his unrequited love for Daisy Buchanan in Jazz Age New York.",
        condition: "Good",
        exchangeType: "Exchange",
        price: 0,
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
        availability: true
    },
    {
        title: "1984",
        author: "George Orwell",
        category: "Fiction",
        description: "A dystopian social science fiction novel examining totalitarianism, extreme surveillance, and truth suppression.",
        condition: "New",
        exchangeType: "Sell",
        price: 299,
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
        availability: true
    },
    {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        category: "Fiction",
        description: "A romantic comedy classic following Elizabeth Bennet as she deals with issues of manners, morality, and marriage.",
        condition: "Average",
        exchangeType: "Free",
        price: 0,
        image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80",
        availability: true
    },
    {
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "Academic",
        description: "A handbook of agile software craftsmanship with best practices for writing readable, maintainable code.",
        condition: "New",
        exchangeType: "Sell",
        price: 499,
        image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80",
        availability: true
    },
    {
        title: "Introduction to Algorithms (CLRS)",
        author: "Thomas H. Cormen, Charles E. Leiserson",
        category: "Academic",
        description: "The comprehensive textbook on computer algorithms covering sorting, data structures, and graph algorithms.",
        condition: "Good",
        exchangeType: "Sell",
        price: 650,
        image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
        availability: true
    },
    {
        title: "Atomic Habits",
        author: "James Clear",
        category: "Self-Help",
        description: "An easy and proven way to build good habits and break bad ones through tiny changes with remarkable results.",
        condition: "Good",
        exchangeType: "Exchange",
        price: 0,
        image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80",
        availability: true
    },
    {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        category: "Self-Help",
        description: "Timeless lessons on wealth, greed, and happiness, exploring our personal relationship with money.",
        condition: "New",
        exchangeType: "Sell",
        price: 310,
        image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80",
        availability: true
    },
    {
        title: "Deep Work",
        author: "Cal Newport",
        category: "Self-Help",
        description: "Rules for focused success in a distracted world, helping you master cognitively demanding tasks.",
        condition: "Good",
        exchangeType: "Free",
        price: 0,
        image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80",
        availability: true
    },
    {
        title: "Dune",
        author: "Frank Herbert",
        category: "Sci-Fi",
        description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family.",
        condition: "Good",
        exchangeType: "Sell",
        price: 350,
        image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80",
        availability: true
    },
    {
        title: "Project Hail Mary",
        author: "Andy Weir",
        category: "Sci-Fi",
        description: "A lone astronaut must save Earth from an extinction-level catastrophe with science, ingenuity, and a new ally.",
        condition: "New",
        exchangeType: "Sell",
        price: 420,
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
        availability: true
    },
    {
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        category: "Fantasy",
        description: "Bilbo Baggins is a hobbit who enjoys a comfortable life, until Gandalf and a company of dwarves arrive.",
        condition: "New",
        exchangeType: "Exchange",
        price: 0,
        image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80",
        availability: true
    },
    {
        title: "Steve Jobs",
        author: "Walter Isaacson",
        category: "Biography",
        description: "The exclusive biography of Steve Jobs, based on more than forty interviews with Jobs conducted over two years.",
        condition: "Average",
        exchangeType: "Free",
        price: 0,
        image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
        availability: true
    },
    {
        title: "Sapiens: A Brief History of Humankind",
        author: "Yuval Noah Harari",
        category: "Non-Fiction",
        description: "A bold, wide-ranging narrative exploring how Homo sapiens came to dominate planet Earth.",
        condition: "Good",
        exchangeType: "Sell",
        price: 380,
        image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80",
        availability: true
    }
];

// SEED SAMPLE BOOKS (if DB is empty or requested)
const seedBooks = async (req, res) => {
    try {
        const count = await Book.countDocuments();
        if (count > 0 && !req.query.force) {
            return res.status(200).json({
                message: `Database already contains ${count} books. Pass ?force=true to reseed.`,
                count
            });
        }

        if (req.query.force) {
            await Book.deleteMany({});
        }

        const inserted = await Book.insertMany(sampleBooks);
        res.status(201).json({
            message: `Successfully seeded ${inserted.length} sample books!`,
            books: inserted
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADD BOOK
const addBook = async (req, res) => {
    try {
        const { title, author, category, condition, exchangeType, price, description, image, availability } = req.body;

        if (!title || !author || !category || !exchangeType) {
            return res.status(400).json({
                message: "Please fill in all required fields: Title, Author, Category, and Exchange Type."
            });
        }

        const formattedPrice = (exchangeType === "Sell") ? Math.max(0, Number(price) || 0) : 0;

        const book = await Book.create({
            title: title.trim(),
            author: author.trim(),
            category: category.trim(),
            condition: condition || "Good",
            exchangeType,
            price: formattedPrice,
            description: description ? description.trim() : "",
            image: image ? image.trim() : "",
            availability: availability !== undefined ? availability : true
        });

        res.status(201).json({
            message: "Book added successfully!",
            book
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// GET ALL BOOKS (with search, category, condition, exchangeType, and sorting)
const getBooks = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.log("MongoDB not yet connected, returning sample preview books");
            return res.status(200).json(sampleBooks);
        }

        const { search, category, exchangeType, condition, availability, sort } = req.query;

        let filter = {};

        // Keyword search
        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [
                { title: regex },
                { author: regex },
                { category: regex },
                { description: regex }
            ];
        }

        // Category filter
        if (category && category !== "All") {
            filter.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
        }

        // Exchange Type filter
        if (exchangeType && exchangeType !== "All") {
            filter.exchangeType = exchangeType;
        }

        // Condition filter
        if (condition && condition !== "All") {
            filter.condition = condition;
        }

        // Availability filter
        if (availability !== undefined && availability !== "All") {
            filter.availability = availability === "true" || availability === true;
        }

        // Sort configuration
        let sortOption = { createdAt: -1 };
        if (sort === "price-asc") {
            sortOption = { price: 1 };
        } else if (sort === "price-desc") {
            sortOption = { price: -1 };
        } else if (sort === "title-asc") {
            sortOption = { title: 1 };
        } else if (sort === "title-desc") {
            sortOption = { title: -1 };
        } else if (sort === "oldest") {
            sortOption = { createdAt: 1 };
        }

        const books = await Book.find(filter).sort(sortOption);

        res.status(200).json(books);

    } catch (error) {
        console.log("Error querying books, returning sampleBooks fallback:", error.message);
        res.status(200).json(sampleBooks);
    }
};

// GET SINGLE BOOK
const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid book ID format." });
        }

        const book = await Book.findById(id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found."
            });
        }

        res.status(200).json(book);

    } catch (error) {
        console.log("Error querying books, returning sampleBooks fallback:", error.message);
        res.status(200).json(sampleBooks);
    }
};

// UPDATE BOOK
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid book ID format." });
        }

        const updateData = { ...req.body };
        if (updateData.exchangeType && updateData.exchangeType !== "Sell") {
            updateData.price = 0;
        }

        const book = await Book.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!book) {
            return res.status(404).json({
                message: "Book not found."
            });
        }

        res.status(200).json({
            message: "Book updated successfully!",
            book
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// TOGGLE BOOK AVAILABILITY
const toggleAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid book ID format." });
        }

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: "Book not found." });
        }

        book.availability = !book.availability;
        await book.save();

        res.status(200).json({
            message: `Book marked as ${book.availability ? "Available" : "Unavailable"}.`,
            book
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE BOOK
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid book ID format." });
        }

        const book = await Book.findByIdAndDelete(id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found."
            });
        }

        res.status(200).json({
            message: "Book deleted successfully!"
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

module.exports = {
    seedBooks,
    addBook,
    getBooks,
    getBookById,
    updateBook,
    toggleAvailability,
    deleteBook
};
