import express from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";

import {
  createConversation,
  getUserConversations
} from "../../services/messaging/conversations.service.js";

import {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage
} from "../../services/messaging/messages.service.js";

import {
  toggleReaction,
  getReactionsByMessageWithCounts
} from "../../services/messaging/reactions.service.js";

const router = express.Router();
router.use(requireAuth);

/* =========================
   CONVERSATIONS
========================= */

router.get("/conversations", async (req, res) => {
  try {
    console.log("[MESSAGING] GET /conversations triggered");
    console.log("[MESSAGING] req.user:", req.user);

    if (!req.user || !req.user.id) {
      console.log("[MESSAGING] ERROR: Missing req.user.id");
      return res.status(401).json({
        success: false,
        error: "Unauthorized - no user found"
      });
    }

    const conversations = await getUserConversations(req.user.id);

    console.log("[MESSAGING] conversations fetched:", conversations.length);

    return res.json({
      success: true,
      conversations,
      count: conversations.length,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.log("[MESSAGING] CONVERSATIONS ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
});

router.post("/conversations", async (req, res) => {
  try {
    console.log("[MESSAGING] POST /conversations triggered");
    console.log("[MESSAGING] req.user:", req.user);

    if (!req.user || !req.user.id) {
      console.log("[MESSAGING] ERROR: Missing req.user");
      return res.status(401).json({
        success: false,
        error: "Unauthorized - missing user"
      });
    }

    const { members, member_ids, is_group = false, title } = req.body;

    const finalMembers = Array.isArray(member_ids)
      ? member_ids
      : Array.isArray(members)
      ? members
      : [];

    console.log("[MESSAGING] payload received:", {
      members,
      member_ids,
      finalMembers,
      is_group,
      title
    });

    if (!Array.isArray(finalMembers) || finalMembers.length === 0) {
      console.log("[MESSAGING] INVALID MEMBERS ARRAY");
      return res.status(400).json({
        success: false,
        error: "Members array is required"
      });
    }

    const conversation = await createConversation({
      creator_id: req.user.id,
      member_ids: finalMembers,
      is_group,
      title
    });

    console.log("[MESSAGING] conversation created:", conversation?.id);

    res.status(201).json({
      success: true,
      conversation,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.log("[MESSAGING] POST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   MESSAGES
========================= */

router.get("/conversations/:id/messages", async (req, res) => {
  try {
    const messages = await getMessages(req.params.id);

    res.json({
      success: true,
      messages,
      count: messages.length,
      conversation_id: req.params.id,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/conversations/:id/messages", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const message = await sendMessage(
      req.params.id,
      req.user.id,
      content
    );

    res.status(201).json({
      success: true,
      message,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/messages/:id", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const updated = await updateMessage(
      req.params.id,
      req.user.id,
      content
    );

    res.json({
      success: true,
      message: updated,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/messages/:id", async (req, res) => {
  try {
    await deleteMessage(req.params.id, req.user.id);

    res.json({
      success: true,
      message_id: req.params.id,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   REACTIONS
========================= */

router.post("/messages/:id/reactions", async (req, res) => {
  try {
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ error: "Emoji is required" });
    }

    const result = await toggleReaction(
      req.params.id,
      req.user.id,
      emoji
    );

    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/messages/:id/reactions", async (req, res) => {
  try {
    const reactions = await getReactionsByMessageWithCounts(
      req.params.id
    );

    res.json({
      success: true,
      ...reactions,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
