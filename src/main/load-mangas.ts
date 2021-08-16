import { Manga } from "../interfaces/Manga.ts";
import { getWebpageEnum } from "./get-webpage-enum.ts";

export async function loadMangasFromJson(): Promise<Manga[]> {
    return JSON.parse(await Deno.readTextFile('../../config/manga.json'));
}

export function setMangaUrl(...localManga: Manga[]): Manga[] {
    localManga.forEach(manga => manga.url = getWebpageEnum(manga.baseUrl)! + manga.mangaId);
    return localManga;
}