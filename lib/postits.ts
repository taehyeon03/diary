import "server-only";
import { randomUUID } from "crypto";
import { getStore } from "./store";
import { getWeather, weatherFactor } from "./weather";
import { sampleFallAt, stageOf } from "./adhesion";
import { pickColor, pickPosition, pickRotation } from "./paper";
import type { PostitRecord, PublicPostit } from "./types";

export const MAX_TEXT = 200;
export const MAX_AUTHOR = 20;

export function toPublic(p: PostitRecord, now = Date.now()): PublicPostit {
  return {
    id: p.id,
    kind: p.kind,
    text: p.text,
    author: p.author,
    color: p.color,
    rotation: p.rotation,
    x: p.x,
    y: p.y,
    stage: stageOf(p.createdAt, p.fallAt, now),
  };
}

export async function listWall(): Promise<PublicPostit[]> {
  const now = new Date();
  const records = await getStore().listOnWall(now);
  return records.map((p) => toPublic(p, now.getTime()));
}

export async function createPostit(text: string, author: string | null): Promise<PublicPostit> {
  const store = getStore();
  const now = new Date();
  const [onWall, weather] = await Promise.all([store.listOnWall(now), getWeather()]);
  const record: PostitRecord = {
    id: randomUUID(),
    kind: "text",
    text,
    author,
    color: pickColor(),
    rotation: pickRotation(),
    ...pickPosition(onWall),
    weatherCode: weather.code,
    humidity: weather.humidity,
    createdAt: now.toISOString(),
    fallAt: sampleFallAt(now, weatherFactor(weather)).toISOString(),
    removed: false,
  };
  await store.insert(record);
  return toPublic(record, now.getTime());
}
