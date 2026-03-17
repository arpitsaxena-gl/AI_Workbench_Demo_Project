const mongoose = require("mongoose");
const productSchema = mongoose.Schema({
  name: String,
  isAdmin: { type: Boolean, default: false },
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  Address1: String,
  Address2: String,
  PinCode: Number,
  phNumber: Number,
});
const Users = mongoose.model("users", productSchema);
module.exports = Users;
