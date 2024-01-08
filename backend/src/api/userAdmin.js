const express = require("express");
const { checkToken, adminToken } = require("../middleware/auth");
const { getAllUsers, changeUserRole } = require("../db/userdb");
const { tryCatch } = require("../utils/tryCatch");

const router = express.Router();

// @desc Gets info about all users
// @route GET /api/users/admin
// @access Private (Admin)
router.get("/", checkToken, adminToken,
    tryCatch(async (req, res, next) => {
        let response = await getAllUsers();
        return res.json({ "status": "success", "details": response });
}));

// @desc Change role for one of the users
// @route PUT /api/users/admin/:id
// @access Private (Admin)
router.put("/:id", checkToken, adminToken,
    tryCatch(async (req, res, next) => {
        let response = await changeUserRole(req.body.role, req.params.id);
        return res.json({ "status": "success", "details": response });
}));





module.exports = router;