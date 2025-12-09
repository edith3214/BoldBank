const { sequelize, User } = require('../models');
const bcrypt = require('bcrypt');

async function verify() {
  try {
    await sequelize.authenticate();
    const email = "santiroberto128@gmail.com";
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.error("User not found during verification!");
      process.exit(1);
    }

    console.log(`Verifying password for ${email}...`);

    // Check old password
    const oldPass = "Robert$321";
    const oldMatch = await bcrypt.compare(oldPass, user.passwordHash);
    if (oldMatch) {
      console.error("FAIL: Old password Robert$321 STILL WORKS!");
    } else {
      console.log("PASS: Old password Robert$321 does not work.");
    }

    // Check new password
    const newPass = "Santi$50";
    const newMatch = await bcrypt.compare(newPass, user.passwordHash);
    if (newMatch) {
      console.log("PASS: New password Santi$50 works.");
    } else {
      console.error("FAIL: New password Santi$50 DOES NOT WORK!");
    }

  } catch (err) {
    console.error("Verification error:", err);
  }
}

verify();
