const { sequelize, User } = require('../models');
const bcrypt = require('bcrypt');

async function run() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Connected.");

    const email = "santiroberto128@gmail.com";
    const newPassword = "Santi$50";

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.error(`User with email ${email} not found!`);
      process.exit(1);
    }

    console.log(`Found user: ${user.email}`);

    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    await user.save();
    console.log(`Password for ${email} updated successfully to ${newPassword}`);

  } catch (error) {
    console.error("Error updating password:", error);
  }
}

run();
