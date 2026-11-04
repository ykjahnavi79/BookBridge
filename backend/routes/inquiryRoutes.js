const express = require("express");
const router = express.Router();

const {
    createInquiry,
    getInquiries,
    updateInquiryStatus,
    deleteInquiry,
    seedInquiries
} = require("../controllers/inquiryController");

router.post("/", createInquiry);
router.get("/", getInquiries);
router.patch("/:id/status", updateInquiryStatus);
router.delete("/:id", deleteInquiry);
router.post("/seed", seedInquiries);

module.exports = router;

