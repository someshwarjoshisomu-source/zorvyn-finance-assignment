process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_min_32_characters";

jest.mock("../src/models/record.model", () => ({
  aggregate: jest.fn(),
}));

const FinancialRecord = require("../src/models/record.model");
const dashboardService = require("../src/services/dashboard.service");

describe("Dashboard last7days service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("returns a complete 7-day series with zero-filled gaps", async () => {
    FinancialRecord.aggregate.mockResolvedValue([
      {
        year: 2026,
        month: 4,
        day: 3,
        totalIncome: 100,
        totalExpense: 50,
      },
      {
        year: 2026,
        month: 4,
        day: 6,
        totalIncome: 500,
        totalExpense: 250,
      },
    ]);

    const result = await dashboardService.getLast7DaysTrends({
      _id: "507f1f77bcf86cd799439011",
      role: "VIEWER",
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(7);
    expect(result.every((row) => Number.isFinite(row.totalIncome))).toBe(true);
    expect(result.every((row) => Number.isFinite(row.totalExpense))).toBe(true);

    const nonZeroDays = result.filter(
      (row) => Number(row.totalIncome) > 0 || Number(row.totalExpense) > 0,
    );
    expect(nonZeroDays.length).toBe(2);

    const hasZeroFilledDay = result.some(
      (row) => Number(row.totalIncome) === 0 && Number(row.totalExpense) === 0,
    );
    expect(hasZeroFilledDay).toBe(true);
  });

  test("uses global read match in aggregation", async () => {
    FinancialRecord.aggregate.mockResolvedValue([]);

    await dashboardService.getLast7DaysTrends({
      _id: "507f1f77bcf86cd799439011",
      role: "VIEWER",
    });

    const pipeline = FinancialRecord.aggregate.mock.calls[0][0];
    const matchStage = pipeline.find((stage) => stage.$match);

    expect(matchStage.$match.isDeleted).toBe(false);
    expect(matchStage.$match.userId).toBeUndefined();
    expect(matchStage.$match.date).toBeDefined();
    expect(matchStage.$match.date.$gte).toBeInstanceOf(Date);
    expect(matchStage.$match.date.$lte).toBeInstanceOf(Date);
  });
});
