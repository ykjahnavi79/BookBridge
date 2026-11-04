import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Books from "./pages/Books";
import AddBook from "./pages/AddBook";
import BookDetails from "./pages/BookDetails";
import MyListings from "./pages/MyListings";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/add-book" element={<AddBook />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route path="/my-listings" element={<MyListings />} />

            {/* Auth & Dashboards */}
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Navigate to="/user-dashboard" replace />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
