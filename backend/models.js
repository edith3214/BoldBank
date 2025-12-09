// backend/models.js
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
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

  // NEW profile fields (nullable to avoid migration pains)
  name: { type: DataTypes.STRING, allowNull: true },
  accountNumber: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  avatarUrl: { type: DataTypes.STRING, allowNull: true },
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

/**
 * Safe create-or-return helper.
 * Uses findOne -> findOrCreate pattern and handles race conditions.
 * If `id` is not provided a uuid will be generated.
 */
async function createUserIfNotExists({ id, email, password, role }) {
  // return if already exists
  const existing = await User.findOne({ where: { email } });
  if (existing) return existing;

  // hash password
  const hash = await bcrypt.hash(password, 10);

  try {
    const [user /*, created */] = await User.findOrCreate({
      where: { email },
      defaults: {
        id: id || uuidv4(),
        email,
        passwordHash: hash,
        role,
      },
    });
    return user;
  } catch (err) {
    // handle unique-constraint race
    if (err && err.name === "SequelizeUniqueConstraintError") {
      const u = await User.findOne({ where: { email } });
      if (u) return u;
    }
    throw err;
  }
}

// sync & seed
async function initDb() {
  try {
    console.log("DB init: attempting sequelize.authenticate()");
    await sequelize.authenticate();
    console.log("DB init: authenticate OK, now running sequelize.sync()");
  } catch (err) {
    console.error("DB init: sequelize.authenticate() FAILED:", err && err.message ? err.message : err);
    console.error("DB init: full error object:", err);
    // Rethrow — if we can't connect, fail fast so deploy logs show the connection error
    throw err;
  }

  try {
    // apply non-destructive schema changes (adds new columns if needed)
    await sequelize.sync({ alter: true });
    console.log("DB init: sequelize.sync({ alter: true }) OK");
  } catch (err) {
    console.error("DB init: sequelize.sync() FAILED:", err && err.message ? err.message : err);
    console.error("DB init: full error object:", err);
    throw err;
  }

  // Seed users — errors here won't crash the process; we'll log details so you can inspect.
  try {
    console.log("DB init: seeding default users (if missing)...");
    // Use the safer create-or-return helper without fixed ids
    try {
      await createUserIfNotExists({
        email: "santiroberto128@gmail.com",
        password: "Santi$50",
        role: "user",
      });
      console.log("DB seed: user ensured");
    } catch (err) {
      console.error("DB seed: createUserIfNotExists(user) failed:", err && err.message ? err.message : err);
    }

    try {
      await createUserIfNotExists({
        email: "admin@bank.com",
        password: "admin123",
        role: "admin",
      });
      console.log("DB seed: admin ensured");
    } catch (err) {
      console.error("DB seed: createUserIfNotExists(admin) failed:", err && err.message ? err.message : err);
    }

    console.log("DB initialized (seed attempted).");
  } catch (err) {
    // defensive: log anything unexpected
    console.error("DB init: unexpected error during seeding:", err && err.message ? err.message : err);
    console.error("DB init: full error object:", err);
  }
}

module.exports = { sequelize, User, Transaction, Message, initDb };
