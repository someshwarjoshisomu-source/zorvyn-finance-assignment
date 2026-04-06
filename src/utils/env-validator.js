const validateEnvironment = () => {
  const requiredVars = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
  const missing = [];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log(`✅ Environment validation passed`);
};

module.exports = validateEnvironment;
