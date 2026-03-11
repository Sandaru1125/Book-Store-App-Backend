import express from 'express';
import "dotenv/config";
import authRoutes from './routes/authRoutes.js';
import { constDBConnection } from './lib/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ ADD THIS LINE
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books",bookRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    constDBConnection();
});