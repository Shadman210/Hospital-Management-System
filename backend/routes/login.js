const express = require("express");
const User = require("../models/User");

const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, password, role } = req.body;
  console.log("Received data:", req.body);

  try {
    // Always query the User model
    const user = await User.findOne({ email, role });
    console.log("User found:", user);

    if (!user) {
      return res.status(400).send({ error: "Invalid email or role" });
    }

    const isMatch = password === user.password;
    if (!isMatch) {
      return res.status(400).send({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      "your_jwt_secret",
      { expiresIn: "24h" }
    );

    res.send({ token, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ error: "Server error" });
  }
});

module.exports = router;
