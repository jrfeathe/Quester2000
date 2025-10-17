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

type ItemCost = {
    body: number;
    mind: number;
    soul: number;
};

function getItemCost(item: {
    priceBody: number;
    priceMind: number;
    priceSoul: number;
}): ItemCost {
    const toCost = (value: number) =>
        Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;

    return {
        body: toCost(item.priceBody),
        mind: toCost(item.priceMind),
        soul: toCost(item.priceSoul),
    };
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

    const { title, details, group, rewardBody, rewardMind, rewardSoul } = req.body ?? {};
    const trimmedTitle = typeof title === "string" ? title.trim() : "";
    if (!trimmedTitle) {
        return res.status(400).json({ error: "Title is required" });
    }

    const trimmedDetails =
        typeof details === "string" && details.trim().length > 0 ? details.trim() : null;
    const trimmedGroup =
        typeof group === "string" && group.trim().length > 0 ? group.trim() : "General";

    const parseReward = (value: unknown, label: string) => {
        const numeric = typeof value === "number" && Number.isFinite(value) ? value : 0;
        if (!Number.isInteger(numeric) || numeric < 0) {
            throw new Error(`${label} must be a non-negative integer`);
        }
        return numeric;
    };

    let parsedRewardBody = 0;
    let parsedRewardMind = 0;
    let parsedRewardSoul = 0;
    try {
        parsedRewardBody = parseReward(rewardBody, "Body reward");
        parsedRewardMind = parseReward(rewardMind, "Mind reward");
        parsedRewardSoul = parseReward(rewardSoul, "Soul reward");
    } catch (parseError) {
        return res.status(400).json({ error: (parseError as Error).message });
    }

    try {
        const quest = await prisma.quest.create({
            data: {
                title: trimmedTitle,
                details: trimmedDetails,
                group: trimmedGroup,
                rewardBody: parsedRewardBody,
                rewardMind: parsedRewardMind,
                rewardSoul: parsedRewardSoul,
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
            select: {
                id: true,
                completed: true,
                rewardBody: true,
                rewardMind: true,
                rewardSoul: true,
            },
        });
        if (!existing) {
            return res.status(404).json({ error: "Quest not found" });
        }
        const updated = await prisma.$transaction(async (tx) => {
            const quest = await tx.quest.update({
                where: { id: questId },
                data: { completed },
            });

            if (completed !== existing.completed) {
                const delta = completed ? 1 : -1;
                const deltaBody = existing.rewardBody * delta;
                const deltaMind = existing.rewardMind * delta;
                const deltaSoul = existing.rewardSoul * delta;

                if (deltaBody !== 0 || deltaMind !== 0 || deltaSoul !== 0) {
                    const user = await tx.user.findUnique({
                        where: { id: userId },
                        select: { pointsBody: true, pointsMind: true, pointsSoul: true },
                    });
                    if (!user) {
                        throw new Error("User not found");
                    }

                    const nextBody = user.pointsBody + deltaBody;
                    const nextMind = user.pointsMind + deltaMind;
                    const nextSoul = user.pointsSoul + deltaSoul;

                    if (nextBody < 0 || nextMind < 0 || nextSoul < 0) {
                        const error = new Error("Insufficient points to mark quest incomplete");
                        (error as Error & { code?: string }).code = "POINTS_UNDERFLOW";
                        throw error;
                    }

                    await tx.user.update({
                        where: { id: userId },
                        data: {
                            pointsBody: nextBody,
                            pointsMind: nextMind,
                            pointsSoul: nextSoul,
                        },
                    });
                }
            }

            return quest;
        });
        return res.json(updated);
    } catch (e) {
        if ((e as Error & { code?: string }).code === "POINTS_UNDERFLOW") {
            return res.status(400).json({ error: (e as Error).message });
        }
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

app.get("/api/user/points", requireAuth, async (req, res) => {
    const userId =
        typeof req.user === "object" && req.user !== null && "id" in req.user
            ? Number((req.user as { id: number }).id)
            : null;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { pointsBody: true, pointsMind: true, pointsSoul: true },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json(user);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to load points" });
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

    const { name, description, category, quantity, priceBody, priceMind, priceSoul } =
        req.body ?? {};
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
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
        return res.status(400).json({ error: "Quantity must be a positive integer" });
    }
    const parsedPriceBody =
        typeof priceBody === "number" && Number.isFinite(priceBody) ? priceBody : 0;
    if (!Number.isInteger(parsedPriceBody) || parsedPriceBody < 0) {
        return res.status(400).json({ error: "Body price must be a non-negative integer" });
    }
    const parsedPriceMind =
        typeof priceMind === "number" && Number.isFinite(priceMind) ? priceMind : 0;
    if (!Number.isInteger(parsedPriceMind) || parsedPriceMind < 0) {
        return res.status(400).json({ error: "Mind price must be a non-negative integer" });
    }
    const parsedPriceSoul =
        typeof priceSoul === "number" && Number.isFinite(priceSoul) ? priceSoul : 0;
    if (!Number.isInteger(parsedPriceSoul) || parsedPriceSoul < 0) {
        return res.status(400).json({ error: "Soul price must be a non-negative integer" });
    }

    try {
        const item = await prisma.item.create({
            data: {
                title: trimmedName,
                description: trimmedDescription,
                category: trimmedCategory,
                quantity: parsedQuantity,
                priceBody: parsedPriceBody,
                priceMind: parsedPriceMind,
                priceSoul: parsedPriceSoul,
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

app.post("/api/items/:id/buy", requireAuth, async (req, res) => {
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
        const updated = await prisma.$transaction(async (tx) => {
            const existing = await tx.item.findFirst({
                where: { id: itemId, userId },
            });
            if (!existing) {
                throw new Error("ITEM_NOT_FOUND");
            }

            const cost = getItemCost(existing);
            const totalCost = cost.body + cost.mind + cost.soul;
            if (totalCost > 0) {
                const user = await tx.user.findUnique({
                    where: { id: userId },
                    select: { pointsBody: true, pointsMind: true, pointsSoul: true },
                });
                if (!user) {
                    throw new Error("USER_NOT_FOUND");
                }
                if (
                    user.pointsBody < cost.body ||
                    user.pointsMind < cost.mind ||
                    user.pointsSoul < cost.soul
                ) {
                    throw new Error("INSUFFICIENT_POINTS");
                }
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        ...(cost.body > 0 ? { pointsBody: { decrement: cost.body } } : {}),
                        ...(cost.mind > 0 ? { pointsMind: { decrement: cost.mind } } : {}),
                        ...(cost.soul > 0 ? { pointsSoul: { decrement: cost.soul } } : {}),
                    },
                });
            }

            return tx.item.update({
                where: { id: existing.id },
                data: { quantity: { increment: 1 } },
            });
        });
        return res.json(updated);
    } catch (e) {
        if (e instanceof Error) {
            if (e.message === "ITEM_NOT_FOUND") {
                return res.status(404).json({ error: "Item not found" });
            }
            if (e.message === "USER_NOT_FOUND") {
                return res.status(404).json({ error: "User not found" });
            }
            if (e.message === "INSUFFICIENT_POINTS") {
                return res.status(400).json({ error: "Not enough points" });
            }
        }
        console.error(e);
        return res.status(500).json({ error: "Failed to buy item" });
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
