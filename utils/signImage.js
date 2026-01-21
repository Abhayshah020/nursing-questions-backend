// utils/signImage.js

import jwt from "jsonwebtoken";

export const signImage = (imagePath, userId) => {
    return jwt.sign(
        { imagePath, userId },
        process.env.JWT_SECRET,
        { expiresIn: "1d" } // short-lived
    );
};
