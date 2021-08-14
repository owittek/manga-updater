// deno-lint-ignore-file

import { sendDiscordMessage } from "./discord-notifier/discord-notifier.ts";
import { getManga, updateMangaChapter } from "./main/redis-com.ts";
const date = new Date();
const logWithTime = (message: string) => console.log(`%c${date.toLocaleTimeString('de-DE')}:`, 'color: green', message);
// updateMangaChapter({
//     name: "Tsuki ga Michibiku Isekai Douchuu",
//     url: "https://mangakakalot.com/",
//     mangaId: "kg6sn158504832577",
//     latestChapterName: ''
// }, 'Chapter 65')
const manga = await getManga('https://mangakakalot.com/read-kg6sn158504832577');
const message = `${manga.latestChapterName} of '${manga.name}' has just dropped!`;
logWithTime(message);
//console.log(
await sendDiscordMessage({
    title: message,
    url: 'https://mangakakalot.com/read-kg6sn158504832577',
    color: 5814783
})
//);