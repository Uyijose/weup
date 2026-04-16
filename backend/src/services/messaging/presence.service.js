import { ensureRedis } from "../../database/redis.js";

class PresenceService {
  constructor() {
    this.redis = null;

    this.PRESENCE_KEY_PREFIX = "presence:";
    this.TYPING_KEY_PREFIX = "typing:";
    this.ONLINE_USERS_KEY = "online_users";

    this.PRESENCE_EXPIRY = 300; // seconds
    this.TYPING_EXPIRY = 10; // seconds

    this.initializeRedis();
  }

  async initializeRedis() {
    if (this.redis) return;

    try {
      this.redis = await ensureRedis();
    } catch (error) {
      console.error("❌ Redis init failed (PresenceService):", error);
      throw new Error("Redis connection required for presence tracking");
    }
  }

  /* =========================
     ONLINE / OFFLINE
  ========================= */

  async setUserOnline(userId, socketId) {
    await this.initializeRedis();

    const key = `${this.PRESENCE_KEY_PREFIX}${userId}`;
    const now = new Date().toISOString();

    const existing = await this.redis.get(key);
    let socketIds = [];

    if (existing) {
      const parsed = JSON.parse(existing);
      socketIds = parsed.socket_ids || [];
    }

    if (!socketIds.includes(socketId)) {
      socketIds.push(socketId);
    }

    const payload = {
      status: "online",
      last_seen: now,
      socket_ids: socketIds
    };

    await this.redis.setEx(key, this.PRESENCE_EXPIRY, JSON.stringify(payload));
    await this.redis.sAdd(this.ONLINE_USERS_KEY, userId);
  }

  async setUserOffline(userId, socketId) {
    await this.initializeRedis();

    const key = `${this.PRESENCE_KEY_PREFIX}${userId}`;
    const now = new Date().toISOString();

    const existing = await this.redis.get(key);
    if (!existing) return;

    const parsed = JSON.parse(existing);
    let socketIds = parsed.socket_ids || [];

    socketIds = socketIds.filter(id => id !== socketId);

    if (socketIds.length === 0) {
      const payload = {
        status: "offline",
        last_seen: now,
        socket_ids: []
      };

      await this.redis.setEx(key, this.PRESENCE_EXPIRY, JSON.stringify(payload));
      await this.redis.sRem(this.ONLINE_USERS_KEY, userId);
      await this.clearUserTyping(userId);
    } else {
      const payload = {
        status: "online",
        last_seen: parsed.last_seen,
        socket_ids: socketIds
      };

      await this.redis.setEx(key, this.PRESENCE_EXPIRY, JSON.stringify(payload));
    }
  }

  async getUserPresence(userId) {
    await this.initializeRedis();

    const key = `${this.PRESENCE_KEY_PREFIX}${userId}`;
    const data = await this.redis.get(key);

    if (!data) {
      return {
        status: "offline",
        socket_ids: []
      };
    }

    const parsed = JSON.parse(data);

    return {
      status: parsed.status || "offline",
      last_seen: parsed.last_seen ? new Date(parsed.last_seen) : undefined,
      socket_ids: parsed.socket_ids || []
    };
  }

  async getOnlineUsers() {
    await this.initializeRedis();
    return (await this.redis.sMembers(this.ONLINE_USERS_KEY)) || [];
  }

  /* =========================
     TYPING
  ========================= */

  async setTyping(userId, conversationId) {
    await this.initializeRedis();

    const key = `${this.TYPING_KEY_PREFIX}${conversationId}`;
    const now = new Date().toISOString();

    await this.redis.hSet(key, userId, now);
    await this.redis.expire(key, this.TYPING_EXPIRY);
  }

  async stopTyping(userId, conversationId) {
    await this.initializeRedis();

    const key = `${this.TYPING_KEY_PREFIX}${conversationId}`;
    await this.redis.hDel(key, userId);
  }

  async getTypingUsers(conversationId) {
    await this.initializeRedis();

    const key = `${this.TYPING_KEY_PREFIX}${conversationId}`;
    const data = await this.redis.hGetAll(key);

    if (!data) return [];

    const now = Date.now();
    const activeUsers = [];

    for (const [userId, timestamp] of Object.entries(data)) {
      const diff =
        (now - new Date(timestamp).getTime()) / 1000;

      if (diff <= this.TYPING_EXPIRY) {
        activeUsers.push(userId);
      } else {
        await this.redis.hDel(key, userId);
      }
    }

    return activeUsers;
  }

  async clearUserTyping(userId) {
    await this.initializeRedis();

    const keys = await this.redis.keys(`${this.TYPING_KEY_PREFIX}*`);

    for (const key of keys) {
      await this.redis.hDel(key, userId);
    }
  }

  /* =========================
     BULK / CLEANUP
  ========================= */

  async getPresenceForUsers(userIds) {
    const result = {};

    await Promise.all(
      userIds.map(async (id) => {
        result[id] = await this.getUserPresence(id);
      })
    );

    return result;
  }

  async cleanupExpiredPresence() {
    await this.initializeRedis();

    const users = await this.getOnlineUsers();
    const now = Date.now();

    for (const userId of users) {
      const presence = await this.getUserPresence(userId);

      if (
        presence.status === "offline" ||
        (presence.last_seen &&
          now - presence.last_seen.getTime() >
            this.PRESENCE_EXPIRY * 1000)
      ) {
        await this.redis.sRem(this.ONLINE_USERS_KEY, userId);
      }
    }
  }

  startPresenceCleanup(intervalMs = 60000) {
    setInterval(() => {
      this.cleanupExpiredPresence().catch(err =>
        console.error("Presence cleanup error:", err)
      );
    }, intervalMs);
  }
}

export const presenceService = new PresenceService();
