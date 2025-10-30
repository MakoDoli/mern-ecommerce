import express from "express";
import { config } from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";

config();
const app = express();

app.get("/", (req, res) => {
  res.send("Ready to serve");
});
app.use(express.json());
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server is listening on port whatever");
  connectDB();
});
