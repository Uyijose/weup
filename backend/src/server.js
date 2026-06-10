import app from "./app.js";

const PORT = process.env.PORT || 5000;

process.on("unhandledRejection", (reason) => {
  console.log("UNHANDLED PROMISE REJECTION", reason?.code || reason?.message || reason)
})

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION", err.code || err.message)
})

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
