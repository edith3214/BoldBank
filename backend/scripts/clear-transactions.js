const { sequelize, Transaction } = require("../models");

async function clearTransactions() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB.");

    const count = await Transaction.count();
    console.log(`Found ${count} transactions. Deleting...`);

    await Transaction.destroy({
      where: {},
      truncate: true, // This ensures it clears everything, possibly resetting auto-increment if supported
    });

    console.log("All transactions cleared.");
  } catch (err) {
    console.error("Error clearing transactions:", err);
  } finally {
    await sequelize.close();
  }
}

clearTransactions();
