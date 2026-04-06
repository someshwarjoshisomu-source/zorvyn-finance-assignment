const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("./src/models/user.model");
const FinancialRecord = require("./src/models/record.model");

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect DB
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing records only (keep existing users/roles for login testing)
    await FinancialRecord.deleteMany();

    // Ensure an ADMIN user exists to own seeded records
    let admin = await User.findOne({ email: "admin@zorvyn.com" });

    if (!admin) {
      admin = new User({
        name: "Admin User",
        email: "admin@zorvyn.com",
        password: "admin123",
        role: "ADMIN",
        status: "ACTIVE",
      });
      await admin.save();
    } else {
      admin.name = "Admin User";
      admin.role = "ADMIN";
      admin.status = "ACTIVE";
      await admin.save();
    }

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

    // Create 30 records, assign all to admin
    for (let i = 0; i < 30; i++) {
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];
      const randomAmount = Math.floor(Math.random() * 49500) + 500;
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
