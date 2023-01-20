import { Manga } from "../interfaces/Manga.ts";

export async function loadMangasFromJson(): Promise<Manga[]> {
  return JSON.parse(await Deno.readTextFile("../../config/manga.json"));
}
