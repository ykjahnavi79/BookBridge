const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load .env from backend folder
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

const Book = require("./models/Book");
const User = require("./models/User");
const Inquiry = require("./models/Inquiry");

const users = [
  {
    name: "Platform Administrator",
    email: "admin@bookbridge.com",
    password: "admin123",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    phone: "+91 98765 43210",
    location: "New Delhi, India",
    bio: "Head Administrator overseeing BookBridge community safety and catalog quality.",
    status: "active"
  },
  {
    name: "Priya Sharma",
    email: "priya@example.com",
    password: "user123",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    phone: "+91 98111 22334",
    location: "Bengaluru, India",
    bio: "Avid reader of contemporary fiction, classics, and self-help literature.",
    status: "active"
  },
  {
    name: "Arjun Mehta",
    email: "arjun@example.com",
    password: "user123",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    phone: "+91 97222 33445",
    location: "Mumbai, India",
    bio: "Computer science graduate swapping engineering textbooks and sci-fi sagas.",
    status: "active"
  }
];

const inquiries = [
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

const books = [
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
    description: "A classic 1925 novel following Jay Gatsby and his unrequited love for Daisy Buchanan amidst the roaring jazz age of Long Island.",
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
    description: "A dystopian social science fiction novel that examines the dangers of totalitarianism, extreme surveillance, and truth suppression.",
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
    description: "A romantic comedy classic following Elizabeth Bennet as she deals with issues of manners, upbringing, morality, and marriage in 19th-century England.",
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
    description: "A handbook of agile software craftsmanship packed with principles, patterns, and practical advice on writing elegant, readable, and testable code.",
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
    description: "The comprehensive textbook on computer algorithms used worldwide, covering sorting, data structures, graph algorithms, and dynamic programming.",
    condition: "Good",
    exchangeType: "Sell",
    price: 650,
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    availability: true
  },
  {
    title: "Design Patterns",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    category: "Academic",
    description: "The Gang of Four's timeless guide to 23 foundational object-oriented design patterns for software architecture.",
    condition: "Good",
    exchangeType: "Exchange",
    price: 0,
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80",
    availability: true
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self-Help",
    description: "An easy and proven way to build good habits and break bad ones through tiny, compound changes with remarkable life-long results.",
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
    description: "Timeless lessons on wealth, greed, and happiness, showing how our personal relationship with money shapes financial decision-making.",
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
    description: "Rules for focused success in a distracted world. How to cultivate intense concentration and produce at an elite level.",
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
    description: "Set on the desert planet Arrakis, Dune tells the saga of young Paul Atreides and the battle for the most precious substance in the universe: spice melange.",
    condition: "Good",
    exchangeType: "Sell",
    price: 350,
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80",
    availability: true
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    category: "Fantasy",
    description: "Bilbo Baggins leaves his cozy hobbit hole to join Thorin Oakenshield and Gandalf on a quest to reclaim the Lonely Mountain from Smaug the dragon.",
    condition: "New",
    exchangeType: "Exchange",
    price: 0,
    image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80",
    availability: true
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    category: "Sci-Fi",
    description: "A lone astronaut must save the Earth from an extinction-level catastrophe with science, ingenuity, and an unexpected interstellar ally.",
    condition: "New",
    exchangeType: "Sell",
    price: 420,
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    availability: true
  },
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    category: "Biography",
    description: "The gripping biography of the creative entrepreneur whose passion for perfection and ferocious drive revolutionized six major industries.",
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
    description: "A bold, wide-ranging narrative exploring how Homo sapiens came to dominate planet Earth through biology, history, and cognitive evolution.",
    condition: "Good",
    exchangeType: "Sell",
    price: 380,
    image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80",
    availability: true
  }
];

async function seedDatabase() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bookbridge";

  console.log("Connecting to MongoDB...");
  console.log(`Target URI: ${uri.replace(/:([^:@]+)@/, ":****@")}`);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    console.log("✓ Connected to MongoDB successfully!");

    // 1. Seed Users
    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`  + Added User: ${u.name} (${u.role})`);
      }
    }

    // 2. Seed Inquiries
    for (const inq of inquiries) {
      const exists = await Inquiry.findOne({ bookTitle: inq.bookTitle, senderEmail: inq.senderEmail });
      if (!exists) {
        await Inquiry.create(inq);
        console.log(`  + Added Inquiry for: "${inq.bookTitle}"`);
      }
    }

    // 3. Seed Books
    if (process.argv.includes("--force")) {
      await Book.deleteMany({});
      console.log("Cleared existing books (--force).");
    }

    let insertedCount = 0;
    for (const b of books) {
      const exists = await Book.findOne({ title: b.title, author: b.author });
      if (!exists) {
        await Book.create(b);
        console.log(`  + Added: "${b.title}" by ${b.author} [${b.exchangeType}]`);
        insertedCount++;
      }
    }

    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalInquiries = await Inquiry.countDocuments();

    console.log(`\n🎉 Seeding complete!`);
    console.log(`  • Books: ${totalBooks}`);
    console.log(`  • Users: ${totalUsers}`);
    console.log(`  • Inquiries: ${totalInquiries}`);

  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

seedDatabase();
