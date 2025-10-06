import express from "express";
import { runMasterAgent } from "./chatRoutes.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const response = await runMasterAgent(message);
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Something went wrong on the server." });
  }
});

export default router;
