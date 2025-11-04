// backend/server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const cookie = require("cookie");
const { Sequelize } = require("sequelize");
const { initDb, User, Transaction, Message } = require("./models");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const PORT = process.env.PORT || 3001;
// const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

// top of file (already have dotenv earlier)
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3001"; // fallback

// allow a list of origins (add whichever ports/origins you run frontend on)
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function corsOriginHandler(origin, callback) {
  // allow non-browser requests (e.g. curl) when origin is undefined
  if (!origin) return callback(null, true);
  if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
  return callback(new Error("CORS origin denied"));
}

const app = express();

// Express CORS middleware
app.use(
  cors({
    origin: corsOriginHandler,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);

// Socket.IO cors config (same policy)
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin denied"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  },
});

// helpers
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

// add these helpers right after verifyToken()
function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  const p = verifyToken(token);
  if (!p) return res.status(401).json({ message: "Not authenticated" });
  req.user = p;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
}

// --- START: improved startup + better logging + DB timeout ---
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION', err && err.stack ? err.stack : err);
  // depending on your preference you can exit(1) here
});

process.on('unhandledRejection', (reason, p) => {
  console.error('UNHANDLED REJECTION at Promise', p, 'reason:', reason);
  // optionally process.exit(1);
});

// helpful quick log so Render shows process started
console.log(`Process start: NODE_ENV=${process.env.NODE_ENV || 'development'}, PORT=${PORT}`);

// ensure production frontend origin is allowed by default
if (!ALLOWED_ORIGINS.includes('https://boldbank-frontend.onrender.com')) {
  ALLOWED_ORIGINS.push('https://boldbank-frontend.onrender.com');
}

// helper to give initDb a timeout so the process doesn't hang forever
function withTimeout(promise, ms, label = 'operation') {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms))
  ]);
}

async function startServer() {
  try {
    console.log("Startup: initializing DB...");
    const start = Date.now();
    // Wait for initDb but fail fast if it doesn't respond within 20s (adjust as needed)
    await withTimeout(initDb(), 20000, 'DB initialization');
    console.log(`Startup: DB initialized (${Date.now() - start}ms).`);

    // Start HTTP+Socket server (bind to 0.0.0.0 for Render)
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on port ${PORT} (0.0.0.0) — NODE_ENV=${process.env.NODE_ENV || "development"}`);
      console.log(`ALLOWED_ORIGINS=${ALLOWED_ORIGINS.join(",")}`);
    });

    // Socket.IO lifecycle logs
    io.on("connect_error", (err) => {
      console.error("Socket.IO connect_error:", err && err.message ? err.message : err);
    });

    io.on("connection", (socket) => {
      console.log('Socket.IO: new connection', socket.id);
      // Note: your existing connection handler is below; this is a small additional log
    });

  } catch (err) {
    console.error("Startup failed — unable to initialize DB or start server:", err && err.stack ? err.stack : err);
    // Fail fast so Render shows the error in deploy logs
    process.exit(1);
  }
}

// Kick it off
startServer();
// --- END: improved startup + better logging + DB timeout ---

// ----- auth endpoints -----
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const bcrypt = require("bcrypt");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  // set cookie with appropriate SameSite & Secure based on environment
  const cookieOptions = {
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
    path: '/',
  };

  // In production (frontend and backend are HTTPS + cross-site), must use SameSite=None and Secure
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.sameSite = 'none';
    cookieOptions.secure = true; // requires HTTPS
  } else {
    // local dev convenience
    cookieOptions.sameSite = 'lax';
    cookieOptions.secure = false;
  }

  res.cookie("token", token, cookieOptions);
  res.json({ id: user.id, email: user.email, role: user.role });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

app.get("/api/me", (req, res) => {
  const token = req.cookies?.token;
  const p = verifyToken(token);
  if (!p) return res.status(401).json({ message: "Not authenticated" });
  res.json({ id: p.id, email: p.email, role: p.role });
});

// ----- transaction endpoints -----
app.post("/api/transactions", async (req, res) => {
  const token = req.cookies?.token;
  const p = verifyToken(token);
  if (!p) return res.status(401).json({ message: "Not authenticated" });

  const { amount, description } = req.body;
  const tx = await Transaction.create({
    id: uuidv4(),
    ownerEmail: p.email,
    amount: parseFloat(amount),
    description: description || "Money Transfer",
    status: "Pending",
    createdAtMs: Date.now(),
  });

  // notify admins (global)
  io.emit("transactions:created", tx.toJSON());
  res.json(tx);
});

app.get("/api/transactions", async (req, res) => {
  const token = req.cookies?.token;
  const p = verifyToken(token);
  if (!p) return res.status(401).json({ message: "Not authenticated" });

  if (p.role === "admin") {
    const all = await Transaction.findAll({ order: [["createdAtMs", "DESC"]] });
    return res.json(all);
  }
  const mine = await Transaction.findAll({ where: { ownerEmail: p.email }, order: [["createdAtMs", "DESC"]] });
  res.json(mine);
});

// replace approve/decline routes with middleware-based versions
app.patch('/api/transactions/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  const tx = await Transaction.findByPk(req.params.id);
  if (!tx) return res.status(404).json({ message: 'Not found' });

  tx.status = 'Completed';
  tx.approvedBy = req.user.email;
  await tx.save();

  emitToUser(tx.ownerEmail, 'transaction:update', tx.toJSON());
  res.json(tx);
});

app.patch('/api/transactions/:id/decline', requireAuth, requireAdmin, async (req, res) => {
  const { forceLogout } = req.body;
  const tx = await Transaction.findByPk(req.params.id);
  if (!tx) return res.status(404).json({ message: 'Not found' });

  tx.status = 'Declined';
  tx.declinedBy = req.user.email;
  await tx.save();

  emitToUser(tx.ownerEmail, 'transaction:update', tx.toJSON());
  if (forceLogout) emitToUser(tx.ownerEmail, 'force-logout', { reason: 'declined_by_admin' });

  res.json(tx);
});

// create message
app.post("/api/messages", async (req, res) => {
  const token = req.cookies?.token;
  const p = verifyToken(token);
  if (!p) return res.status(401).json({ message: "Not authenticated" });

  const { toEmail, content } = req.body;
  if (!toEmail || !content) return res.status(400).json({ message: "toEmail and content required" });

  const msg = await Message.create({
    id: uuidv4(),
    fromEmail: p.email,
    toEmail,
    content,
    createdAtMs: Date.now(),
    read: false,
  });

  // emit to recipient's sockets (if connected)
  emitToUser(toEmail, "message:created", msg.toJSON());
  // emit to sender as well so UI can get DB timestamp
  emitToUser(p.email, "message:created", msg.toJSON());

  res.json(msg);
});

// fetch messages (conversation). for admin: pass ?user=user@bank.com to get convo for that user
app.get("/api/messages", async (req, res) => {
  const token = req.cookies?.token;
  const p = verifyToken(token);
  if (!p) return res.status(401).json({ message: "Not authenticated" });

  const other = req.query.user; // the other participant's email
  if (!other) return res.status(400).json({ message: "Missing query param: user" });

  // only allow if current user is one of the participants (admin may supply any user)
  if (p.email !== other && p.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const msgs = await Message.findAll({
    where: {
      [Sequelize.Op.or]: [
        { fromEmail: p.email, toEmail: other },
        { fromEmail: other, toEmail: p.email },
      ],
    },
    order: [["createdAtMs", "ASC"]],
  });

  res.json(msgs);
});

// ---- Socket.IO user socket tracking ----
const userSockets = new Map(); // email -> Set(socket.id)

function registerSocketForUser(email, socketId) {
  const s = userSockets.get(email) || new Set();
  s.add(socketId);
  userSockets.set(email, s);
}
function unregisterSocket(socketId) {
  for (const [email, set] of userSockets.entries()) {
    if (set.has(socketId)) {
      set.delete(socketId);
      if (set.size === 0) userSockets.delete(email);
      else userSockets.set(email, set);
      break;
    }
  }
}
function emitToUser(email, event, payload) {
  const set = userSockets.get(email);
  if (!set) return;
  for (const sid of set) io.to(sid).emit(event, payload);
}

// authenticate socket by cookie in handshake
io.use((socket, next) => {
  try {
    const raw = socket.handshake.headers.cookie || "";
    const cookies = cookie.parse(raw || "");
    const token = cookies.token;
    if (!token) return next(); // allow connection but no registered user
    const p = verifyToken(token);
    if (!p) return next();
    socket.user = p;
    return next();
  } catch (err) {
    return next();
  }
});

io.on("connection", (socket) => {
  if (socket.user && socket.user.email) {
    registerSocketForUser(socket.user.email, socket.id);
    console.log("Socket connected for", socket.user.email, socket.id);
  } else {
    console.log("Socket connected (no auth)", socket.id);
  }

  socket.on("register", (data) => {
    const token = data?.token;
    const p = verifyToken(token);
    if (p) {
      socket.user = p;
      registerSocketForUser(p.email, socket.id);
      console.log("Socket registered via emit for", p.email, socket.id);
    }
  });

  socket.on("disconnect", () => {
    unregisterSocket(socket.id);
  });
});

// Ensure you use PORT from environment (Render will set this)
// Health endpoints (fast)
app.get("/healthz", (req, res) => res.status(200).json({ ok: true }));
