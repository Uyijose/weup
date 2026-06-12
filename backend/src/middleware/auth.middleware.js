import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.replace("Bearer ", "");

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const userId = data.user.id;

  const { data: dbUser, error: dbError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (dbError || !dbUser) {
    console.log("[AUTH] User not found in DB", userId);
    return res.status(401).json({ error: "User not found" });
  }

  req.user = data.user;
  req.dbUser = dbUser;

  next();
}