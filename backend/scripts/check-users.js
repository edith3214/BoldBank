// backend/scripts/check-users.js
// Usage: from repo root -> cd backend && node scripts/check-users.js

const path = require("path");
const { sequelize, User } = require(path.join(__dirname, "..", "models"));

async function main() {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    const users = await User.findAll({ order: [["id", "ASC"]] });
    console.log(`Total users: ${users.length}\n`);

    // show first 50 rows (id + email)
    console.log("Sample rows (id, email):");
    users.slice(0, 50).forEach((u) => console.log(u.id, " | ", u.email));
    console.log("");

    // count exact-duplicate emails (case-sensitive)
    const exactCounts = {};
    for (const u of users) {
      const k = u.email === null ? "__NULL__" : String(u.email);
      exactCounts[k] = (exactCounts[k] || 0) + 1;
    }
    const exactDups = Object.entries(exactCounts).filter(([email, cnt]) => cnt > 1);
    console.log("Exact duplicate emails (case-sensitive) with count:");
    if (exactDups.length === 0) console.log("  none");
    else exactDups.forEach(([email, cnt]) => console.log(`  ${email} -> ${cnt}`));
    console.log("");

    // count case-insensitive duplicates
    const lowerCounts = {};
    for (const u of users) {
      const k = u.email === null ? "__NULL__" : String(u.email).toLowerCase();
      lowerCounts[k] = (lowerCounts[k] || 0) + 1;
    }
    const lowerDups = Object.entries(lowerCounts).filter(([email, cnt]) => cnt > 1);
    console.log("Case-insensitive duplicate emails (lowercased) with count:");
    if (lowerDups.length === 0) console.log("  none");
    else lowerDups.forEach(([email, cnt]) => console.log(`  ${email} -> ${cnt}`));
    console.log("");

    // list NULL / empty emails
    const nulls = users.filter(u => !u.email);
    console.log(`Rows with null/empty email: ${nulls.length}`);
    nulls.forEach(u => console.log(`  id=${u.id} createdAt=${u.createdAt}`));

    console.log("\nDone.");
    process.exit(0);
  } catch (err) {
    console.error("Error checking users:", err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

main();
