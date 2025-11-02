// backend/models.js
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

// Use DATABASE_URL env var. Example Postgres URL:
// postgres://user:pass@host:port/dbname
const DATABASE_URL = process.env.DATABASE_URL || "sqlite:./dev.db";

const isPostgres = DATABASE_URL.startsWith("postgres");
const sequelize = new Sequelize(DATABASE_URL, {
  logging: false,
  dialect: isPostgres ? "postgres" : undefined,
  // If you're connecting to Postgres that requires SSL (many managed DBs do),
  // set DB_SSL=true in env (we'll tell you to add this in Render).
  dialectOptions: isPostgres
    ? process.env.DB_SSL === "true"
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {}
    : undefined,
});

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
  await createUserIfNotExists({ id: "u1", email: "user@bank.com", password: "user123", role: "user" });
  await createUserIfNotExists({ id: "a1", email: "admin@bank.com", password: "admin123", role: "admin" });

  console.log("DB initialized and default users ensured.");
}

module.exports = { sequelize, User, Transaction, Message, initDb };
