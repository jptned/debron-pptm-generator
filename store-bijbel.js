const boeken = require('./boeken.json');
const fs = require("fs");

let fetchable = [];
for (const testament of boeken.testaments) {
    for (const book of testament.books) {
        for (const chapter of book.chapters) {
            fetchable.push(chapter.id);
        }
    }
}
let index = 0;

function name(item, name) {
    return item.hasOwnProperty('name') && item.name === name;
}

function type(item, name) {
    return item.hasOwnProperty('type') && item.type === name;
}

function attr(item, attr, val) {
    return item.hasOwnProperty('attrs') && item.attrs.hasOwnProperty(attr) && item.attrs[attr] === val;
}

function style(item, val) {
    return attr(item, 'style', val);
}

function parseRecursive(items, curChapter, verses, curState) {
    for (let item of items) {
        if (name(item, 'chapter')) {

        } else if (style(item, 's')) {
            curState.tussenkopje = item.items.map(s => s.text).join('');
        } else if (style(item, 'b')) {
            curState.blank = true
        } else if (name(item, 'para')) {
            curState.startParagraph = true;
            parseRecursive(item.items, curChapter, verses, curState);
        } else if (name(item, 'verse')) {
            curState.curVerse = parseInt(item.attrs.number.split('-')[0]);
            curState.curVerseDisplay = item.attrs.number;
        } else if (type(item, 'text')) {
            if (verses.hasOwnProperty(curState.curVerse)) {
                if (curState.blank) {
                    verses[curState.curVerse].push({
                        type: 'blank'
                    });
                }
                verses[curState.curVerse].push({
                    type: 'text',
                    text: item.text,
                    startParagraph: curState.startParagraph
                });
                curState.blank = false;
                curState.startParagraph = false;
            } else {
                verses[curState.curVerse] = [
                    {
                        type: 'number',
                        text: curState.curVerseDisplay,
                        startParagraph: curState.startParagraph
                    },
                    {
                        type: 'text',
                        text: item.text,
                        startParagraph: false
                    }
                ];
                if (curState.tussenkopje) {
                    verses[curState.curVerse].unshift({
                        type: 'heading',
                        text: curState.tussenkopje
                    });
                }
                if (curState.blank) {
                    verses[curState.curVerse].unshift({
                        type: 'blank'
                    });
                }
                curState.tussenkopje = null;
                curState.startParagraph = false;
                curState.blank = false;
            }
        } else if (name(item, 'char')) {
            parseRecursive(item.items, curChapter, verses, curState);
        } else {
            debugger;
        }
    }
}

function saveChapter() {
    const vIndex = index + 1;
    if (index >= fetchable.length) {
        return;
    }

    const curChapter = fetchable[index];
    const fileName = './bijbel/' + curChapter + '.json';
    if (fs.existsSync(fileName)) {
        console.log("[" + vIndex + "/" + fetchable.length + "] Storing " + curChapter + "");
        const bookInfo = JSON.parse(fs.readFileSync(fileName, 'UTF-8'));

        let verses = {};

        let curState = {
            curVerse: 0,
            curVerseDisplay: '0',
            startParagraph: true,
            tussenkopje: null,
            blank: false,
        }

        parseRecursive(bookInfo.content, curChapter, verses, curState);

        const writeDb = './bijbel-database/' + curChapter + '.json';
        fs.writeFileSync(writeDb, JSON.stringify(verses));
    } else {
        console.error("[" + vIndex + "/" + fetchable.length + "] " + curChapter + " not found");
    }

    index++;
    saveChapter();
}

saveChapter();
