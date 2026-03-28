import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./server/routes/authRoutes";
import roomRoutes from "./server/routes/roomRoutes";
import bookingRoutes from "./server/routes/bookingRoutes";
import adminRoutes from "./server/routes/adminRoutes";
import paymentRoutes from "./server/routes/paymentRoutes";
import { ensureDefaultRooms, syncRoomIndexes } from "./server/lib/ensureDefaultRooms";
import { getAllowedCorsOrigins } from "./server/lib/runtimeConfig";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://veerendra2137_db_user:<db_password>@hotel.vbn2mj8.mongodb.net/";

const app = express();

app.use(cors({
  origin: getAllowedCorsOrigins(),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Internal Server Error" });
});

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    try {
      await syncRoomIndexes();
      const seeded = await ensureDefaultRooms();
      if (seeded) {
        console.log("Inserted default rooms because the collection was empty.");
      }
    } catch (seedError) {
      console.error("Failed to synchronize room indexes or seed default rooms:", seedError);
    }
    startServer();
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    startServer();
  });

async function startServer() {
  if (!IS_PRODUCTION) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get(/^(?!\/api).*/, (_request, response) => {
      response.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
