import mongoose from "mongoose";

export async function connectDB(uri) {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    const msg = String(err?.message || err);
    const isAtlasIpIssue =
      msg.includes("MongoDB Atlas cluster") && msg.toLowerCase().includes("whitelist");
    console.error(
      "\nCould not connect to MongoDB.\n" +
        (isAtlasIpIssue
          ? "• Atlas IP not allowed: In MongoDB Atlas → Security → Network Access → Add IP Address.\n" +
            "  - For dev, you can temporarily allow `0.0.0.0/0` (not recommended for production).\n" +
            "  - Or add your current public IP.\n"
          : "") +
        "• If you want local MongoDB: from the project root run `docker compose up -d` and remove/override MONGODB_URI.\n" +
        "• Otherwise set MONGODB_URI in `backend/.env` to a working connection string (include a database name, e.g. `/chat_app`).\n"
    );
    throw err;
  }
}
