const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");
const validateEnvironment = require("./utils/env-validator");

dotenv.config();

// Validate environment variables
validateEnvironment();

const PORT = process.env.PORT || 3000;

const bootstrap = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      const runtime = app.locals.runtime || {};
      console.log(`✅ Server running on port ${PORT}`);
      console.log(
        `ℹ️ Runtime stamp: version=${runtime.appVersion || "unknown"} source=${runtime.sourceRevision || "unknown"} bootId=${runtime.bootId || "unknown"}`,
      );
    });
  } catch (error) {
    console.error("❌ Startup failed:", error.message);
    process.exit(1);
  }
};

bootstrap();
