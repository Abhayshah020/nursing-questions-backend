const jwt = require("jsonwebtoken");
const { User } = require("../models");
const crypto = require("crypto");
const { sendMail } = require("../utils/sendMail");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
};

const hashOTP = (otp) => {
    return crypto.createHash("sha256").update(otp).digest("hex");
};

const sendOTPEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    await transporter.sendMail({
        from: `"Exam System" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your Email Verification OTP",
        html: `
            <p>Your OTP is:</p>
            <h2>${otp}</h2>
            <p>This OTP is valid for 10 minutes.</p>
        `,
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // ✅ Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        // ✅ Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        const newUser = await User.create({
            name,
            email,
            password, // Will be hashed via the model hook
            role: role || "exam_taker" // Default role
        });

        const token = jwt.sign(
            {
                id: newUser.id,
                role: newUser.role,
                permissions: newUser.permissions
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || "1d" }
        );

        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });


        // ✅ Return created user info
        return res.status(201).json({
            message: "Registration successful",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                emailVerified: newUser.emailVerified,
                permissions: newUser.permissions,
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.status !== "active") {
            return res.status(403).json({ message: "User account is inactive" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                emailVerified: user.emailVerified,
                permissions: user.permissions
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || "1d" }
        );

        // ✅ SET JWT IN COOKIE
        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: true, // must be true for HTTPS
            sameSite: "none", // for cross-subdomain requests
            domain: ".smsitsolutions.com.au", // share between frontend/backend
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });


        return res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                userDetails: user.userDetails,
                emailVerified: user.emailVerified,
            }
        });

    } catch (error) {
        console.error("Login error:", error); // 🔥 Log the error
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.logout = async (req, res) => {
    try {
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({
            message: "Logout failed",
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ where: { email } });

        // 🔒 SECURITY: Do NOT reveal if email exists
        if (!user) {
            return res.status(200).json({
                message: "If this email exists, a reset link has been sent"
            });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Hash token before storing
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        await sendMail({
            to: user.email,
            subject: "Password Reset Verification",
            html: `
                <p>Hello ${user.name},</p>
                <p>You requested a password reset.</p>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link expires in 15 minutes.</p>
                <p>If you did not request this, ignore this email.</p>
            `
        });

        res.status(200).json({
            message: "If this email exists, a reset link has been sent"
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and password required" });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Set new password
        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.status(200).json({
            message: "Password reset successful"
        });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.sendEmailOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOTP();
        const hashedOTP = hashOTP(otp);

        user.otp = hashedOTP;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await user.save();

        await sendOTPEmail(user.email, otp);

        return res.json({
            success: true,
            message: "OTP sent to registered email",
        });
    } catch (error) {
        console.error("Send OTP Error:", error);
        res.status(500).json({ message: "Failed to send OTP" });
    }
};

exports.verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user || !user.otp || !user.otpExpires) {
            return res.status(400).json({ message: "OTP not requested" });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        const hashedOTP = hashOTP(otp);

        if (hashedOTP !== user.otp) {
            return res.status(401).json({ message: "Invalid OTP" });
        }

        user.emailVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
        });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ message: "OTP verification failed" });
    }
};
