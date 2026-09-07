import type { SearchResult } from "../types/navigation";

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";

export async function searchPlaces(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];
  const url = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(trimmed)}&format=jsonv2&limit=5`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Minimapp/0.1 (development build)" },
  });
  if (!response.ok) throw new Error(`Search failed (${response.status})`);
  const body = (await response.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;
  return body.map((item) => ({
    coordinate: [parseFloat(item.lon), parseFloat(item.lat)],
    label: item.display_name,
  }));
}
