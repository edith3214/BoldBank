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
const { initDb, sequelize, User, Transaction, Message } = require("./models");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const PORT = process.env.PORT || 3001;
// const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

// add after PORT
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || ""; // e.g. ".trustbankllc.com" in production

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

// ensure production frontend origins are allowed by default
if (!ALLOWED_ORIGINS.includes('https://boldbank-frontend.onrender.com')) {
  ALLOWED_ORIGINS.push('https://boldbank-frontend.onrender.com');
}
if (!ALLOWED_ORIGINS.includes('https://trustbankllc.com')) {
  ALLOWED_ORIGINS.push('https://trustbankllc.com');
}
if (!ALLOWED_ORIGINS.includes('https://www.trustbankllc.com')) {
  ALLOWED_ORIGINS.push('https://www.trustbankllc.com');
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
  try {
    const { email, password } = req.body || {};
    console.log('[LOGIN] attempt for', email);

    if (!email || !password) {
      console.warn('[LOGIN] missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.warn('[LOGIN] user not found for', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const bcrypt = require('bcrypt');

    if (!user.passwordHash) {
      console.error('[LOGIN] user record missing passwordHash for', email);
      return res.status(500).json({ message: 'Server error: user password not set' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      console.warn('[LOGIN] invalid password for', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    // cookie options
    const cookieOptions = {
      httpOnly: true,
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      path: '/',
    };

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.sameSite = 'none';
      cookieOptions.secure = true;
      if (COOKIE_DOMAIN) cookieOptions.domain = COOKIE_DOMAIN;
    } else {
      cookieOptions.sameSite = 'lax';
      cookieOptions.secure = false;
    }

    res.cookie('token', token, cookieOptions);
    console.log('[LOGIN] success for', email, '-> cookie set (sameSite=' + cookieOptions.sameSite + ')');

    return res.json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    console.error('[LOGIN] unexpected error:', err && err.stack ? err.stack : err);
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ message: 'Internal Server Error', error: String(err), stack: err.stack });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post("/api/logout", (req, res) => {
  const clearOptions = { path: '/' };
  if (process.env.NODE_ENV === 'production') {
    clearOptions.sameSite = 'none';
    clearOptions.secure = true;
    if (COOKIE_DOMAIN) clearOptions.domain = COOKIE_DOMAIN;
  } else {
    clearOptions.sameSite = 'lax';
    clearOptions.secure = false;
  }
  res.clearCookie("token", clearOptions);
  res.json({ ok: true });
});

// GET current user and profile
app.get("/api/me", async (req, res) => {
  const token = req.cookies?.token;
  const p = verifyToken(token);
  if (!p) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await User.findByPk(p.id, { attributes: { exclude: ["passwordHash"] } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // return user record (includes name, accountNumber, phone, avatarUrl now)
    return res.json(user);
  } catch (err) {
    console.error("GET /api/me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PATCH update profile (name/accountNumber/phone/avatarUrl/email)
// Only authenticated users can update their own profile
app.patch("/api/profile", async (req, res) => {
  const token = req.cookies?.token;
  const p = verifyToken(token);
  if (!p) return res.status(401).json({ message: "Not authenticated" });

  // allow email now as well
  const allowed = ["name", "accountNumber", "phone", "avatarUrl", "email"];
  const updates = {};
  for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];

  try {
    const user = await User.findByPk(p.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If email is changing, ensure uniqueness (case-insensitive)
    if (updates.email && updates.email !== user.email) {
      const lowerEmail = updates.email.toLowerCase();

      // use the sequelize instance to do a case-insensitive match
      const existing = await User.findOne({
        where: sequelize.where(sequelize.fn('lower', sequelize.col('email')), lowerEmail),
      });

      if (existing && existing.id !== user.id) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    // Apply updates
    await user.update(updates);

    // Re-fetch returned user without passwordHash
    const returned = await User.findByPk(user.id, { attributes: { exclude: ["passwordHash"] } });

    // If email changed, refresh cookie JWT to include new email and move socket associations
    if (updates.email && updates.email !== p.email) {
      // Re-sign token with updated email and set cookie (same options as /api/login)
      const newToken = signToken({ id: user.id, email: user.email, role: user.role });

      const cookieOptions = {
        httpOnly: true,
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
        path: "/",
      };
      if (process.env.NODE_ENV === "production") {
        cookieOptions.sameSite = "none";
        cookieOptions.secure = true;
        if (COOKIE_DOMAIN) cookieOptions.domain = COOKIE_DOMAIN;
      } else {
        cookieOptions.sameSite = "lax";
        cookieOptions.secure = false;
      }

      res.cookie("token", newToken, cookieOptions);

      // Move socket registrations from old email -> new email so real-time still targets the user
      try {
        const oldEmail = p.email;
        const newEmail = user.email;
        const set = userSockets.get(oldEmail);
        if (set) {
          userSockets.delete(oldEmail);
          const existingSet = userSockets.get(newEmail) || new Set();
          for (const sid of set) existingSet.add(sid);
          userSockets.set(newEmail, existingSet);
        }
      } catch (e) {
        console.warn("Failed to migrate user socket registrations after email change:", e);
      }

      // Emit profile updated event to user's sockets (optional)
      try {
        emitToUser(user.email, "profile:updated", returned.toJSON ? returned.toJSON() : returned);
        emitToUser(p.email, "profile:changed-email", { to: user.email });
      } catch (e) {
        /* ignore emit errors */
      }
    } else {
      // normal update notification
      try { emitToUser(user.email, "profile:updated", returned.toJSON ? returned.toJSON() : returned); } catch (_) {}
    }

    return res.json(returned);
  } catch (err) {
    console.error("PATCH /api/profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
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

// admin approve
app.patch("/api/transactions/:id/approve", async (req, res) => {
  const token = req.cookies?.token;
  const p = verifyToken(token);
  console.log(
    '[DEBUG] PATCH /api/transactions/:id/approve — tokenPresent=',
    !!token,
    ' tokenSample=',
    token ? token.slice(0, 16) + '...' : null,
    ' decoded=',
    p
  );
  if (!p) return res.status(401).json({ message: "Not authenticated" }); // clearer status
  if (p.role !== "admin") return res.status(403).json({ message: "Forbidden" });

  const tx = await Transaction.findByPk(req.params.id);
  if (!tx) return res.status(404).json({ message: "Not found" });

  tx.status = "Completed";
  tx.approvedBy = p.email;
  await tx.save();

  emitToUser(tx.ownerEmail, "transaction:update", tx.toJSON());
  res.json(tx);
});

app.patch("/api/transactions/:id/decline", async (req, res) => {
  const token = req.cookies?.token;
  const p = verifyToken(token);
  console.log(
    '[DEBUG] PATCH /api/transactions/:id/decline — tokenPresent=',
    !!token,
    ' tokenSample=',
    token ? token.slice(0, 16) + '...' : null,
    ' decoded=',
    p
  );
  if (!p) return res.status(401).json({ message: "Not authenticated" });
  if (p.role !== "admin") return res.status(403).json({ message: "Forbidden" });

  const { forceLogout } = req.body;
  const tx = await Transaction.findByPk(req.params.id);
  if (!tx) return res.status(404).json({ message: "Not found" });

  tx.status = "Declined";
  tx.declinedBy = p.email;
  await tx.save();

  emitToUser(tx.ownerEmail, "transaction:update", tx.toJSON());
  if (forceLogout) {
    emitToUser(tx.ownerEmail, "force-logout", { reason: "declined_by_admin" });
  }

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

// TEMP debug endpoint — remove after testing
app.get("/debug/headers", (req, res) => {
  try {
    const cookieHeader = req.headers.cookie || null;
    let maskedToken = null;
    if (cookieHeader) {
      // find token=... and mask it
      const match = cookieHeader.match(/token=([^;]+)/);
      if (match) {
        const t = match[1];
        maskedToken = t.length > 12 ? `${t.slice(0,6)}...${t.slice(-6)}` : `${t}`;
      }
    }

    res.json({
      ok: true,
      origin: req.headers.origin || null,
      cookiePresent: !!cookieHeader,
      cookieMasked: maskedToken,
      userAgent: req.headers["user-agent"] || null,
      note: "Remove this endpoint after debugging"
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});
