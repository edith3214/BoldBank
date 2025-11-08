// backend/models.js
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

// Use DATABASE_URL env var. Example Postgres URL:
// postgres://user:pass@host:port/dbname
const DATABASE_URL = process.env.DATABASE_URL || "sqlite:./dev.db";

const isPostgres = typeof DATABASE_URL === "string" && DATABASE_URL.startsWith("postgres");

// If using sqlite, put the DB file in backend/data/dev.db (create dir if needed)
// You can override with SQLITE_FILE env var if you want
let sequelize;
if (isPostgres) {
  sequelize = new Sequelize(DATABASE_URL, {
    logging: false,
    dialect: "postgres",
    dialectOptions: process.env.DB_SSL === "true" ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  });
} else {
  const defaultSqlite = process.env.SQLITE_FILE || "./data/dev.db";
  const storagePath = path.resolve(__dirname, defaultSqlite);
  const storageDir = path.dirname(storagePath);
  try {
    if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
  } catch (err) {
    console.error("Failed to ensure sqlite storage directory:", storageDir, err && err.message ? err.message : err);
    // continue; Sequelize will show the error if it still can't open/create the file
  }

  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: storagePath,
    logging: false,
  });
}

// Models
const User = sequelize.define("User", {
  id: { type: DataTypes.STRING, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false }, // "user" or "admin"
});

const Transaction = sequelize.define("Transaction", {
  id: { type: DataTypes.STRING, primaryKey: true },
  ownerEmail: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: "Pending" },
  createdAtMs: { type: DataTypes.BIGINT, allowNull: false },
  approvedBy: { type: DataTypes.STRING, allowNull: true },
  declinedBy: { type: DataTypes.STRING, allowNull: true },
});

// add after Transaction definition
const Message = sequelize.define("Message", {
  id: { type: DataTypes.STRING, primaryKey: true },
  fromEmail: { type: DataTypes.STRING, allowNull: false },
  toEmail: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  createdAtMs: { type: DataTypes.BIGINT, allowNull: false },
  read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
});

// helper to create user with hashed password
async function createUserIfNotExists({ id, email, password, role }) {
  const u = await User.findOne({ where: { email } });
  if (u) return u;
  const hash = await bcrypt.hash(password, 10);
  return User.create({ id, email, passwordHash: hash, role });
}

// sync & seed
async function initDb() {
  await sequelize.authenticate();
  await sequelize.sync();

  // seed default users if not present
  await createUserIfNotExists({ id: "u1", email: "santiroberto128@gmail.com", password: "Robert$321", role: "user" });
  await createUserIfNotExists({ id: "a1", email: "admin@bank.com", password: "admin123", role: "admin" });

  console.log("DB initialized and default users ensured.");
}

module.exports = { sequelize, User, Transaction, Message, initDb };
