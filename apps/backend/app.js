const express = require("express");
const app = express();
const morgan = require("morgan");
const responseTime = require("response-time");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require("./helpers/jwt");
const errorhandler = require("./helpers/error-handler");
// load environment variables from env.txt (rename to .env or change path in production)
require('dotenv').config({ path: './env.txt' });

const api = process.env.API_URL;
const productRouter = require("./routers/product");
const categoryRouter = require("./routers/category");
const userRouter = require("./routers/user");
const orderRouter = require("./routers/order");

//middleware
app.use(responseTime());
app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use(errorhandler);

app.use(`${api}/product`, productRouter);
app.use(`${api}/category`, categoryRouter);
app.use(`${api}/user`, userRouter);
app.use(`${api}/order`, orderRouter);

mongoose
  .connect(process.env.connectionString)
  .then(() => {
    console.info("Database connected successfully");
  })
  .catch((e) => {
    console.error("Database connection failed:", e);
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.info(`server is running on port ${port}`);
});
