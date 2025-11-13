const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialty: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  role: { type: String, default: "doctor" },
});

doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  next();
});

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
