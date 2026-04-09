export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password, fullName, username, avatarUrl, is_adult } = req.body;


  try {
    if (!is_adult) {
      console.log("User did not confirm is_adult → blocking signup");
      return res.status(400).json({ error: "You must confirm that you are 18+ to register" });
    }

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    console.log("Backend URL:", BACKEND_URL);

    if (!BACKEND_URL) {
      throw new Error("NEXT_PUBLIC_BACKEND_URL is undefined");
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName, avatarUrl, is_adult }),
    });


    const data = await backendRes.json();

    if (!backendRes.ok) throw new Error(data.error || "Signup failed");
    res.status(200).json({ userId: data.userId });
  } catch (err) {
    console.log("Signup API error frontend:", err.message);
    res.status(400).json({ error: err.message });
  }
}
