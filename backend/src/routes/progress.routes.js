import express from "express"
import { getProgress } from "../services/video.service.js"
import { requireAuth } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/:userId", (req, res) => {
  try {

const {userId} = req.params

console.log("progress requested", userId)

const progress = getProgress(userId)

console.log("[PROGRESS RESPONSE]", progress)

res.json(progress)
} catch (err) {
  console.log("progress route error", err.code || err.message)
  res.json({ percent: 0, message: "error" })
}
})

export default router