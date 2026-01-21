const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // If you use cookie-parser middleware
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role, permissions }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
