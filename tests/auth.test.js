process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_min_32_characters";

const request = require("supertest");
const AppError = require("../src/utils/AppError");

jest.mock("../src/services/auth.service", () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
}));

const authService = require("../src/services/auth.service");
const app = require("../src/app");

describe("Auth API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("successful login returns token", async () => {
    authService.loginUser.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      name: "Test User",
      email: "test@zorvyn.com",
      role: "VIEWER",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "test@zorvyn.com",
      password: "validPass123",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user).toMatchObject({
      name: "Test User",
      email: "test@zorvyn.com",
      role: "VIEWER",
    });
    expect(typeof response.body.token).toBe("string");
    expect(response.body.token.length).toBeGreaterThan(10);
  });

  test("invalid login returns error", async () => {
    authService.loginUser.mockRejectedValue(new AppError(401, "Invalid credentials"));

    const response = await request(app).post("/api/auth/login").send({
      email: "test@zorvyn.com",
      password: "wrongPass123",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid credentials");
  });
});
