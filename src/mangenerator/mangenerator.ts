import { DOMParser, HTMLDocument } from "../deps/deno-dom.ts";
import { Webpage } from "../enums/Webpage.ts";
import { getWebpageEnum } from "../main/get-webpage-enum.ts";

interface Watchable {
    name: string,
    url: string,
    identifier: string
}

const domParser = new DOMParser();
const urlFile = '../../config/lazy-urls.json';

const loadUrlsFromJson = async (): Promise<string[]> => await JSON.parse(await Deno.readTextFile(urlFile)).urls;
const getMangaName = (document: HTMLDocument): string => document.getElementsByTagName('h1')[0].innerText;

async function getUpdatedMangas(): Promise<Watchable[]> {
    const mangaPromises = (await loadUrlsFromJson()).map(async url => {
        const html = await fetch(url);
        const document = <HTMLDocument>domParser.parseFromString(await (html.text()), 'text/html');
        return {
            name: getMangaName(document),
            url: url,
            identifier: ''
        }
    });

    const mangaObjects: Watchable[] = [];
    for (const key in mangaPromises) {
        if (Object.prototype.hasOwnProperty.call(mangaPromises, key)) {
            const manga = await mangaPromises[key];
            const baseUrl = new URL(manga.url).origin
            const webPage = getWebpageEnum(baseUrl);

            switch (webPage) {
                case Webpage.mangakakalot:
                    manga.identifier = "document.getElementsByClassName('row')[1].getElementsByTagName('span')[0]";
                    break;

                case Webpage.manganato:
                case Webpage.readmanganato:
                case Webpage.manganelo:
                    manga.identifier = "document.getElementsByClassName('chapter-name')[0]";
                    break;

                default:
                    console.error(`Case for ${webPage} has not been implemented yet!`);
                    break;
            }
            mangaObjects.push(manga);
        }
    }
    return mangaObjects;
}
function getLegacyMangas(updatedMangaArr: Watchable[]) {
    const legacyMangaObjects = [];
    for (const key in updatedMangaArr) {
        if (Object.prototype.hasOwnProperty.call(updatedMangaArr, key)) {
            const currentUpdatedManga = updatedMangaArr[key];
            const mangaUrl = new URL(currentUpdatedManga.url);
            legacyMangaObjects.push({
                name: currentUpdatedManga.name,
                baseUrl: `${mangaUrl.origin}/`,
                mangaId: mangaUrl.pathname.split('-')[1]
            });
        }
    }
    return legacyMangaObjects;
}

const updatedMangaArr = await getUpdatedMangas();
const outputPath = `../../output`;
await Deno.writeTextFile(`${outputPath}/websites.json`, JSON.stringify(updatedMangaArr, null, 2));
await Deno.writeTextFile(`${outputPath}/manga.json`, JSON.stringify(getLegacyMangas(updatedMangaArr), null, 2));
console.log('Done!')