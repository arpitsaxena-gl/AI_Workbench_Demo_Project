const express = require("express");
const router = express.Router();
const Orders = require("../model/order");
const OrderItem = require("../model/order-item");
console.log(Orders);
router.get(`/`, async (req, res) => {
  console.log(Orders);
  const order = await Orders.find().populate("user");
  return res.send(order);
});

router.get(`/:id`, async (req, res) => {
  console.log(Orders);
  const order = await Orders.findById(req.params.id)
    .populate("user")
    .populate("orderItems");
  return res.send(order);
});

router.post(`/`, async (req, res) => {
  console.log("req  ** " + req);
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );
  const orderItemsIdsResolved = await orderItemsIds;
  const totalPrice = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemsIds) => {
      const orderItem = await OrderItem.findById(orderItemsIds).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );
  console.log(totalPrice);
  const TotalPrice = totalPrice.reduce((a, b) => a + b, 0);
  const order = new Orders({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: TotalPrice,
    user: req.body.user,
  });

  order
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
  // order = await order.save();
  // if(!order)
  // return res.status(400).send('the order cannot be created');

  // res.send(order);
});

router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );
  if (!order) {
    res
      .status(500)
      .json({ success: false, message: "no record found for orders" });
  }
  res
    .status(200)
    .json({ success: false, message: "no record found ", data: order });
});

router.delete(`/:id`, (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res.status(200).json({ success: true, message: "order deletd" });
      } else {
        return res.status(404).json({ success: false, message: "not found" });
      }
    })
    .catch((err) => {
      return res.status(404).json({ success: false });
    });
});

router.get("/get/totalSales", async (req, res) => {
  const totalSales = await Orders.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
  ]);
  if (!totalSales) {
    return res.status(400).send("The order saled cannot be generated");
  }
  return res.send({ totalsales: totalSales.pop().totalSales });
});

router.get("/get/count", async (req, res) => {
  const orderCount = await Orders.countDocuments({});
  if (!orderCount) {
    res.status(500).json({ success: false });
  }
  return res.send({ orderCount: orderCount });
});

router.get("/get/userorder/:userid", async (req, res) => {
  const orderList = await Orders.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  return res.send(orderList);
});

module.exports = router;
