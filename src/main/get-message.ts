import { Manga } from "../interfaces/Manga.ts";

export function getMessage(manga: Manga, latestChapterName: string): string {
    return `${latestChapterName} of '${manga.name}' has just dropped!`;
}