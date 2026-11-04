const express = require("express");
const router = express.Router();

const {
    register,
    login,
    getUsers,
    updateProfile,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    seedUsers
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/users", getUsers);
router.put("/users/:id", updateProfile);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/status", toggleUserStatus);
router.delete("/users/:id", deleteUser);
router.post("/seed", seedUsers);

module.exports = router;

