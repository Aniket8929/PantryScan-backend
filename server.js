import app from "./src/app.js";
import connectedToDb from "./src/config/db.js";
import { PORT } from "./src/config/env.js";
import dns from "dns";
import dotenv from "dotenv";
dotenv.config();

dns.setServers(["4.4.4.4","8.8.8.8"])



const server = app.listen(PORT,async () => {
 await connectedToDb();
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});


process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
