// 광주광역시 기준 날씨 (Open-Meteo, 무료·키 없음)
const GWANGJU = { latitude: 35.16, longitude: 126.85 };
const CACHE_MS = 10 * 60 * 1000;

export type Weather = {
  code: number | null;
  humidity: number | null;
  temperature: number | null;
};

const UNKNOWN: Weather = { code: null, humidity: null, temperature: null };
let cache: { at: number; value: Weather } | null = null;

export async function getWeather(): Promise<Weather> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.value;
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${GWANGJU.latitude}` +
    `&longitude=${GWANGJU.longitude}` +
    `&current=weather_code,relative_humidity_2m,temperature_2m&timezone=Asia%2FSeoul`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2500), cache: "no-store" });
    if (!res.ok) return UNKNOWN;
    const json = await res.json();
    const value: Weather = {
      code: json.current?.weather_code ?? null,
      humidity: json.current?.relative_humidity_2m ?? null,
      temperature: json.current?.temperature_2m ?? null,
    };
    cache = { at: Date.now(), value };
    return value;
  } catch {
    // 날씨를 못 가져와도 포스트잇은 "보통 날씨"로 붙는다
    return UNKNOWN;
  }
}

/** WMO 날씨 코드 → 접착력 계수 */
export function weatherFactor(w: Weather): number {
  const { code, humidity, temperature } = w;
  if (code === null) return 1.0;
  const isRain = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;
  const isSnow = (code >= 71 && code <= 77) || code === 85 || code === 86;
  if (isRain) return 0.6;
  if (isSnow || (temperature !== null && temperature <= -5)) return 0.7;
  if (humidity !== null && humidity >= 80) return 0.8;
  if (code <= 1 && (humidity === null || humidity < 60)) return 1.3;
  return 1.0;
}
