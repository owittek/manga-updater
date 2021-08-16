import { sendDiscordMessage } from "../discord-notifier/discord-notifier.ts";
import { fetchChapter } from "./fetch-chapter.ts";
import { logWithTime } from "./log-with-time.ts";
import { flushDatabase, getAllMangas, updateMangaChapter } from "./redis-com.ts";

const main = async (flushDb?: boolean) => {
    if (flushDb === true) {
        await flushDatabase();
    }
    const mangas = await getAllMangas();
    logWithTime('Starting!')
    setInterval(() => {

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
    }, 30 * 1000);
}

await main();