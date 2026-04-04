const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("./src/models/user.model");
const FinancialRecord = require("./src/models/record.model");

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect DB
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing data
    await User.deleteMany();
    await FinancialRecord.deleteMany();

    // Create users (IMPORTANT: use save for hashing)
    const admin = new User({
      name: "Admin User",
      email: "admin@zorvyn.com",
      password: "admin123",
      role: "ADMIN",
      status: "ACTIVE",
    });
    await admin.save();

    const analyst = new User({
      name: "Analyst User",
      email: "analyst@zorvyn.com",
      password: "analyst123",
      role: "ANALYST",
      status: "ACTIVE",
    });
    await analyst.save();

    const viewer = new User({
      name: "Viewer User",
      email: "viewer@zorvyn.com",
      password: "viewer123",
      role: "VIEWER",
      status: "ACTIVE",
    });
    await viewer.save();

    // Categories + types
    const categories = [
      "Salary",
      "Freelance",
      "Food",
      "Rent",
      "Travel",
      "Utilities",
      "Healthcare",
    ];

    const types = ["INCOME", "EXPENSE"];

    const records = [];

    // Create 20 records
    for (let i = 0; i < 20; i++) {
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];

      const randomAmount = Math.floor(Math.random() * 49500) + 500;

      // Date within last 6 months
      const date = new Date();
      date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));

      records.push({
        userId: admin._id,
        amount: randomAmount,
        type: randomType,
        category: randomCategory,
        date,
        notes: `${randomCategory} ${randomType.toLowerCase()}`,
      });
    }

    await FinancialRecord.insertMany(records);

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();
