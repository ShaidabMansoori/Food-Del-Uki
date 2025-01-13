import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// Config variables
const currency = "INR";
const deliveryCharge = 50;
const frontend_URL = "http://localhost:5173";

// Placing User Order for Frontend using Razorpay
const placeOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      amount,
      firstName,
      lastName,
      email,
      phone,
      street,
      landmark,
    } = req.body;

    // Validate required fields
    if (
      !userId ||
      !items ||
      !amount ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !street ||
      !landmark
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Prepare address object
    const address = {
      firstName,
      lastName,
      email,
      phone,
      street,
      landmark,
    };

    // Create a new order
    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      payment: false, // Default to unpaid
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Calculate total amount including delivery charges
    const totalAmount = amount + deliveryCharge;

    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: totalAmount * 100, // Amount in paise
      currency,
      receipt: newOrder._id.toString(), // Use order ID as receipt
    });

    res.json({
      success: true,
      orderId: newOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error while placing order" });
  }
};

// Placing User Order with Cash on Delivery (COD)
const placeOrderCod = async (req, res) => {
  try {
    const {
      userId,
      items,
      amount,
      firstName,
      lastName,
      email,
      phone,
      street,
      landmark,
    } = req.body;

    // Validate required fields
    if (
      !userId ||
      !items ||
      !amount ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !street ||
      !landmark
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Prepare address object
    const address = {
      firstName,
      lastName,
      email,
      phone,
      street,
      landmark,
    };

    // Create a new order
    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      payment: true, // COD orders are marked as paid
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error while placing order" });
  }
};

// List Orders for Admin Panel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

// Fetch User Orders for Frontend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching user orders" });
  }
};

// Update Order Status
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error updating status" });
  }
};

// Verify Razorpay Payment
const verifyOrder = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } =
    req.body;
  try {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = require("crypto")
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpaySignature) {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({
        success: true,
        message: "Payment verified and order marked as paid",
      });
    } else {
      res.json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error during payment verification" });
  }
};

export {
  placeOrder,
  placeOrderCod,
  listOrders,
  userOrders,
  updateStatus,
  verifyOrder,
};
