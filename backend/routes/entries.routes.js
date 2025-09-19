
import express from "express";
import {
  createEntry,
  listEntries,
  getEntryById,
  updateEntry,
  getEntries,
  softDeleteEntry,
} from "../controllers/EntryController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import multer from "multer";

const router = express.Router();

// ✅ Use memoryStorage so we can save fileData into DB
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/entries",
  isAuthenticated,
  (req, res, next) => {
    // If Content-Type is multipart, let Multer handle it
    if (req.headers["content-type"]?.startsWith("multipart/form-data")) {
      upload.single("file")(req, res, next);
    } else {
      // Else skip Multer (JSON body)
      next();
    }
  },
  createEntry
);

router.route("/listentries").get(isAuthenticated, listEntries);
router.route("/getentries").get(isAuthenticated, getEntries);
router.route("/getentries/:id").get(isAuthenticated, getEntryById);
router.route("/updateentries/:id").patch(isAuthenticated, updateEntry);
router.route("/delelaentries/:id").delete(isAuthenticated, softDeleteEntry);

export default router;
