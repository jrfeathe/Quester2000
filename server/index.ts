import express from "express";
import cors from "cors";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:5173", // Vite dev server
        credentials: true,
    })
);

// POST /api/register  { username: string }
app.post("/api/register", async (req, res) => {
    const { username } = req.body as { username?: string };

    if (!username || !username.trim()) {
        return res.status(400).json({ error: "Username is required" });
    }

    try {
        const user = await prisma.user.create({
            data: { username: username.trim() },
        });
        return res.status(201).json({ id: user.id, username: user.username });
    } catch (err: unknown) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
});