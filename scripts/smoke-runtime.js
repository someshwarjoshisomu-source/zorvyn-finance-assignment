/* eslint-disable no-console */
const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const EXPECT_SOURCE_REV = process.env.EXPECT_SOURCE_REV || "";
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS || 20000);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForHealth() {
  const deadline = Date.now() + TIMEOUT_MS;
  let lastError = "";

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (!response.ok) {
        lastError = `health status ${response.status}`;
        await sleep(500);
        continue;
      }
      const payload = await response.json();
      if (!payload.healthy) {
        lastError = "health payload indicates unhealthy";
        await sleep(500);
        continue;
      }
      return payload;
    } catch (error) {
      lastError = error.message;
      await sleep(500);
    }
  }

  throw new Error(`Health check timeout: ${lastError}`);
}

async function validateVersion() {
  const response = await fetch(`${BASE_URL}/api/version`);
  if (!response.ok) {
    throw new Error(`Version endpoint returned ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.version || !payload.bootId || !payload.sourceRevision) {
    throw new Error("Version payload missing required fields (version/bootId/sourceRevision)");
  }

  if (EXPECT_SOURCE_REV && payload.sourceRevision !== EXPECT_SOURCE_REV) {
    throw new Error(
      `Source revision mismatch. expected=${EXPECT_SOURCE_REV} actual=${payload.sourceRevision}`,
    );
  }

  return payload;
}

(async () => {
  console.log("BASE_URL:", BASE_URL);
  const health = await waitForHealth();
  const version = await validateVersion();

  console.log("SMOKE_OK");
  console.log(`health.bootId=${health.bootId}`);
  console.log(`version=${version.version}`);
  console.log(`sourceRevision=${version.sourceRevision}`);
})().catch((error) => {
  console.error("SMOKE_FAIL");
  console.error(error.message);
  process.exit(1);
});
