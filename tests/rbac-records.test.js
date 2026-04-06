process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_min_32_characters";

const request = require("supertest");

jest.mock("../src/middlewares/auth.middleware", () => {
  return (req, res, next) => {
    req.user = {
      _id: "507f1f77bcf86cd799439011",
      role: req.headers["x-test-role"] || "VIEWER",
      status: "ACTIVE",
    };
    next();
  };
});

const app = require("../src/app");

describe("Records RBAC", () => {
  test("ANALYST cannot create a record", async () => {
    const response = await request(app)
      .post("/api/records")
      .set("x-test-role", "ANALYST")
      .send({
        amount: 1000,
        type: "INCOME",
        category: "Salary",
        date: "2026-04-01",
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Not authorized");
  });

  test("VIEWER cannot delete a record", async () => {
    const response = await request(app)
      .delete("/api/records/507f1f77bcf86cd799439012")
      .set("x-test-role", "VIEWER");

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Not authorized");
  });

  test("invalid record id returns validation error", async () => {
    const response = await request(app)
      .get("/api/records/not-a-valid-id")
      .set("x-test-role", "ADMIN");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
    expect(Array.isArray(response.body.errors)).toBe(true);
  });
});
