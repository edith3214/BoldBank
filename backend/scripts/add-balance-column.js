// backend/scripts/add-balance-column.js
// Usage: cd backend && node scripts/add-balance-column.js

const path = require("path");

// models.js is at backend/models.js
const { sequelize, User } = require(path.join(__dirname, "..", "models"));

async function up() {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    const qi = sequelize.getQueryInterface();

    // 1) Add column if it doesn't exist
    const tableName = (typeof User.getTableName === "function") ? User.getTableName() : "Users";
    const describe = await qi.describeTable(tableName).catch(() => null);
    const columnExists = describe ? !!describe.balance : false;

    if (!columnExists) {
      console.log("Adding 'balance' column to", tableName);
      await qi.addColumn(
        tableName,
        "balance",
        {
          type: sequelize.Sequelize.DOUBLE,
          allowNull: false,
          defaultValue: 8157450.47,
        }
      );
      console.log("'balance' column added.");
    } else {
      console.log("'balance' column already exists — skipping add.");
    }

    // 2) Backfill any NULLs (for safety)
    console.log("Backfilling NULL balances to default (8157450.47) where needed...");
    await User.update(
      { balance: 8157450.47 },
      { where: { balance: null } }
    );
    console.log("Backfill complete.");

    process.exit(0);
  } catch (err) {
    console.error("Script failed:", err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

up();