process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_min_32_characters";

const request = require("supertest");

jest.mock("../src/middlewares/auth.middleware", () => {
  return (req, res, next) => {
    req.user = {
      _id: "507f1f77bcf86cd799439011",
      role: req.headers["x-test-role"] || "ANALYST",
      status: "ACTIVE",
    };
    next();
  };
});

jest.mock("../src/services/dashboard.service", () => ({
  getSummary: jest.fn(),
  getCategoryTotals: jest.fn(),
  getMonthlyTrends: jest.fn(),
  getWeeklyTrends: jest.fn(),
  getRecentActivity: jest.fn(),
}));

const dashboardService = require("../src/services/dashboard.service");
const app = require("../src/app");

describe("Dashboard Weekly Trends API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("ANALYST can fetch weekly trends", async () => {
    dashboardService.getWeeklyTrends.mockResolvedValue([
      {
        isoYear: 2026,
        isoWeek: 14,
        totalIncome: 10000,
        totalExpense: 2500,
      },
    ]);

    const response = await request(app)
      .get("/api/dashboard/trends/weekly")
      .set("x-test-role", "ANALYST");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data[0]).toMatchObject({
      isoYear: 2026,
      isoWeek: 14,
      totalIncome: 10000,
      totalExpense: 2500,
    });
    expect(dashboardService.getWeeklyTrends).toHaveBeenCalledTimes(1);
  });

  test("VIEWER cannot fetch weekly trends", async () => {
    const response = await request(app)
      .get("/api/dashboard/trends/weekly")
      .set("x-test-role", "VIEWER");

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Not authorized");
  });
});
