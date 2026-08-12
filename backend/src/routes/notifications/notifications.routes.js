import express from "express";

import { requireAuth } from "../../middleware/auth.middleware.js";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notifications/notifications.service.js";

const router = express.Router();

/* -------------------------------------------------
   AUTHENTICATION
-------------------------------------------------- */

router.use(requireAuth);

/* -------------------------------------------------
   GET NOTIFICATIONS
-------------------------------------------------- */

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await getNotifications(
      userId,
      req.query.limit
    );

    const unreadCount =
      await getUnreadNotificationCount(userId);

    return res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "[NOTIFICATIONS] FETCH ERROR",
      error
    );

    return res.status(500).json({
      error: "Failed to fetch notifications",
    });
  }
});

/* -------------------------------------------------
   GET UNREAD COUNT
-------------------------------------------------- */

router.get("/unread-count", async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount =
      await getUnreadNotificationCount(userId);

    return res.json({
      unreadCount,
    });
  } catch (error) {
    console.error(
      "[NOTIFICATIONS] UNREAD COUNT ERROR",
      error
    );

    return res.status(500).json({
      error: "Failed to fetch unread notification count",
    });
  }
});

/* -------------------------------------------------
   MARK ONE AS READ
-------------------------------------------------- */

router.patch("/:id/read", async (req, res) => {
  try {
    const userId = req.user.id;

    const notification =
      await markNotificationAsRead(
        req.params.id,
        userId
      );

    return res.json({
      notification,
    });
  } catch (error) {
    console.error(
      "[NOTIFICATIONS] MARK READ ERROR",
      error
    );

    return res.status(500).json({
      error: "Failed to mark notification as read",
    });
  }
});

/* -------------------------------------------------
   MARK ALL AS READ
-------------------------------------------------- */

router.patch("/read-all", async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications =
      await markAllNotificationsAsRead(userId);

    return res.json({
      notifications,
    });
  } catch (error) {
    console.error(
      "[NOTIFICATIONS] MARK ALL READ ERROR",
      error
    );

    return res.status(500).json({
      error: "Failed to mark notifications as read",
    });
  }
});

export default router;