import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const db = new Database("database.sqlite");

// Initialize Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    coverImage TEXT,
    author TEXT,
    category TEXT,
    isPublished INTEGER DEFAULT 0,
    createdAt TEXT,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    displayName TEXT,
    role TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS site_config (
    id TEXT PRIMARY KEY,
    config TEXT NOT NULL
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API Routes ---

  // Articles
  app.get("/api/articles", (req, res) => {
    const articles = db.prepare("SELECT * FROM articles ORDER BY createdAt DESC").all();
    res.json(articles.map(a => ({
      ...a,
      isPublished: !!a.isPublished,
      createdAt: { toDate: () => new Date(a.createdAt as string) },
      updatedAt: { toDate: () => new Date(a.updatedAt as string) }
    })));
  });

  app.post("/api/articles", (req, res) => {
    const { id, title, content, summary, coverImage, author, category, isPublished, createdAt } = req.body;
    const stmt = db.prepare(`
      INSERT INTO articles (id, title, content, summary, coverImage, author, category, isPublished, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();
    stmt.run(id || Math.random().toString(36).substr(2, 9), title, content, summary, coverImage, author, category, isPublished ? 1 : 0, createdAt || now, now);
    res.json({ success: true });
  });

  app.put("/api/articles/:id", (req, res) => {
    const { title, content, summary, coverImage, category, isPublished, createdAt } = req.body;
    const stmt = db.prepare(`
      UPDATE articles SET title = ?, content = ?, summary = ?, coverImage = ?, category = ?, isPublished = ?, createdAt = ?, updatedAt = ?
      WHERE id = ?
    `);
    const now = new Date().toISOString();
    stmt.run(title, content, summary, coverImage, category, isPublished ? 1 : 0, createdAt, now, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/articles/:id", (req, res) => {
    db.prepare("DELETE FROM articles WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Users
  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT uid, username, displayName, role, createdAt FROM users ORDER BY createdAt DESC").all();
    res.json(users.map(u => ({
      ...u,
      createdAt: { toDate: () => new Date(u.createdAt as string) }
    })));
  });

  app.post("/api/users", (req, res) => {
    const { username, password, displayName, role } = req.body;
    const uid = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    db.prepare("INSERT INTO users (uid, username, password, displayName, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)").run(uid, username, password, displayName, role, now);
    res.json({ success: true });
  });

  app.put("/api/users/:uid/password", (req, res) => {
    const { password } = req.body;
    db.prepare("UPDATE users SET password = ? WHERE uid = ?").run(password, req.params.uid);
    res.json({ success: true });
  });

  app.delete("/api/users/:uid", (req, res) => {
    db.prepare("DELETE FROM users WHERE uid = ?").run(req.params.uid);
    res.json({ success: true });
  });

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT uid, username, displayName, role, createdAt FROM users WHERE username = ? AND password = ?").get(username, password);
    if (user) {
      res.json({ ...user, createdAt: { toDate: () => new Date(user.createdAt as string) } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Config
  app.get("/api/config", (req, res) => {
    const row = db.prepare("SELECT config FROM site_config WHERE id = 'home'").get();
    if (row) {
      res.json(JSON.parse(row.config));
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  app.post("/api/config", (req, res) => {
    const config = JSON.stringify(req.body);
    db.prepare("INSERT OR REPLACE INTO site_config (id, config) VALUES ('home', ?)").run(config);
    res.json({ success: true });
  });

  // AI Generation
  app.post("/api/generate-articles", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API key not found" });

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "请搜索并整理关于'漳州正兴学校'的最新新闻、办学特色、校园活动、师资力量等信息，并基于这些信息生成10篇高质量的校园新闻文章。每篇文章包含：title (标题), summary (摘要), content (正文, Markdown格式), category (分类: 校园新闻, 通知公告, 教学动态, 学子风采), coverImage (封面图URL, 使用picsum.photos生成相关的图)。请以JSON数组格式返回。",
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });

      const articles = JSON.parse(response.text);
      const now = new Date().toISOString();
      const batch = db.transaction((arts) => {
        for (const art of arts) {
          const id = Math.random().toString(36).substr(2, 9);
          db.prepare(`
            INSERT INTO articles (id, title, content, summary, coverImage, author, category, isPublished, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(id, art.title, art.content, art.summary, art.coverImage, "AI 助手", art.category, 1, now, now);
        }
      });
      batch(articles);
      res.json({ success: true });
    } catch (error: any) {
      console.error("AI Generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Vite / Static Files ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Bootstrap default admin
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
    if (userCount === 0) {
      const now = new Date().toISOString();
      db.prepare("INSERT INTO users (uid, username, password, displayName, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)").run("admin-uid", "admin", "admin", "系统管理员", "admin", now);
      console.log("Default admin created: admin/admin");
    }
  });
}

startServer();
