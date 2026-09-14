import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

class DatabaseManager {
  private db: Database | null = null;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'database', 'travelsaathi.db');
  }

  async init(): Promise<void> {
    if (this.db) return;

    const SQL = await initSqlJs();
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    if (fs.existsSync(this.dbPath)) {
      const fileBuffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(fileBuffer);
      // Safe schema migration for newly added columns
      try {
        this.db.run("ALTER TABLE restaurants ADD COLUMN food_type TEXT DEFAULT 'both';");
      } catch {}
      try {
        this.db.run("ALTER TABLE users ADD COLUMN mobile_verified INTEGER DEFAULT 0;");
      } catch {}
      try {
        this.db.run("ALTER TABLE profiles ADD COLUMN mobile_number TEXT;");
      } catch {}
      try {
        this.db.run("ALTER TABLE profiles ADD COLUMN mobile_verified INTEGER DEFAULT 0;");
      } catch {}
      try {
        this.db.run(`CREATE TABLE IF NOT EXISTS otps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mobile_number TEXT NOT NULL,
          otp_code TEXT NOT NULL,
          purpose TEXT NOT NULL,
          attempts INTEGER DEFAULT 0,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`);
      } catch {}
      this.save();
    } else {
      this.db = new SQL.Database();
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        this.db.run(schemaSql);
        this.save();
      }
    }
  }

  save(): void {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }

  query<T = any>(sql: string, params: any[] = []): T[] {
    if (!this.db) throw new Error("Database not initialized");
    const cleanParams = params.map((p) => (p === undefined ? null : p));
    const stmt = this.db.prepare(sql);
    try {
      stmt.bind(cleanParams);
      const rows: T[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject() as T);
      }
      return rows;
    } finally {
      stmt.free();
    }
  }

  queryOne<T = any>(sql: string, params: any[] = []): T | null {
    const rows = this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  run(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number } {
    if (!this.db) throw new Error("Database not initialized");
    const cleanParams = params.map((p) => (p === undefined ? null : p));
    const stmt = this.db.prepare(sql);
    try {
      stmt.run(cleanParams);
    } finally {
      stmt.free();
    }

    const res = this.db.exec("SELECT last_insert_rowid() AS id, changes() AS count;");
    const lastInsertRowid = (res[0]?.values[0]?.[0] as number) || 0;
    const changes = (res[0]?.values[0]?.[1] as number) || 0;
    this.save();
    return { changes, lastInsertRowid };
  }

  exec(sql: string): void {
    if (!this.db) throw new Error("Database not initialized");
    this.db.run(sql);
    this.save();
  }
}

export const dbManager = new DatabaseManager();
