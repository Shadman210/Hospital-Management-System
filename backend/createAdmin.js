const mongoose = require("mongoose");

const User = require("./models/User");
const Admin = require("./models/Admin");

// ✅ MongoDB connection URI (update if needed)
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hospitaldb";

async function createAdmin() {
  try {
    // 1️⃣ Connect to DB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // 2️⃣ Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists:", existingAdmin.email);
      return;
    }

    // 3️⃣ Hash password

    // 4️⃣ Create Admin document
    const admin = new Admin({
      firstName: "Super",
      lastName: "Admin",
      email: "admin@example.com",
      password: `admin123`,
      role: "admin",
    });
    await admin.save();

    // 5️⃣ Create User document (linked)
    const user = new User({
      firstName: "Super",
      lastName: "Admin",
      email: "admin@example.com",
      password: `admin123`,
      role: "admin",
    });
    await user.save();

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@example.com");
    console.log("🔑 Password: admin123");
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
