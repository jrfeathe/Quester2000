import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import passport, { AuthenticateCallback } from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import argon2 from "argon2";
import { PrismaClient } from "../src/generated/prisma";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PgStore = connectPgSimple(session);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:5173", // Vite dev server
        credentials: true,
    })
);

// --- Sessions (stored in Postgres) ---
app.use(
    session({
        store: new PgStore({
            pool,
            createTableIfMissing: true,
            tableName: "session",
        }),
        name: "qid",                // cookie name
        secret: process.env.SESSION_SECRET || "dev-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",          // set "none" + secure true if using HTTPS on different domain
            secure: false,            // true in production behind HTTPS
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        },
    })
);

// --- Passport setup ---
passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { username } });
            if (!user) return done(null, false, { message: "Invalid credentials" });
            const ok = await argon2.verify(user.passwordHash, password);
            if (!ok) return done(null, false, { message: "Invalid credentials" });
            return done(null, { id: user.id, username: user.username });
        } catch (e) {
            return done(e);
        }
    })
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, username: true },
        });
        done(null, user ?? false);
    } catch (e) {
        done(e);
    }
});

app.use(passport.initialize());
app.use(passport.session());

// Helper to protect routes
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.isAuthenticated && req.isAuthenticated()) return next();
    return res.status(401).json({ error: "Unauthorized" });
}

app.get("/api/quests", requireAuth, async (req, res) => {
    const userId =
        typeof req.user === "object" && req.user !== null && "id" in req.user
            ? Number((req.user as { id: number }).id)
            : null;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const quests = await prisma.quest.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        return res.json(quests);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to load quests" });
    }
});

app.post("/api/quests", requireAuth, async (req, res) => {
    const userId =
        typeof req.user === "object" && req.user !== null && "id" in req.user
            ? Number((req.user as { id: number }).id)
            : null;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, details, group } = req.body ?? {};
    const trimmedTitle = typeof title === "string" ? title.trim() : "";
    if (!trimmedTitle) {
        return res.status(400).json({ error: "Title is required" });
    }

    const trimmedDetails =
        typeof details === "string" && details.trim().length > 0 ? details.trim() : null;
    const trimmedGroup =
        typeof group === "string" && group.trim().length > 0 ? group.trim() : "General";

    try {
        const quest = await prisma.quest.create({
            data: {
                title: trimmedTitle,
                details: trimmedDetails,
                group: trimmedGroup,
                userId,
            },
        });
        return res.status(201).json(quest);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to create quest" });
    }
});

app.delete("/api/quests/:id", requireAuth, async (req, res) => {
    const userId =
        typeof req.user === "object" && req.user !== null && "id" in req.user
            ? Number((req.user as { id: number }).id)
            : null;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const questId = Number(req.params.id);
    if (!Number.isInteger(questId) || questId <= 0) {
        return res.status(400).json({ error: "Invalid quest id" });
    }

    try {
        const result = await prisma.quest.deleteMany({
            where: { id: questId, userId },
        });
        if (result.count === 0) {
            return res.status(404).json({ error: "Quest not found" });
        }
        return res.status(204).send();
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to delete quest" });
    }
});

app.patch("/api/quests/:id", requireAuth, async (req, res) => {
    const userId =
        typeof req.user === "object" && req.user !== null && "id" in req.user
            ? Number((req.user as { id: number }).id)
            : null;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const questId = Number(req.params.id);
    if (!Number.isInteger(questId) || questId <= 0) {
        return res.status(400).json({ error: "Invalid quest id" });
    }

    const { completed } = req.body ?? {};
    if (typeof completed !== "boolean") {
        return res.status(400).json({ error: "completed must be a boolean" });
    }

    try {
        const existing = await prisma.quest.findFirst({
            where: { id: questId, userId },
        });
        if (!existing) {
            return res.status(404).json({ error: "Quest not found" });
        }
        const updated = await prisma.quest.update({
            where: { id: questId },
            data: { completed },
        });
        return res.json(updated);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to update quest" });
    }
});

app.get("/api/items", requireAuth, async (req, res) => {
    const userId =
        typeof req.user === "object" && req.user !== null && "id" in req.user
            ? Number((req.user as { id: number }).id)
            : null;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const items = await prisma.item.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        return res.json(items);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to load items" });
    }
});

app.post("/api/items", requireAuth, async (req, res) => {
    const userId =
        typeof req.user === "object" && req.user !== null && "id" in req.user
            ? Number((req.user as { id: number }).id)
            : null;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, description, category, quantity } = req.body ?? {};
    const trimmedName = typeof name === "string" ? name.trim() : "";
    if (!trimmedName) {
        return res.status(400).json({ error: "Item name is required" });
    }

    const trimmedDescription =
        typeof description === "string" && description.trim().length > 0
            ? description.trim()
            : null;
    const trimmedCategory =
        typeof category === "string" && category.trim().length > 0
            ? category.trim()
            : "General";
    const parsedQuantity =
        typeof quantity === "number" && Number.isFinite(quantity) ? quantity : 1;
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
        return res.status(400).json({ error: "Quantity must be a positive integer" });
    }

    try {
        const item = await prisma.item.create({
            data: {
                title: trimmedName,
                description: trimmedDescription,
                category: trimmedCategory,
                quantity: parsedQuantity,
                userId,
            },
        });
        return res.status(201).json(item);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to create item" });
    }
});

app.delete("/api/items/:id", requireAuth, async (req, res) => {
    const userId =
        typeof req.user === "object" && req.user !== null && "id" in req.user
            ? Number((req.user as { id: number }).id)
            : null;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const itemId = Number(req.params.id);
    if (!Number.isInteger(itemId) || itemId <= 0) {
        return res.status(400).json({ error: "Invalid item id" });
    }

    try {
        const result = await prisma.item.deleteMany({
            where: { id: itemId, userId },
        });
        if (result.count === 0) {
            return res.status(404).json({ error: "Item not found" });
        }
        return res.status(204).send();
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to delete item" });
    }
});

app.post("/api/items/:id/use", requireAuth, async (req, res) => {
    const userId =
        typeof req.user === "object" && req.user !== null && "id" in req.user
            ? Number((req.user as { id: number }).id)
            : null;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const itemId = Number(req.params.id);
    if (!Number.isInteger(itemId) || itemId <= 0) {
        return res.status(400).json({ error: "Invalid item id" });
    }

    try {
        const existing = await prisma.item.findFirst({
            where: { id: itemId, userId },
        });
        if (!existing) {
            return res.status(404).json({ error: "Item not found" });
        }
        if (existing.quantity <= 0) {
            return res.status(400).json({ error: "Item has no remaining quantity" });
        }

        const updated = await prisma.item.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity - 1 },
        });
        return res.json(updated);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to use item" });
    }
});

// POST /api/register  { username: string }
// --- Auth routes ---

// Register (creates user AND logs them in)
app.post("/api/register", async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username?.trim() || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    try {
        const passwordHash = await argon2.hash(password);
        const user = await prisma.user.create({
            data: { username: username.trim(), passwordHash },
            select: { id: true, username: true },
        });
        // Manually log in (establish session)
        req.login(user, (err) => {
            if (err) return res.status(500).json({ error: "Login after register failed" });
            return res.status(201).json(user);
        });
    } catch (e) {
        // Unique username collision
        if (e?.code === "P2002") return res.status(409).json({ error: "Username already taken" });
        console.error(e);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Login (uses passport local)
app.post(
    "/api/login",
    (req: Request, res: Response, next: NextFunction) => {
        const callback: AuthenticateCallback = (err, user, info) => {
            if (err) return next(err);
            if (!user) {
                const msg =
                    typeof info === "object" && info !== null && "message" in info
                        ? (info as { message?: string }).message
                        : undefined;
                return res.status(400).json({ error: msg || "Invalid credentials" });
            }

            req.login(user, (loginErr) => {
                if (loginErr) return next(loginErr);
                return res.json(user); // { id, username }
            });
        };

        passport.authenticate("local", callback)(req, res, next);
    }
);

// Logout
app.post("/api/logout", (req, res) => {
    req.logout(() => {
        res.status(204).end();
    });
});

// Example protected route
app.get("/api/private", requireAuth, (req, res) => {
    res.json({ message: `Hello ${req.user.username}` });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
});
