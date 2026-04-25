const app = require("../app");
const { connectDB } = require("../config/db");
const config = require("../config/env");

const startServer = async () => {
  try {
    await connectDB();

    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
    });
  } catch (err) {
    console.error("❌ Server failed:", err);
  }
};

startServer();