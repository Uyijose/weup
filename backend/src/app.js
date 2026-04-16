import "./utils/env.js";
import express from "express";
import cors from "cors";

import uploadRoutes from "./routes/upload.routes.js";
import videoRoutes from "./routes/video.routes.js";
import authRoutes from "./routes/auth.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import deleteRoutes from "./routes/delete.routes.js";
import commentsRoutes from "./routes/comments/comments.routes.js";
import likesRoutes from "./routes/likes/likes.routes.js";
import postsRoutes from "./routes/posts/posts.routes.js";
import reportsRoutes from "./routes/reports/reports.routes.js";
import reportsAdminRoutes from "./routes/reports/reports.admin.routes.js";
import messagingRoutes from "./routes/messaging/messaging.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// ===== Health check route =====
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Your API routes
app.use("/api/upload", uploadRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/videos/progress", progressRoutes);
app.use("/api/videos/delete", deleteRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/likes", likesRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/admin/reports", reportsAdminRoutes);
app.use("/api/messaging", messagingRoutes);


export default app;

