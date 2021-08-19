import { sendDiscordMessage } from "../discord-notifier/discord-notifier.ts";
import { fetchChapter } from "./fetch-chapter.ts";
import { logWithTime } from "./log-with-time.ts";
import { getAllMangas, updateMangaChapter } from "./redis-com.ts";

const mangas = await getAllMangas();
logWithTime('Starting!')

const main = () => {
    mangas.forEach(async manga => {
        try {
            const latestChapterName = await fetchChapter(manga);
            if (manga.latestChapterName === undefined) {
                await updateMangaChapter(manga, latestChapterName);
            } else if (manga.latestChapterName !== latestChapterName) {
                const message = `${latestChapterName} of '${manga.name}' has just dropped!`;
                logWithTime(message);
                await sendDiscordMessage({
                    title: message,
                    url: manga.url,
                    color: 5814783
                });
                await updateMangaChapter(manga, latestChapterName);
            } else {
                // console.log(`DEBUG: Waiting for ${manga.name}...`);
            }
        } catch (_typeError) {
            // console.error(typeError);
        }
    });
}

main();
setInterval(() => main(), 30 * 1000);