import { NextResponse } from "next/server";
import { createPostit, listWall, MAX_AUTHOR, MAX_TEXT } from "@/lib/postits";
import { StoreNotConfiguredError } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ postits: await listWall() });
}

export async function POST(req: Request) {
  let body: { text?: unknown; author?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const author = typeof body.author === "string" ? body.author.trim() : "";
  if (!text) return NextResponse.json({ error: "빈 포스트잇은 붙일 수 없어요." }, { status: 400 });
  if (text.length > MAX_TEXT)
    return NextResponse.json({ error: `${MAX_TEXT}자까지 쓸 수 있어요.` }, { status: 400 });
  if (author.length > MAX_AUTHOR)
    return NextResponse.json({ error: `이름은 ${MAX_AUTHOR}자까지예요.` }, { status: 400 });

  try {
    const postit = await createPostit(text, author || null);
    return NextResponse.json({ postit }, { status: 201 });
  } catch (e) {
    if (e instanceof StoreNotConfiguredError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    console.error(e);
    return NextResponse.json({ error: "붙이지 못했어요. 잠시 뒤에 다시 해 주세요." }, { status: 500 });
  }
}
