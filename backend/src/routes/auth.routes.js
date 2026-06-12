import express from "express";
import bcrypt from "bcryptjs";
import { supabase } from "../services/supabase.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password, fullName, username, avatarUrl } = req.body;
  
  try {
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    let userId;

    const { data: existingUserByEmail, error: emailFetchError } =
      await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

    if (emailFetchError && emailFetchError.code !== "PGRST116") {
      throw emailFetchError;
    }

    if (existingUserByEmail) {
      userId = existingUserByEmail.id;
    } else {
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName }
        });

      if (authError) throw authError;
      userId = authData.user.id;
    }

    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    const generateUsername = (fullName) => {
      const parts = fullName.trim().split(" ").filter(Boolean);
      const first = parts[0]?.slice(0, 2).toLowerCase() || "xx";
      const last = parts[1]?.slice(-2).toLowerCase() || "xx";
      const randomDigits = Math.floor(Math.random() * 9000 + 1000);
      return `${first}${last}${randomDigits}`;
    };

    const ensureUniqueUsername = async (fullName) => {
      let username;
      let exists = true;
      while (exists) {
        username = generateUsername(fullName);
        const { data } = await supabase
          .from("users")
          .select("id")
          .eq("username", username)
          .single();
        if (!data) exists = false;
      }
      return username;
    };

    if (existingUser) {
      const updatedData = {};

      if (!existingUser.full_name && fullName)
        updatedData.full_name = fullName;

      if (!existingUser.username) {
        updatedData.username = await ensureUniqueUsername(fullName);
      }

      if (!existingUser.password && hashedPassword)
        updatedData.password = hashedPassword;

      if (!existingUser.avatar_url && avatarUrl)
        updatedData.avatar_url = avatarUrl;

      if (Object.keys(updatedData).length > 0) {
        updatedData.updated_at = new Date().toISOString();

        const { error: updateError } = await supabase
          .from("users")
          .update(updatedData)
          .eq("id", userId);

        if (updateError) throw updateError;
      }
    } else {
      const uniqueUsername = await ensureUniqueUsername(fullName);
      const { error: insertError } = await supabase.from("users").insert({
        id: userId,
        email,
        full_name: fullName,
        username: uniqueUsername,
        password: hashedPassword,
        avatar_url: avatarUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });


      if (insertError) throw insertError;
    }

    res.status(200).json({ userId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError || !user) {
      return res.status(400).json({ error: "User not registered" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password || "");
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const access_token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ userId: user.id, access_token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/google-sync", requireAuth, async (req, res) => {
  const user = req.user;
  const email = user.email;
  const fullName = user.user_metadata?.name || "Anonymous User";

  const generateUsername = (name) => {
    const parts = name.trim().split(" ").filter(Boolean);
    const first = parts[0]?.slice(0, 2).toLowerCase() || "xx";
    const last = parts[1]?.slice(-2).toLowerCase() || "xx";
    const randomDigits = Math.floor(Math.random() * 9000 + 1000); // 4 digits
    return `${first}${last}${randomDigits}`;
  };

  const ensureUniqueUsername = async (name) => {
    let username;
    let exists = true;
    while (exists) {
      username = generateUsername(name);
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();
      if (!data) exists = false;
    }
    return username;
  };

  try {
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!existingUser) {
      const username = await ensureUniqueUsername(fullName);
      const { error: insertError } = await supabase.from("users").insert({
        email,
        full_name: fullName,
        username,
      });
      if (insertError) throw insertError;
      return res.status(200).json({ userId: user.id });
    }

    let username = existingUser.username;
    if (!username) {
      username = await ensureUniqueUsername(fullName);
      const { error: updateError } = await supabase
        .from("users")
        .update({ username })
        .eq("email", email);
      if (updateError) throw updateError;
    } else {
      console.log("Google user already exists with username:", username);
    }

    res.status(200).json({ userId: user.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
