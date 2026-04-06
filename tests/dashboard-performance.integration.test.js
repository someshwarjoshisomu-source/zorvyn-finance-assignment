process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_min_32_characters";

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.mock("../src/middlewares/auth.middleware", () => {
  return (req, res, next) => {
    req.user = {
      _id: req.headers["x-test-user-id"] || "507f1f77bcf86cd799439011",
      role: req.headers["x-test-role"] || "ANALYST",
      status: "ACTIVE",
    };
    next();
  };
});

const app = require("../src/app");
const User = require("../src/models/user.model");
const FinancialRecord = require("../src/models/record.model");

describe("Performance gate: dashboard analytics", () => {
  let mongod;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  });

  afterEach(async () => {
    await Promise.all([User.deleteMany({}), FinancialRecord.deleteMany({})]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  });

  test("summary, categories, trends, and weekly endpoints stay within response budget", async () => {
    const analyst = await User.create({
      name: "Analyst Perf",
      email: "analyst-perf@example.com",
      password: "Password123",
      role: "ANALYST",
      status: "ACTIVE",
    });

    const baseDate = new Date("2026-01-01T00:00:00.000Z");
    const records = [];

    for (let i = 0; i < 300; i += 1) {
      const d = new Date(baseDate);
      d.setUTCDate(baseDate.getUTCDate() + (i % 60));

      records.push({
        userId: analyst._id,
        amount: (i + 1) * 2,
        type: i % 2 === 0 ? "INCOME" : "EXPENSE",
        category: i % 3 === 0 ? "Salary" : "Food",
        date: d,
        notes: `perf-${i}`,
      });
    }

    await FinancialRecord.insertMany(records);

    const headers = {
      "x-test-role": "ANALYST",
      "x-test-user-id": String(analyst._id),
    };

    const budgetMs = 1500;
    const endpoints = [
      "/api/dashboard/summary",
      "/api/dashboard/categories",
      "/api/dashboard/trends",
      "/api/dashboard/trends/weekly",
      "/api/dashboard/trends/last7days",
    ];

    for (const endpoint of endpoints) {
      const started = Date.now();
      const response = await request(app).get(endpoint).set(headers);
      const elapsed = Date.now() - started;

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(elapsed).toBeLessThanOrEqual(budgetMs);
    }
  });
});
