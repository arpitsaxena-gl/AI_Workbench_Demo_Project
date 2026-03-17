require("dotenv").config({ path: "./env.txt" });
const mongoose = require("mongoose");
const Users = require("./model/user");

async function fixAdminUser() {
  try {
    await mongoose.connect(process.env.connectionString);
    const result = await Users.updateOne(
      { userId: "john@example.com" },
      { $set: { isAdmin: true } }
    );
    if (result.matchedCount === 0) {
      console.info("User john@example.com not found");
      return;
    }
    console.info("Updated john@example.com to isAdmin: true");
    const user = await Users.findOne({ userId: "john@example.com" }).select("-passwordHash");
    console.info("Verified:", JSON.stringify(user, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixAdminUser();
