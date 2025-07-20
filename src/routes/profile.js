const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateProfileUpdate } = require("../utils/validation");
const bcrypt = require('bcrypt');

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        // console.log(req.cookies)
        const { token } = req.cookies;
        if (!token) {
            throw new Error('Access denied. No token provided.');
        }

        const user = req.user; // User is attached to the request object by the userAuth middleware
        res.send(user);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

profileRouter.patch("/profile/update", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user; // User is attached to the request object by the userAuth middleware
        validateProfileUpdate(req);
        const data = req.body;
        Object.keys(data).forEach((key) => (loggedInUser[key] = data[key]));
        await loggedInUser.save();

        res.json({
            message: `${loggedInUser.firstName} profile updated successfully`,
            data: loggedInUser,
        });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

profileRouter.patch("/profile/update-password", userAuth, async (req, res) => {
    try {
        const { password } = req.body;
        const loggedInUserPassword = req.user;

        if (!password) {
            return res.status(400).send("Password is required");
        } else if (loggedInUserPassword.password === password) {
            return res
                .status(400)
                .send(
                    "Password must be strong and different from the current password"
                );
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        loggedInUserPassword.password = hashedPassword;

        await loggedInUserPassword.save();
        res.json({
            message: `${loggedInUserPassword.firstName} password updated successfully`,
        });
    } catch (error) {
        console.error(error), "line no 56";
        res.status(400).send(error.message);
    }
});

module.exports = profileRouter;
