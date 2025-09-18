import express from "express";
import { login, logout, register, me } from "../controllers/user.controller.js";
import { singleUpload } from "../middlewares/multer.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
 
const router = express.Router();
console.log("✅ Auth routes loaded");
router.route("/register").post(singleUpload,register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/me").get(isAuthenticated, me);


export default router;

