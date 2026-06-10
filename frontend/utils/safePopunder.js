export function safePopunder(key) {
  if (typeof window === "undefined") return;

  const already = sessionStorage.getItem(key);
  console.log("[POPUNDER CHECK]", key, already);

  if (already) return;

  const networks = [
    {
      name: "pemsrv",
      url: "https://s.pemsrv.com/v1/link.php?idzone=5884826"
    },
    {
      name: "adsterra",
      url: "https://pl29006554.profitablecpmratenetwork.com/52/a1/c0/52a1c09e0162f848b769d07e30c130fc.js"
    }
  ];

  sessionStorage.setItem(key, "true");

  for (let i = 0; i < networks.length; i++) {
    try {
      console.log("[POPUNDER TRY]", networks[i].name);
      const win = window.open(
        networks[i].url,
        "_blank",
        "noopener,noreferrer"
      );

      if (win) {
        console.log("[POPUNDER SUCCESS]", networks[i].name);
        return;
      }
    } catch (e) {
      console.log("[POPUNDER FAIL]", networks[i].name);
    }
  }

  console.log("[POPUNDER ALL FAILED]");
}
