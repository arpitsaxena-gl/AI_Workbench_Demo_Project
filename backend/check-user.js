require("dotenv").config({ path: "./env.txt" });
const mongoose = require("mongoose");
const Users = require("./model/user");

async function checkUser() {
  try {
    await mongoose.connect(process.env.connectionString);
    const user = await Users.findOne({ userId: "john@example.com" });
    if (!user) {
      console.log("User john@example.com NOT FOUND in database");
      return;
    }
    const doc = user.toObject();
    console.log("--- john@example.com in MongoDB ---");
    console.log(JSON.stringify(doc, null, 2));
    console.log("\n--- isAdmin verification ---");
    console.log("isAdmin value:", doc.isAdmin);
    console.log("isAdmin type:", typeof doc.isAdmin);
    console.log("Statement 'isAdmin is false':", doc.isAdmin === false ? "CORRECT" : "INCORRECT");
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkUser();
