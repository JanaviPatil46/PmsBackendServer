import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import dbconnect from "./config/db.js"
import accountRoutes from "./routes/accountRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import authRoutes from "./routes/authRoutes.js"
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/accounts", accountRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
// DB + Server
// database connect
dbconnect();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`connection is live at port no. ${PORT}`);
});
