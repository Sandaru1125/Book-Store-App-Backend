import express from 'express';
import "dotenv/config";
import authRoutes from './routes/authRoutes.js';
import { constDBConnection } from './lib/db.js';
import cors from "cors";
import bookRoutes from './routes/bookRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// ✅ ADD THIS
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
    constDBConnection();
});