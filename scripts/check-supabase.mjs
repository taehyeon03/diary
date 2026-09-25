// Supabase 연결 확인: npm run check:supabase
// .env.local 의 SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY 를 읽어 DB 함수가 준비됐는지 본다.
import { readFileSync, existsSync } from "fs";
import { createClient } from "@supabase/supabase-js";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const url = process.env.SUPABASE_URL;
const key =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("✗ SUPABASE_URL 과 SUPABASE_PUBLISHABLE_KEY 를 .env.local 에 넣어 주세요.");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });
let ok = true;
for (const fn of ["wall_postits", "wall_messages"]) {
  const { data, error } = await db.rpc(fn);
  if (error) {
    ok = false;
    console.error(`✗ ${fn}: ${error.message}`);
  } else {
    console.log(`✓ ${fn} (${data.length}개)`);
  }
}
if (!ok) {
  console.error("\nsupabase/schema.sql, supabase/functions.sql 을 SQL Editor 에서 실행했는지 확인해 주세요.");
  process.exit(1);
}
console.log("\n연결 완료! 이제 npm run dev 로 실행하면 Supabase 에 저장됩니다.");
