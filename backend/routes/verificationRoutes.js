import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  requestVerification,
  getAllVerifications,
  getVerification,
  reviewVerification,
  getMyVerifications,
} from "../controllers/verificationController.js";

const router = express.Router();

// Student requests verification
router.post("/request", isAuthenticated, requestVerification);

router.get("/review", isAuthenticated, getAllVerifications);

router.get("/review/:id", isAuthenticated, getVerification);

// Verifier reviews (approve/reject)
router.post("/review/:id", isAuthenticated, reviewVerification);

// Student fetches their verifications (Verification Index)
router.get("/mine", isAuthenticated, getMyVerifications);

export default router;
