const jwt = require("jsonwebtoken");
const { User } = require("../models");
const crypto = require("crypto");
const { sendMail } = require("../utils/sendMail");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");

const getEmailStyles = () => `
    body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color: #f4f7fa;
    }
    .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
    }
    .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 20px;
        text-align: center;
    }
    .logo {
        max-width: 180px;
        height: auto;
        margin-bottom: 10px;
    }
    .company-name {
        color: #ffffff;
        font-size: 28px;
        font-weight: 700;
        margin: 10px 0 0 0;
        letter-spacing: 1px;
    }
    .content {
        padding: 40px 30px;
    }
    .greeting {
        font-size: 24px;
        color: #2d3748;
        margin-bottom: 20px;
        font-weight: 600;
    }
    .message {
        font-size: 16px;
        color: #4a5568;
        line-height: 1.6;
        margin-bottom: 30px;
    }
    .button-container {
        text-align: center;
        margin: 35px 0;
    }
    .reset-button {
        display: inline-block;
        padding: 16px 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 50px;
        font-size: 16px;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        transition: transform 0.2s;
    }
    .otp-box {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        padding: 25px;
        border-radius: 15px;
        text-align: center;
        margin: 30px 0;
        box-shadow: 0 8px 20px rgba(245, 87, 108, 0.3);
    }
    .otp-label {
        color: #ffffff;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 10px;
        font-weight: 600;
    }
    .otp-code {
        color: #ffffff;
        font-size: 42px;
        font-weight: 800;
        letter-spacing: 8px;
        margin: 10px 0;
        font-family: 'Courier New', monospace;
        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .warning-box {
        background-color: #fff5f5;
        border-left: 4px solid #fc8181;
        padding: 15px 20px;
        margin: 25px 0;
        border-radius: 8px;
    }
    .warning-text {
        color: #c53030;
        font-size: 14px;
        margin: 0;
        line-height: 1.5;
    }
    .info-box {
        background-color: #ebf8ff;
        border-left: 4px solid #4299e1;
        padding: 15px 20px;
        margin: 25px 0;
        border-radius: 8px;
    }
    .info-text {
        color: #2c5282;
        font-size: 14px;
        margin: 0;
        line-height: 1.5;
    }
    .expiry-notice {
        text-align: center;
        color: #718096;
        font-size: 14px;
        margin: 20px 0;
        font-weight: 500;
    }
    .footer {
        background-color: #2d3748;
        padding: 30px 20px;
        text-align: center;
    }
    .footer-text {
        color: #a0aec0;
        font-size: 13px;
        line-height: 1.6;
        margin: 5px 0;
    }
    .divider {
        height: 1px;
        background: linear-gradient(to right, transparent, #e2e8f0, transparent);
        margin: 30px 0;
    }
    .security-icon {
        width: 60px;
        height: 60px;
        margin: 0 auto 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;

// Password Reset Email Template
const getPasswordResetTemplate = (userName, resetUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>${getEmailStyles()}</style>
</head>
<body>
    <div class="email-container">
        <!-- Header with Logo -->
        <div class="header">
            <h1 class="company-name">SMS Skills and Trades Intitute</h1>
        </div>

        <!-- Main Content -->
        <div class="content">
            <h2 class="greeting">Hello ${userName}! 👋</h2>
            
            <p class="message">
                We received a request to reset your password. Don't worry, we've got you covered!
            </p>

            <div class="info-box">
                <p class="info-text">
                    <strong>🔐 Security Notice:</strong> Click the button below to create a new password. 
                    This link is unique to you and will expire in 15 minutes for your security.
                </p>
            </div>

            <div class="button-container">
                <a href="${resetUrl}" class="reset-button">Reset My Password</a>
            </div>

            <p class="expiry-notice">
                ⏰ This link expires in <strong>15 minutes</strong>
            </p>

            <div class="divider"></div>

            <p class="message" style="font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; color: #667eea; font-size: 13px; background-color: #f7fafc; padding: 12px; border-radius: 8px;">
                ${resetUrl}
            </p>

            <div class="warning-box">
                <p class="warning-text">
                    <strong>⚠️ Didn't request this?</strong><br>
                    If you didn't ask to reset your password, you can safely ignore this email. 
                    Your password will remain unchanged.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                <strong>Nursing Exam System</strong><br>
                Secure. Reliable. Trusted.
            </p>
            <a class="footer-text" href="https://smsitsolutions.com.au/">
                © ${new Date().getFullYear()} SMS IT Solutions. All rights reserved.
            </a>
            <p class="footer-text">
                This is an automated message, please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
`;

// OTP Email Template
const getOTPEmailTemplate = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification OTP</title>
    <style>${getEmailStyles()}</style>
</head>
<body>
    <div class="email-container">
        <!-- Header with Logo -->
        <div class="header">
            <h1 class="company-name">SMS Skills and Trades Intitute</h1>
        </div>

        <!-- Main Content -->
        <div class="content">
            <h2 class="greeting">Verify Your Email 📧</h2>
            
            <p class="message">
                We're excited to have you! To complete your verification, please use the One-Time Password (OTP) below:
            </p>

            <!-- OTP Box -->
            <div class="otp-box">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
            </div>

            <p class="expiry-notice">
                ⏰ This code expires in <strong>10 minutes</strong>
            </p>

            <div class="divider"></div>

            <div class="info-box">
                <p class="info-text">
                    <strong>💡 Quick Tip:</strong> Enter this code in the verification screen to complete your email verification process.
                </p>
            </div>

            <div class="warning-box">
                <p class="warning-text">
                    <strong>🛡️ Security Alert:</strong><br>
                    Never share this code with anyone. Our team will never ask for your OTP via email, phone, or any other channel.
                </p>
            </div>

            <p class="message" style="margin-top: 30px; font-size: 14px; color: #718096;">
                If you didn't request this verification code, please ignore this email or contact our support team if you have concerns.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                <strong>Nursing Exam System</strong><br>
                Secure. Reliable. Trusted.
            </p>
            <a class="footer-text" href="https://smsitsolutions.com.au/">
                © ${new Date().getFullYear()} SMS IT Solutions. All rights reserved.
            </a>
            <p class="footer-text">
                This is an automated message, please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
`;

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
};

const hashOTP = (otp) => {
    return crypto.createHash("sha256").update(otp).digest("hex");
};

const sendOTPEmail = async (email, otp) => {
    // Optional: Add your company logo URL

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
        subject: "🔑 Your Email Verification Code - Exam System",
        html: getOTPEmailTemplate(otp)
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
            secure: true, // must be true for HTTPS
            sameSite: "none", // for cross-subdomain requests
            domain: ".smsitsolutions.com.au", // share between frontend/backend
            maxAge: 7 * 24 * 60 * 60 * 1000,
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

        if (!user) {
            return res.status(200).json({
                message: "If this email exists, a reset link has been sent"
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // Optional: Add your company logo URL
        await sendMail({
            to: user.email,
            subject: "🔐 Password Reset Request - Exam System",
            html: getPasswordResetTemplate(user.name, resetUrl)
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
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
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
