const { sequelize, Transaction } = require("../models");

async function countTransactions() {
  try {
    await sequelize.authenticate();
    const count = await Transaction.count();
    console.log(`Transaction count: ${count}`);
  } catch (err) {
    console.error("Error counting transactions:", err);
  } finally {
    await sequelize.close();
  }
}

countTransactions();
