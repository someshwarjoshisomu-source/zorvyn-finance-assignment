module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 20000,
  clearMocks: true,
  detectOpenHandles: true,
};
