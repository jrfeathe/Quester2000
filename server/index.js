"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var express_session_1 = __importDefault(require("express-session"));
var connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
var pg_1 = __importDefault(require("pg"));
var passport_1 = __importDefault(require("passport"));
var passport_local_1 = require("passport-local");
var argon2_1 = __importDefault(require("argon2"));
var prisma_1 = require("../src/generated/prisma");
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var app = (0, express_1.default)();
var prisma = new prisma_1.PrismaClient();
var PgStore = (0, connect_pg_simple_1.default)(express_session_1.default);
var pool = new pg_1.default.Pool({ connectionString: process.env.DATABASE_URL });
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // Vite dev server
    credentials: true,
}));
// --- Sessions (stored in Postgres) ---
app.use((0, express_session_1.default)({
    store: new PgStore({
        pool: pool,
        createTableIfMissing: true,
        tableName: "session",
    }),
    name: "qid", // cookie name
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax", // set "none" + secure true if using HTTPS on different domain
        secure: false, // true in production behind HTTPS
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
}));
// --- Passport setup ---
passport_1.default.use(new passport_local_1.Strategy(function (username, password, done) { return __awaiter(void 0, void 0, void 0, function () {
    var user, ok, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma.user.findUnique({ where: { username: username } })];
            case 1:
                user = _a.sent();
                if (!user)
                    return [2 /*return*/, done(null, false, { message: "Invalid credentials" })];
                return [4 /*yield*/, argon2_1.default.verify(user.passwordHash, password)];
            case 2:
                ok = _a.sent();
                if (!ok)
                    return [2 /*return*/, done(null, false, { message: "Invalid credentials" })];
                return [2 /*return*/, done(null, { id: user.id, username: user.username })];
            case 3:
                e_1 = _a.sent();
                return [2 /*return*/, done(e_1)];
            case 4: return [2 /*return*/];
        }
    });
}); }));
passport_1.default.serializeUser(function (user, done) { return done(null, user.id); });
passport_1.default.deserializeUser(function (id, done) { return __awaiter(void 0, void 0, void 0, function () {
    var user, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.user.findUnique({
                        where: { id: id },
                        select: { id: true, username: true },
                    })];
            case 1:
                user = _a.sent();
                done(null, user !== null && user !== void 0 ? user : false);
                return [3 /*break*/, 3];
            case 2:
                e_2 = _a.sent();
                done(e_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Helper to protect routes
function requireAuth(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated())
        return next();
    return res.status(401).json({ error: "Unauthorized" });
}
app.get("/api/quests", requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, quests, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = typeof req.user === "object" && req.user !== null && "id" in req.user
                    ? Number(req.user.id)
                    : null;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.quest.findMany({
                        where: { userId: userId },
                        orderBy: { createdAt: "desc" },
                    })];
            case 2:
                quests = _a.sent();
                return [2 /*return*/, res.json(quests)];
            case 3:
                e_3 = _a.sent();
                console.error(e_3);
                return [2 /*return*/, res.status(500).json({ error: "Failed to load quests" })];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post("/api/quests", requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, title, details, group, trimmedTitle, trimmedDetails, trimmedGroup, quest, e_4;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                userId = typeof req.user === "object" && req.user !== null && "id" in req.user
                    ? Number(req.user.id)
                    : null;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                }
                _a = (_b = req.body) !== null && _b !== void 0 ? _b : {}, title = _a.title, details = _a.details, group = _a.group;
                trimmedTitle = typeof title === "string" ? title.trim() : "";
                if (!trimmedTitle) {
                    return [2 /*return*/, res.status(400).json({ error: "Title is required" })];
                }
                trimmedDetails = typeof details === "string" && details.trim().length > 0 ? details.trim() : null;
                trimmedGroup = typeof group === "string" && group.trim().length > 0 ? group.trim() : "General";
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.quest.create({
                        data: {
                            title: trimmedTitle,
                            details: trimmedDetails,
                            group: trimmedGroup,
                            userId: userId,
                        },
                    })];
            case 2:
                quest = _c.sent();
                return [2 /*return*/, res.status(201).json(quest)];
            case 3:
                e_4 = _c.sent();
                console.error(e_4);
                return [2 /*return*/, res.status(500).json({ error: "Failed to create quest" })];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.delete("/api/quests/:id", requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, questId, result, e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = typeof req.user === "object" && req.user !== null && "id" in req.user
                    ? Number(req.user.id)
                    : null;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                }
                questId = Number(req.params.id);
                if (!Number.isInteger(questId) || questId <= 0) {
                    return [2 /*return*/, res.status(400).json({ error: "Invalid quest id" })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.quest.deleteMany({
                        where: { id: questId, userId: userId },
                    })];
            case 2:
                result = _a.sent();
                if (result.count === 0) {
                    return [2 /*return*/, res.status(404).json({ error: "Quest not found" })];
                }
                return [2 /*return*/, res.status(204).send()];
            case 3:
                e_5 = _a.sent();
                console.error(e_5);
                return [2 /*return*/, res.status(500).json({ error: "Failed to delete quest" })];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.patch("/api/quests/:id", requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, questId, completed, existing, updated, e_6;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = typeof req.user === "object" && req.user !== null && "id" in req.user
                    ? Number(req.user.id)
                    : null;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                }
                questId = Number(req.params.id);
                if (!Number.isInteger(questId) || questId <= 0) {
                    return [2 /*return*/, res.status(400).json({ error: "Invalid quest id" })];
                }
                completed = ((_a = req.body) !== null && _a !== void 0 ? _a : {}).completed;
                if (typeof completed !== "boolean") {
                    return [2 /*return*/, res.status(400).json({ error: "completed must be a boolean" })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, prisma.quest.findFirst({
                        where: { id: questId, userId: userId },
                    })];
            case 2:
                existing = _b.sent();
                if (!existing) {
                    return [2 /*return*/, res.status(404).json({ error: "Quest not found" })];
                }
                return [4 /*yield*/, prisma.quest.update({
                        where: { id: questId },
                        data: { completed: completed },
                    })];
            case 3:
                updated = _b.sent();
                return [2 /*return*/, res.json(updated)];
            case 4:
                e_6 = _b.sent();
                console.error(e_6);
                return [2 /*return*/, res.status(500).json({ error: "Failed to update quest" })];
            case 5: return [2 /*return*/];
        }
    });
}); });
// POST /api/register  { username: string }
// --- Auth routes ---
// Register (creates user AND logs them in)
app.post("/api/register", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, passwordHash, user_1, e_7;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = (_b = req.body) !== null && _b !== void 0 ? _b : {}, username = _a.username, password = _a.password;
                if (!(username === null || username === void 0 ? void 0 : username.trim()) || !password) {
                    return [2 /*return*/, res.status(400).json({ error: "Username and password are required" })];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 4, , 5]);
                return [4 /*yield*/, argon2_1.default.hash(password)];
            case 2:
                passwordHash = _c.sent();
                return [4 /*yield*/, prisma.user.create({
                        data: { username: username.trim(), passwordHash: passwordHash },
                        select: { id: true, username: true },
                    })];
            case 3:
                user_1 = _c.sent();
                // Manually log in (establish session)
                req.login(user_1, function (err) {
                    if (err)
                        return res.status(500).json({ error: "Login after register failed" });
                    return res.status(201).json(user_1);
                });
                return [3 /*break*/, 5];
            case 4:
                e_7 = _c.sent();
                // Unique username collision
                if ((e_7 === null || e_7 === void 0 ? void 0 : e_7.code) === "P2002")
                    return [2 /*return*/, res.status(409).json({ error: "Username already taken" })];
                console.error(e_7);
                return [2 /*return*/, res.status(500).json({ error: "Internal server error" })];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Login (uses passport local)
app.post("/api/login", function (req, res, next) {
    var callback = function (err, user, info) {
        if (err)
            return next(err);
        if (!user) {
            var msg = typeof info === "object" && info !== null && "message" in info
                ? info.message
                : undefined;
            return res.status(400).json({ error: msg || "Invalid credentials" });
        }
        req.login(user, function (loginErr) {
            if (loginErr)
                return next(loginErr);
            return res.json(user); // { id, username }
        });
    };
    passport_1.default.authenticate("local", callback)(req, res, next);
});
// Logout
app.post("/api/logout", function (req, res) {
    req.logout(function () {
        res.status(204).end();
    });
});
// Example protected route
app.get("/api/private", requireAuth, function (req, res) {
    res.json({ message: "Hello ".concat(req.user.username) });
});
var PORT = 3000;
app.listen(PORT, function () {
    console.log("API listening on http://localhost:".concat(PORT));
});
