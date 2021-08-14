import { DOMParser, HTMLDocument } from "../deps/deno-dom.ts";


interface Manga {
    name: string,
    url: string,
    identifier: string
}

const domParser = new DOMParser();
const urlFile = '../../config/lazy-urls.json';

const getJsonFromUrls = async (): Promise<string[]> => {
    return await JSON.parse(await Deno.readTextFile(urlFile)).urls;
}
const getMangaName = (document: HTMLDocument): string => {
    return document.getElementsByTagName('h1')[0].innerText;
}
const getManga = async (url: string): Promise<Manga> => {
    const html = await fetch(url);
    const document = <HTMLDocument>domParser.parseFromString(await (html.text()), 'text/html');
    return {
        name: getMangaName(document),
        url: url,
        identifier: ''
    }
}

const mangaPromises = (await getJsonFromUrls()).map(url => {
    const manga = getManga(url);
    return manga;
});

const mangaObjects: Manga[] = [];
for (const key in mangaPromises) {
    if (Object.prototype.hasOwnProperty.call(mangaPromises, key)) {
        mangaObjects.push(await mangaPromises[key]);
    }
}

await Deno.writeTextFile(`../../output/websites.json`, JSON.stringify(mangaObjects, null, 2));