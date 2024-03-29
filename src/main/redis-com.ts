import { redisConnect } from "../deps/redis.ts";
import { Webpage } from "../enums/Webpage.ts";
import { Manga } from "../interfaces/Manga.ts";
import { loadMangasFromJson } from "./load-mangas.ts";

const redis = await redisConnect({
  hostname: "127.0.0.1",
  port: 6379,
});

const rexec = redis.executor;

export async function getManga(url: string): Promise<Manga> {
  const reply = await rexec.exec("JSON.GET", url);
  return JSON.parse(<string> reply.value());
}

export async function updateMangaChapter(
  manga: Manga,
  updatedChapterName: string,
): Promise<void> {
  manga.latestChapterName = updatedChapterName;
  await setManga(manga);
}

export async function setManga(manga: Manga): Promise<void> {
  const reply = await rexec.exec(
    "JSON.SET",
    manga.url,
    ".",
    JSON.stringify(manga),
  );
  const replyVal = reply.value();
  if (replyVal !== "OK" && replyVal !== "QUEUED") {
    return Promise.reject(`Received '${reply.value}' from database`);
  }
}

export async function getAllMangas(): Promise<Manga[]> {
  const localMangas = await loadMangasFromJson();
  const allKeys = await getAllKeys();
  const mangas: Manga[] = [];

  if (allKeys.length > 0) {
    mangas.push(...await synchronizeLocalOnlyManga(localMangas));
    const dbManga = await loadDbMangas(allKeys);
    const pl = redis.pipeline();
    dbManga.filter((manga) => manga.latestChapterName === undefined).forEach(
      (manga) => {
        console.warn(`${manga} has undefined Chapter in DB, deleting ...`);
        pl.del(manga.url);
      },
    );
    await pl.flush();
    mangas.push(...dbManga);
  } else {
    mangas.push(
      ...await initDb(localMangas).then((allMangas) => {
        console.log(
          `${
            new Date().toLocaleTimeString("de-DE")
          }: DB initialized successfully`,
        );
        return allMangas;
      }),
    );
  }
  return mangas;
}

export function flushDatabase() {
  return redis.flushall();
}

async function synchronizeLocalOnlyManga(
  localManga?: Manga[],
  allKeys?: string[],
): Promise<Manga[]> {
  if (localManga === undefined) {
    localManga = await loadMangasFromJson();
  }
  if (allKeys === undefined) {
    allKeys = await getAllKeys();
  }

  const keyMap = new Map<string, undefined>();
  allKeys.forEach((key) => keyMap.set(key, undefined));
  const localOnlyManga: Manga[] = [];

  localManga.forEach(async (manga) => {
    if (keyMap.has(manga.url) === false) {
      if (Object.values<string>(Webpage).includes(manga.url)) {
        localOnlyManga.push(manga);
        await setManga(manga);
      } else {
        console.warn(`${manga.url} is invalid (Manga: ${manga.name})`);
      }
    }
  });
  return localOnlyManga;
}

async function getAllKeys(): Promise<string[]> {
  return await redis.keys("*");
}

async function loadDbMangas(dbKeys: string[]): Promise<Manga[]> {
  const dbOnlyManga: Manga[] = [];
  const reply = await rexec.exec("JSON.MGET", ...dbKeys, ".");
  const values = <Array<string>> reply.value();
  values.forEach((strObj) => dbOnlyManga.push(JSON.parse(strObj)));
  return dbOnlyManga;
}

async function initDb(localManga: Manga[]): Promise<Manga[]> {
  await redis.multi();
  localManga.forEach(async (manga) => await setManga(manga));
  await redis.exec();
  return localManga;
}
