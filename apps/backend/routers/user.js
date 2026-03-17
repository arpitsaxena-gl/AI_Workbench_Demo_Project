const express = require("express");
const router = express.Router();
const Users = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
console.log(Users);
router.get(`/`, async (req, res) => {
  console.log("Users");
  try {
    const user = await Users.find().select("-passwordHash");
    if (user) {
      return res.send(user);
    } else {
      return res.status(500).send("error in retrieve data");
    }
  } catch (e) {
    return res.status(500).json({
      error: e,
      success: false,
    });
  }
});

router.get(`/:id`, async (req, res) => {
  console.log(Users);
  try {
    const user = await Users.findById(req.params.id).select("-passwordHash");
    if (!user) {
      return res.status(500).json({ success: false });
    }

    return res.send(user);
  } catch (e) {
    return res.status(500).json({
      error: e,
      success: false,
    });
  }
});

router.post(`/register`, async (req, res) => {
  const isAdmin = [true, "true", "1", 1, "on", "yes"].includes(req.body.isAdmin);
  const user = new Users({
    name: req.body.name,
    userId: req.body.userId,
    passwordHash: bcrypt.hashSync(req.body.password, 11),
    Address1: req.body.address1,
    Address2: req.body.address2,
    PinCode: req.body.pincode,
    phNumber: req.body.mobileNumber,
    isAdmin,
  });
  let userId = req.body.userId;
  const usernameExists = await Users.findOne({ userId });
  console.log("username exist " + usernameExists);
  if (usernameExists) {
    return res.status(400).json({
      error: "Username and email already exists",
      success: false,
    });
  }
  user
    .save()
    .then((createProduct) => {
      return res.status(201).json(createProduct);
    })
    .catch((e) => {
      return res.status(500).json({
        error: e,
        success: false,
      });
    });
});

router.post("/validateLogin", async (req, res) => {
  const user = await Users.findOne({ userId: req.body.email });
  const secret = process.env.secret;
  if (!user) {
    return res.status(400).send("user not found");
  }

  if (
    user &&
    req.body.password &&
    bcrypt.compareSync(req.body.password, user.passwordHash)
  ) {
    console.log(user.isAdmin);
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "1d" }
    );
    res.status(200).send({ user: user.userId, token: token, admin: user.isAdmin });
  } else {
    res.status(400).send("password is incorrect");
  }
});

router.get("/get/count", async (req, res) => {
  const userCount = await Users.countDocuments({});
  if (!userCount) {
    res.status(500).json({ success: false });
  }
  return res.send({ userCount: userCount });
});

module.exports = router;
