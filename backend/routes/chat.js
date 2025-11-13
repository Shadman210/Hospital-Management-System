const express = require("express");
const Chat = require("../models/Chat");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Authentication middleware
const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).send({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ error: "Invalid token" });
  }
};

// Get or create chat between patient and doctor
router.post("/get-or-create", auth, async (req, res) => {
  try {
    const { patientId, doctorId } = req.body;

    // Find existing chat
    let chat = await Chat.findOne({ patientId, doctorId });

    if (!chat) {
      // Get patient and doctor names
      const patient = await User.findById(patientId);
      const doctor = await Doctor.findById(doctorId);

      if (!patient || !doctor) {
        return res.status(404).send({ error: "Patient or Doctor not found" });
      }

      // Create new chat
      chat = new Chat({
        patientId,
        doctorId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        messages: []
      });
      await chat.save();
    }

    res.status(200).send(chat);
  } catch (error) {
    console.error("Error getting/creating chat:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Send a message
router.post("/send-message", auth, async (req, res) => {
  try {
    const { chatId, message } = req.body;
    const { id, role } = req.user;

    if (!chatId || !message) {
      return res.status(400).send({ error: "Chat ID and message are required" });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).send({ error: "Chat not found" });
    }

    // Verify user is part of this chat
    const isPatient = chat.patientId.toString() === id;
    const isDoctor = chat.doctorId.toString() === id;

    if (!isPatient && !isDoctor) {
      return res.status(403).send({ error: "Not authorized to send messages in this chat" });
    }

    // Get sender name from database
    let senderName;
    if (role === "patient") {
      const patient = await User.findById(id);
      senderName = `${patient.firstName} ${patient.lastName}`;
    } else {
      const doctor = await Doctor.findById(id);
      senderName = `${doctor.firstName} ${doctor.lastName}`;
    }

    // Add message
    const newMessage = {
      senderId: id,
      senderRole: role,
      senderName: senderName,
      message: message.trim(),
      timestamp: new Date()
    };

    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    await chat.save();

    res.status(200).send({ message: "Message sent successfully", chat });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Get all chats for a user (patient or doctor)
router.get("/my-chats", auth, async (req, res) => {
  try {
    const { id, role } = req.user;

    let chats;
    if (role === "patient") {
      chats = await Chat.find({ patientId: id }).sort({ lastMessage: -1 });
    } else if (role === "doctor") {
      chats = await Chat.find({ doctorId: id }).sort({ lastMessage: -1 });
    } else {
      return res.status(403).send({ error: "Only patients and doctors can access chats" });
    }

    res.status(200).send(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Get messages for a specific chat
router.get("/messages/:chatId", auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { id } = req.user;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).send({ error: "Chat not found" });
    }

    // Verify user is part of this chat
    const isPatient = chat.patientId.toString() === id;
    const isDoctor = chat.doctorId.toString() === id;

    if (!isPatient && !isDoctor) {
      return res.status(403).send({ error: "Not authorized to view this chat" });
    }

    res.status(200).send(chat);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = router;
