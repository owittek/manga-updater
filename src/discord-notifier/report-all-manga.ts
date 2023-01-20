// deno-lint-ignore-file
import { sendSimpleDiscordMessage } from "../discord-notifier/discord-notifier.ts";
import { getAllMangas } from "../main/redis-com.ts";

const mangas = await getAllMangas();
let mangaStr = 'Manga List:\n\n';

mangas.forEach(manga => mangaStr = mangaStr.concat(`${manga.name} - ${manga.latestChapterName}\n`));
await sendSimpleDiscordMessage(mangaStr)