import { redisConnect } from "../deps/redis.ts";
import { Manga } from "../interfaces/Manga.ts";
import { loadMangasFromJson } from "./load-mangas.ts";
import { getWebpageEnum } from "./get-webpage-enum.ts";

const redis = await redisConnect({
    hostname: "127.0.0.1",
    port: 6379,
});

const rexec = redis.executor;

export async function getManga(url: string): Promise<Manga> {
    const reply = await rexec.exec('JSON.GET', url);
    console.log(reply.value());
    return JSON.parse(<string>reply.value());
}

export async function updateMangaChapter(manga: Manga, updatedChapterName: string): Promise<void> {
    manga.latestChapterName = updatedChapterName;
    await setManga(manga);
}

export async function setManga(manga: Manga): Promise<void> {

    const reply = await rexec.exec('JSON.SET', manga.url, '.', JSON.stringify(manga));
    const replyVal = reply.value();
    if (replyVal !== "OK" && replyVal !== "QUEUED") {
        Promise.reject(`Received '${reply.value}' from database`);
    }
}

async function getAllKeys(): Promise<string[]> {
    return await redis.keys('*');
}

export async function getAllMangas(): Promise<Manga[]> {
    const allKeys = await getAllKeys();
    let mangas: Manga[] = [];
    if (allKeys.length > 0) {
        const reply = await rexec.exec('JSON.MGET', ...allKeys, '.');
        const values = <Array<string>>reply.value();
        values.forEach(strObj => mangas.push(JSON.parse(strObj)));
    } else {
        console.log('INITIALIZING DB')
        mangas = await initDb();
        console.log('INIT DONE')
    }
    return mangas;
}

export function flushDatabase() {
    return redis.flushall();
}

async function initDb(): Promise<Manga[]> {
    const mangasFromJson = await loadMangasFromJson();

    redis.multi();
    mangasFromJson.forEach(async manga => {
        manga.url = getWebpageEnum(manga.baseUrl)! + manga.mangaId;
        await setManga(manga);
    });
    redis.exec();
    return mangasFromJson;
}