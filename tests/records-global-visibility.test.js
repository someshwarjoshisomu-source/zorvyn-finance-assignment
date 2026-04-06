process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_min_32_characters";

jest.mock("../src/models/record.model", () => ({
  find: jest.fn(() => {
    const chain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue([]),
    };
    return chain;
  }),
  countDocuments: jest.fn().mockResolvedValue(0),
  findOne: jest.fn(),
}));

const FinancialRecord = require("../src/models/record.model");
const recordService = require("../src/services/record.service");

describe("Records global visibility", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("VIEWER getRecords is global read-only", async () => {
    await recordService.getRecords(
      { _id: "507f1f77bcf86cd799439011", role: "VIEWER" },
      {},
      1,
      10,
    );

    expect(FinancialRecord.find).toHaveBeenCalledTimes(1);
    const query = FinancialRecord.find.mock.calls[0][0];

    expect(query).toMatchObject({ isDeleted: false });
    expect(query.userId).toBeUndefined();
  });

  test("ANALYST getRecords is global", async () => {
    await recordService.getRecords(
      { _id: "507f1f77bcf86cd799439012", role: "ANALYST" },
      {},
      1,
      10,
    );

    expect(FinancialRecord.find).toHaveBeenCalledTimes(1);
    const query = FinancialRecord.find.mock.calls[0][0];

    expect(query).toMatchObject({ isDeleted: false });
    expect(query.userId).toBeUndefined();
  });

  test("getRecords returns totalPages as 1 for empty results", async () => {
    const result = await recordService.getRecords(
      { _id: "507f1f77bcf86cd799439011", role: "VIEWER" },
      {},
      1,
      10,
    );

    expect(result.totalCount).toBe(0);
    expect(result.totalPages).toBe(1);
    expect(result.currentPage).toBe(1);
    expect(Array.isArray(result.records)).toBe(true);
  });
});
