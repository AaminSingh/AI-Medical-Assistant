import mongoose from "mongoose";

/**
 * Connects to MongoDB using the MONGO_URI environment variable.
 * Logs the connection host on success, or exits the process on failure.
 */
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `\n☑  MongoDB connected! Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("✖  MongoDB connection FAILED:", error.message);
    process.exit(1);
  }
};

export default connectDB;
