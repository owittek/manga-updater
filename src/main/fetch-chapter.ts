import { DOMParser, Element, HTMLDocument } from '../deps/deno-dom.ts';
import { Webpage } from "../enums/Webpage.ts";
import { Manga } from "../interfaces/Manga.ts";
import { getWebpageEnum } from "./get-webpage-enum.ts";

export async function fetchChapter(manga: Manga): Promise<string> {
    const webPage = getWebpageEnum(manga.baseUrl);

    if (webPage === undefined) {
        return Promise.reject(`Enum for ${manga.url} has not been implemented yet!`);
    } else {
        const html = await fetch(manga.url);
        const document = <HTMLDocument>new DOMParser().parseFromString(await (html.text()), 'text/html');

        const chapter = parseLatestChapterName(document, webPage);
        if (chapter === undefined) {
            return Promise.reject(`Parser for ${webPage} might be broken!`);
        }
        return chapter;
    }
}

function parseLatestChapterName(document: HTMLDocument, webPage: Webpage): string | undefined {
    let chapterElement: Element | undefined;
    switch (webPage) {
        case Webpage.mangakakalot:
            chapterElement = document.getElementsByClassName('row')[1].getElementsByTagName('span')[0];
            break;

        case Webpage.manganato:
        case Webpage.manganelo:
            chapterElement = document.getElementsByClassName('chapter-name')[0];
            break;

        default:
            console.log(`Case for ${webPage} has not been implemented yet!`);
            break;
    }
    if (chapterElement === undefined) {
        return;
    }
    return chapterElement.innerText.trim();
}