import express from "express";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notifications/notifications.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

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

router.get("/unread-count", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

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

router.patch("/:id/read", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

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

router.patch("/read-all", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

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