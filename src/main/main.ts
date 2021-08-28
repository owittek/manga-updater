import { sendDiscordMessage } from "../discord-notifier/discord-notifier.ts";
import { getMangaChapter, getMangaEmbed } from "./manga-updater.ts";
import { logWithTime } from "./log-with-time.ts";
import { getAllMangas, updateMangaChapter } from "./redis-com.ts";

const mangas = await getAllMangas();
logWithTime('Starting!')

const main = () => {
    mangas.forEach(async manga => {
        try {
            const latestChapterObj = await getMangaChapter(manga);
            if (manga.latestChapterName === undefined) {
                await updateMangaChapter(manga, latestChapterObj.chapterName);
            } else if (manga.latestChapterName !== latestChapterObj.chapterName) {
                sendDiscordMessage(
                    getMangaEmbed(latestChapterObj.document, manga, latestChapterObj.webPage, latestChapterObj.chapterElement)
                );
                await updateMangaChapter(manga, latestChapterObj.chapterName);
            } else {
                // console.log(`DEBUG: Waiting for ${manga.name}...`);
            }
        } catch (_typeError) {
            // console.error(typeError);
        }
    });
}

setInterval(main, 3 * 1000);