import { sendDiscordMessage } from "../discord-notifier/discord-notifier.ts";
import { getChapterName, getDOM, getMangaEmbed } from "./manga-updater.ts";
import { getAllMangas, updateMangaChapter } from "./redis-com.ts";
import { Manga } from "../interfaces/Manga.ts";

const intervalInSecs = 30;
const mangas = await getAllMangas();

const main = () => {
  mangas.forEach((manga: Manga, index: number) => {
    setTimeout(async () => {
      try {
        const dom = await getDOM(manga.url);
        const chapterName = getChapterName(dom, manga.url);
        if (manga.latestChapterName === undefined) {
          await updateMangaChapter(manga, chapterName);
        } else if (manga.latestChapterName !== chapterName) {
          try {
            await sendDiscordMessage(
              getMangaEmbed(dom, manga),
            );
            await updateMangaChapter(manga, chapterName);
          } catch (error) {
            console.warn(`Failed sending update for ${manga.name}`);
          }
        } else {
          console.log(
            `${new Date().toLocaleTimeString("de-DE")}: %c${manga.name}`,
            "color: green",
            "fetched...",
          );
        }
      } catch (_typeError) {
        //console.error(typeError);
      }
    }, index * intervalInSecs * 1000 / mangas.length);
  });
};

main();
setInterval(main, intervalInSecs * 1000);
