const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
});

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  next();
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
