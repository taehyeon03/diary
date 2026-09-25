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

// 테이블에 직접 접근하지 않고 DB 함수(supabase/functions.sql)만 호출한다.
// 함수가 값을 검사하므로 공개용(publishable) 키로도 안전하다.
class SupabaseStore implements PostitStore {
  constructor(private db: SupabaseClient) {}

  async listOnWall() {
    const { data, error } = await this.db.rpc("wall_postits");
    if (error) throw error;
    return (data as Row[]).map(fromRow);
  }

  async insert(p: PostitRecord) {
    const { error } = await this.db.rpc("insert_postit", {
      p_id: p.id,
      p_text: p.text,
      p_author: p.author,
      p_color: p.color,
      p_rotation: p.rotation,
      p_x: p.x,
      p_y: p.y,
      p_weather_code: p.weatherCode,
      p_humidity: p.humidity,
      p_fall_at: p.fallAt,
    });
    if (error) throw error;
  }

  async listWallMessages() {
    const { data, error } = await this.db.rpc("wall_messages");
    if (error || !data?.length) return DEFAULT_WALL_MESSAGES;
    return data as string[];
  }
}

// ── 배포됐는데 Supabase가 아직 없을 때: 벽은 비어 보이고, 붙이기는 안내 문구로 거절 ──
export class StoreNotConfiguredError extends Error {
  constructor() {
    super("아직 벽이 준비 중이에요. 조금만 기다려 주세요.");
  }
}

class NotConfiguredStore implements PostitStore {
  async listOnWall() {
    return [];
  }
  async insert(): Promise<void> {
    throw new StoreNotConfiguredError();
  }
  async listWallMessages() {
    return DEFAULT_WALL_MESSAGES;
  }
}

let store: PostitStore | null = null;

export function getStore(): PostitStore {
  if (store) return store;
  const url = process.env.SUPABASE_URL;
  // 공개용 키(sb_publishable_...)면 충분하다. secret/service_role 키도 쓸 수 있다.
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    store = new SupabaseStore(createClient(url, key, { auth: { persistSession: false } }));
  } else if (process.env.VERCEL) {
    // Vercel에서는 파일에 저장할 수 없다
    console.warn("SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY 가 설정되지 않았습니다.");
    store = new NotConfiguredStore();
  } else {
    store = new FileStore();
  }
  return store;
}
