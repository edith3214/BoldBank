// backend/scripts/fix-user-emails.js
// Usage: from repo root -> cd backend && node scripts/fix-user-emails.js

const path = require("path");
const { sequelize, User } = require(path.join(__dirname, "..", "models"));

async function main() {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    const users = await User.findAll({ order: [["id", "ASC"]] });
    console.log(`Found ${users.length} users.`);

    const emailMap = new Map();
    const toUpdate = [];

    for (const u of users) {
      const id = u.id;
      let email = u.email;

      // if missing email, assign placeholder
      if (!email) {
        const placeholder = `user-${id}@local.invalid`;
        console.log(`User id=${id} has null/empty email -> assigning ${placeholder}`);
        u.email = placeholder;
        toUpdate.push(u);
        emailMap.set(u.email, (emailMap.get(u.email) || 0) + 1);
        continue;
      }

      // normalize duplicates (lowercase)
      const key = String(email).toLowerCase();
      if (!emailMap.has(key)) {
        emailMap.set(key, 1);
      } else {
        // duplicate seen: change this user's email to unique variant
        const newEmail = `${email.split("@")[0]}+${id}@${(email.split("@")[1] || "local.invalid")}`;
        console.log(`Duplicate email "${email}" for id=${id} -> renaming to ${newEmail}`);
        u.email = newEmail;
        toUpdate.push(u);
        emailMap.set(key, emailMap.get(key) + 1);
      }
    }

    if (toUpdate.length === 0) {
      console.log("No email fixes required.");
      process.exit(0);
    }

    // Apply updates inside a transaction
    await sequelize.transaction(async (t) => {
      for (const u of toUpdate) {
        await User.update(
          { email: u.email },
          { where: { id: u.id }, transaction: t }
        );
      }
    });

    console.log(`Applied ${toUpdate.length} updates.`);
    process.exit(0);
  } catch (err) {
    console.error("Error fixing user emails:", err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

main();