import express from "express";
import { loginUser, registerUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser); // POST /api/user/register
userRouter.post("/login", loginUser);       // POST /api/user/login

export default userRouter;
