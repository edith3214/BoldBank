const { initDb, sequelize } = require('../models');

async function testInit() {
  try {
    console.log("Running initDb()...");
    await initDb();
    console.log("initDb() completed successfully.");

    // Can optionally check if the process exits cleanly
  } catch (err) {
    console.error("initDb failed found:", err);
    process.exit(1);
  }
}

testInit();
