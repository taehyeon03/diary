import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { PostitRecord } from "./types";
import { DEFAULT_WALL_MESSAGES } from "./easter";

export interface PostitStore {
  /** 아직 벽에 붙어 있는 포스트잇 */
  listOnWall(now: Date): Promise<PostitRecord[]>;
  insert(p: PostitRecord): Promise<void>;
  /** 이스터에그: 떨어진 포스트잇 뒤 벽에 적힌 문구들 */
  listWallMessages(): Promise<string[]>;
}

// ── 로컬 개발용: data/postits.json ─────────────────────────────
class FileStore implements PostitStore {
  private file = path.join(process.cwd(), "data", "postits.json");
  private queue: Promise<unknown> = Promise.resolve();

  private async readAll(): Promise<PostitRecord[]> {
    try {
      return JSON.parse(await fs.readFile(this.file, "utf8"));
    } catch {
      return [];
    }
  }

  async listOnWall(now: Date) {
    const all = await this.readAll();
    return all.filter((p) => !p.removed && new Date(p.fallAt) > now);
  }

  insert(p: PostitRecord) {
    const run = this.queue.then(async () => {
      const all = await this.readAll();
      all.push(p);
      await fs.mkdir(path.dirname(this.file), { recursive: true });
      await fs.writeFile(this.file, JSON.stringify(all, null, 2));
    });
    this.queue = run.catch(() => {});
    return run;
  }

  async listWallMessages() {
    return DEFAULT_WALL_MESSAGES;
  }
}

// ── 배포용: Supabase ──────────────────────────────────────────
type Row = {
  id: string;
  kind: "text";
  text: string;
  author: string | null;
  color: string;
  rotation: number;
  pos_x: number;
  pos_y: number;
  weather_code: number | null;
  humidity: number | null;
  created_at: string;
  fall_at: string;
  removed: boolean;
};

const fromRow = (r: Row): PostitRecord => ({
  id: r.id,
  kind: r.kind,
  text: r.text,
  author: r.author,
  color: r.color,
  rotation: r.rotation,
  x: r.pos_x,
  y: r.pos_y,
  weatherCode: r.weather_code,
  humidity: r.humidity,
  createdAt: r.created_at,
  fallAt: r.fall_at,
  removed: r.removed,
});

class SupabaseStore implements PostitStore {
  constructor(private db: SupabaseClient) {}

  async listOnWall(now: Date) {
    const { data, error } = await this.db
      .from("postits")
      .select("*")
      .eq("removed", false)
      .gt("fall_at", now.toISOString())
      .order("created_at");
    if (error) throw error;
    return (data as Row[]).map(fromRow);
  }

  async insert(p: PostitRecord) {
    const row: Row = {
      id: p.id,
      kind: p.kind,
      text: p.text,
      author: p.author,
      color: p.color,
      rotation: p.rotation,
      pos_x: p.x,
      pos_y: p.y,
      weather_code: p.weatherCode,
      humidity: p.humidity,
      created_at: p.createdAt,
      fall_at: p.fallAt,
      removed: p.removed,
    };
    const { error } = await this.db.from("postits").insert(row);
    if (error) throw error;
  }

  async listWallMessages() {
    const { data, error } = await this.db
      .from("easter_messages")
      .select("message")
      .eq("active", true)
      .order("id");
    if (error || !data?.length) return DEFAULT_WALL_MESSAGES;
    return data.map((r: { message: string }) => r.message);
  }
}

let store: PostitStore | null = null;

export function getStore(): PostitStore {
  if (store) return store;
  const url = process.env.SUPABASE_URL;
  // 새 Supabase 프로젝트는 "secret key"(sb_secret_...), 예전 프로젝트는 service_role 키
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  store = url && key
    ? new SupabaseStore(createClient(url, key, { auth: { persistSession: false } }))
    : new FileStore();
  return store;
}
