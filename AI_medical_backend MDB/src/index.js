import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/database.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;

    app.on("error", (error) => {
      console.error("✖  Express error:", error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`⚡ Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("✖  MongoDB connection failed!", error);
  });
