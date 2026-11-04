const mongoose = require("mongoose");
const User = require("../models/User");

// In-memory user store for fallback if MongoDB connection is pending or offline
let memoryUsers = [
    {
        _id: "admin-id-1",
        name: "Platform Administrator",
        email: "admin@bookbridge.com",
        password: "admin123",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        phone: "+91 98765 43210",
        location: "New Delhi, India",
        bio: "Head Administrator overseeing BookBridge community safety and catalog quality.",
        status: "active",
        createdAt: new Date().toISOString()
    },
    {
        _id: "user-id-1",
        name: "Priya Sharma",
        email: "priya@example.com",
        password: "user123",
        role: "user",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
        phone: "+91 98111 22334",
        location: "Bengaluru, India",
        bio: "Avid reader of contemporary fiction, classics, and self-help literature.",
        status: "active",
        createdAt: new Date().toISOString()
    },
    {
        _id: "user-id-2",
        name: "Arjun Mehta",
        email: "arjun@example.com",
        password: "user123",
        role: "user",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        phone: "+91 97222 33445",
        location: "Mumbai, India",
        bio: "Computer science graduate swapping engineering textbooks and sci-fi sagas.",
        status: "active",
        createdAt: new Date().toISOString()
    }
];

// REGISTER
const register = async (req, res) => {
    try {
        const { name, email, password, role, phone, location, bio } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }

        const cleanEmail = email.toLowerCase().trim();
        const userRole = (role === "admin" || cleanEmail.includes("admin@")) ? "admin" : "user";

        // If MongoDB is connected, save to DB
        if (mongoose.connection.readyState === 1) {
            const existingUser = await User.findOne({ email: cleanEmail });
            if (existingUser) {
                return res.status(400).json({ message: "An account with this email already exists." });
            }

            const user = await User.create({
                name: name.trim(),
                email: cleanEmail,
                password,
                role: userRole,
                phone: phone ? phone.trim() : "",
                location: location ? location.trim() : "",
                bio: bio ? bio.trim() : "",
                status: "active"
            });

            // Also keep in memoryUsers
            memoryUsers.push({
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                password,
                role: user.role,
                location: user.location,
                status: user.status
            });

            return res.status(201).json({
                message: "Registration successful!",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    location: user.location,
                    status: user.status
                }
            });
        }

        // Fallback if MongoDB is connecting or offline
        console.log("MongoDB offline, registering user in memory fallback:", cleanEmail);
        const existsInMemory = memoryUsers.find(u => u.email === cleanEmail);
        if (existsInMemory) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }

        const newUser = {
            _id: "user-" + Date.now(),
            name: name.trim(),
            email: cleanEmail,
            password,
            role: userRole,
            phone: phone ? phone.trim() : "",
            location: location ? location.trim() : "",
            bio: bio ? bio.trim() : "",
            status: "active",
            createdAt: new Date().toISOString()
        };

        memoryUsers.push(newUser);

        return res.status(201).json({
            message: "Registration successful!",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                location: newUser.location,
                status: newUser.status
            }
        });

    } catch (error) {
        console.error("Register error:", error.message);
        res.status(500).json({ message: error.message || "Registration failed." });
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const cleanEmail = email.toLowerCase().trim();

        // If MongoDB is connected
        if (mongoose.connection.readyState === 1) {
            const user = await User.findOne({ email: cleanEmail });
            if (user) {
                if (user.status === "suspended") {
                    return res.status(403).json({ message: "Your account is currently suspended. Please contact support." });
                }

                if (user.password !== password) {
                    return res.status(401).json({ message: "Invalid email or password." });
                }

                return res.status(200).json({
                    message: "Login successful!",
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        avatar: user.avatar,
                        phone: user.phone,
                        location: user.location,
                        bio: user.bio,
                        status: user.status,
                        createdAt: user.createdAt
                    }
                });
            }
        }

        // Memory fallback (or offline credentials)
        const found = memoryUsers.find(u => u.email === cleanEmail);
        if (found) {
            if (found.password !== password) {
                return res.status(401).json({ message: "Invalid email or password." });
            }

            return res.status(200).json({
                message: "Login successful!",
                user: {
                    id: found._id,
                    name: found.name,
                    email: found.email,
                    role: found.role,
                    avatar: found.avatar || "",
                    phone: found.phone || "",
                    location: found.location || "",
                    bio: found.bio || "",
                    status: found.status,
                    createdAt: found.createdAt
                }
            });
        }

        return res.status(401).json({ message: "Invalid email or password." });

    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// GET ALL USERS (FOR ADMIN)
const getUsers = async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const users = await User.find().select("-password").sort({ createdAt: -1 });
            return res.status(200).json(users);
        }
        res.status(200).json(memoryUsers.map(({ password, ...rest }) => rest));
    } catch (error) {
        res.status(200).json(memoryUsers.map(({ password, ...rest }) => rest));
    }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, location, bio, avatar } = req.body;

        if (mongoose.connection.readyState === 1) {
            const updated = await User.findByIdAndUpdate(
                id,
                { name, phone, location, bio, avatar },
                { new: true, runValidators: true }
            ).select("-password");

            if (updated) {
                return res.status(200).json({
                    message: "Profile updated successfully!",
                    user: updated
                });
            }
        }

        // Memory fallback
        const user = memoryUsers.find(u => u._id === id || u.email === id);
        if (user) {
            if (name) user.name = name;
            if (phone) user.phone = phone;
            if (location) user.location = location;
            if (bio) user.bio = bio;
            if (avatar) user.avatar = avatar;
            return res.status(200).json({ message: "Profile updated successfully!", user });
        }

        res.status(404).json({ message: "User not found." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// TOGGLE ROLE (ADMIN ONLY)
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        if (mongoose.connection.readyState === 1) {
            const user = await User.findById(id);
            if (user) {
                user.role = user.role === "admin" ? "user" : "admin";
                await user.save();
                return res.status(200).json({
                    message: `User role updated to ${user.role}!`,
                    user: { id: user._id, name: user.name, email: user.email, role: user.role }
                });
            }
        }

        const user = memoryUsers.find(u => u._id === id);
        if (user) {
            user.role = user.role === "admin" ? "user" : "admin";
            return res.status(200).json({
                message: `User role updated to ${user.role}!`,
                user: { id: user._id, name: user.name, email: user.email, role: user.role }
            });
        }

        res.status(404).json({ message: "User not found." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// TOGGLE USER STATUS (ACTIVE / SUSPENDED)
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (mongoose.connection.readyState === 1) {
            const user = await User.findById(id);
            if (user) {
                user.status = user.status === "active" ? "suspended" : "active";
                await user.save();
                return res.status(200).json({
                    message: `User status changed to ${user.status}!`,
                    user: { id: user._id, name: user.name, status: user.status }
                });
            }
        }

        const user = memoryUsers.find(u => u._id === id);
        if (user) {
            user.status = user.status === "active" ? "suspended" : "active";
            return res.status(200).json({
                message: `User status changed to ${user.status}!`,
                user: { id: user._id, name: user.name, status: user.status }
            });
        }

        res.status(404).json({ message: "User not found." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE USER (ADMIN ONLY)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (mongoose.connection.readyState === 1) {
            await User.findByIdAndDelete(id);
        }
        memoryUsers = memoryUsers.filter(u => u._id !== id);
        res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// SEED USERS
const seedUsers = async (req, res) => {
    try {
        for (const u of memoryUsers) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                await User.create(u);
            }
        }
        const count = await User.countDocuments();
        res.status(200).json({ message: `Users seeded successfully! Total users: ${count}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
    getUsers,
    updateProfile,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    seedUsers
};
