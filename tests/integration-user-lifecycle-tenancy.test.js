process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_min_32_characters";

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.mock("../src/middlewares/auth.middleware", () => {
  return (req, res, next) => {
    req.user = {
      _id: req.headers["x-test-user-id"] || "507f1f77bcf86cd799439011",
      role: req.headers["x-test-role"] || "VIEWER",
      status: req.headers["x-test-status"] || "ACTIVE",
    };
    next();
  };
});

const app = require("../src/app");
const User = require("../src/models/user.model");
const FinancialRecord = require("../src/models/record.model");

describe("Integration: user lifecycle and tenancy", () => {
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

  test("ADMIN can create user and then deactivate user", async () => {
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "Password123",
      role: "ADMIN",
      status: "ACTIVE",
    });

    const createResponse = await request(app)
      .post("/api/users")
      .set("x-test-role", "ADMIN")
      .set("x-test-user-id", String(admin._id))
      .send({
        name: "Viewer One",
        email: "viewer1@example.com",
        password: "Password123",
        role: "VIEWER",
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.user.email).toBe("viewer1@example.com");
    expect(createResponse.body.user.password).toBeUndefined();

    const createdUserId = createResponse.body.user.id || createResponse.body.user._id;

    const deactivateResponse = await request(app)
      .delete(`/api/users/${createdUserId}`)
      .set("x-test-role", "ADMIN")
      .set("x-test-user-id", String(admin._id));

    expect(deactivateResponse.status).toBe(200);
    expect(deactivateResponse.body.success).toBe(true);
    expect(deactivateResponse.body.user.status).toBe("INACTIVE");

    const persisted = await User.findById(createdUserId).lean();
    expect(persisted.status).toBe("INACTIVE");
  });

  test("cannot deactivate the last ACTIVE ADMIN", async () => {
    const soleAdmin = await User.create({
      name: "Sole Admin",
      email: "sole-admin@example.com",
      password: "Password123",
      role: "ADMIN",
      status: "ACTIVE",
    });

    const response = await request(app)
      .patch(`/api/users/${soleAdmin._id}/status`)
      .set("x-test-role", "ADMIN")
      .set("x-test-user-id", "507f1f77bcf86cd799439099")
      .send({ status: "INACTIVE" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/last ACTIVE ADMIN/i);
  });

  test("VIEWER and ANALYST record reads are global", async () => {
    const viewer = await User.create({
      name: "Viewer",
      email: "viewer@example.com",
      password: "Password123",
      role: "VIEWER",
      status: "ACTIVE",
    });

    const analyst = await User.create({
      name: "Analyst",
      email: "analyst@example.com",
      password: "Password123",
      role: "ANALYST",
      status: "ACTIVE",
    });

    const otherViewer = await User.create({
      name: "Other Viewer",
      email: "other-viewer@example.com",
      password: "Password123",
      role: "VIEWER",
      status: "ACTIVE",
    });

    await FinancialRecord.create([
      {
        userId: viewer._id,
        amount: 100,
        type: "INCOME",
        category: "Salary",
        date: new Date("2026-01-02T00:00:00.000Z"),
        notes: "viewer income",
      },
      {
        userId: otherViewer._id,
        amount: 40,
        type: "EXPENSE",
        category: "Food",
        date: new Date("2026-01-03T00:00:00.000Z"),
        notes: "other expense",
      },
    ]);

    const viewerResponse = await request(app)
      .get("/api/records")
      .set("x-test-role", "VIEWER")
      .set("x-test-user-id", String(viewer._id));

    expect(viewerResponse.status).toBe(200);
    expect(viewerResponse.body.success).toBe(true);
    expect(viewerResponse.body.records).toHaveLength(2);

    const analystResponse = await request(app)
      .get("/api/records")
      .set("x-test-role", "ANALYST")
      .set("x-test-user-id", String(analyst._id));

    expect(analystResponse.status).toBe(200);
    expect(analystResponse.body.success).toBe(true);
    expect(analystResponse.body.records).toHaveLength(2);
  });
});
