const express = require("express");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const checkToken = require("../middleware/auth");
const { createUser, loginUser, getUser, changeUser } = require("../db/userdb");
const { tryCatch } = require("../utils/tryCatch");
const { encrypt } = require("../utils/passwordEncryption");

const DEFAULT_IMAGE = "https://ih1.redbubble.net/image.1046392292.3346/st,medium,507x507-pad,600x600,f8f8f8.jpg";

const router = express.Router();

const schema = Joi.object({
    name: Joi.string().required(),
    password: Joi.string().min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .required(),
    email: Joi.string().required(),
    image: Joi.string().required()
});

// @desc Creates new user in the database
// @route POST /api/users
// @access Public
router.post("/",
    tryCatch(async (req, res, next) => {
        let newUser = {
            name: req.body.name,
            password: req.body.password,
            email: req.body.email,
            image: DEFAULT_IMAGE
        }
        const { error, value } = schema.validate(newUser);
        if (error) throw error;

        const response = await createUser(newUser);
        delete newUser.password;
        newUser.id = response.user_id
        newUser.image = DEFAULT_IMAGE;

        let token = jwt.sign(newUser, process.env.JWT_SECRET_KEY, {
            expiresIn: "10m",
        });
        return res.json({"status": "success", "token": token, "details": newUser});
}));

// @desc Logs in user if it exists
// @route POST /api/users/login
// @access Public
router.post("/login",
    tryCatch(async (req, res, next) => {
        let user = {
            email: req.body.email,
            password: req.body.password
        };
        let response = await loginUser(user);

        delete user.password;
        user.id = response.user_id;
        user.name = response.name;
        user.image = response.image;

        let token = jwt.sign(user, process.env.JWT_SECRET_KEY, {
            expiresIn: "10m",
        });
        return res.json({ "status": "success", "token": token, "details": user });
}));

// @desc Gets user info
// @route GET /api/users
// @access Private
router.get("/", checkToken,
    tryCatch(async (req, res, next) => {
        let response = await getUser(req.user);
        delete response.password;
        return res.json({ "status": "success", "details": response });
}));

// @desc Changes user info
// @route PUT /api/users
// @access Private
router.put("/", checkToken,
    tryCatch(async (req, res, next) => {
        const user = await getUser(req.user);
        delete user.id;
        const oldPassword = user.password;

        user.name = req.body.name ? req.body.name : user.name;
        user.image = req.body.image ? req.body.image : user.image;
        user.email = req.body.email ? req.body.email : user.email;
        user.password = req.body.password ? req.body.password : "Pa$sw0rd";
        
        const { error, value } = schema.validate(user);
        if (error) throw error;
        if (req.body.password) {
            user.password = await encrypt(user.password);
        } else {
            // If not provided, use the existing hashed password
            user.password = oldPassword;
        }  
        
        user.password = req.body.password ? await encrypt(user.password) : oldPassword; 
        await changeUser(user, req.user);
        delete user.password;
        user.id = req.user.id;
        console.log(user)
        let token = jwt.sign(user, process.env.JWT_SECRET_KEY, {
            expiresIn: "10m",
        });
        return res.json({"status": "success", "token": token, "details": user});
}));


module.exports = router;