const axios = require('axios').default;
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

function loadChapter() {
    const vIndex = index + 1;
    if (index >= fetchable.length) {
        return;
    }

    const curChapter = fetchable[index];
    const fileName = './bijbel/' + curChapter + '.json';
    if (fs.existsSync(fileName)) {
        console.log("[" + vIndex + "/" + fetchable.length + "] " + curChapter + " already loaded");
        index++;
        loadChapter();
        return;
    }

    axios.get(
        "https://ibep.ubscloud.org/bibles/a31452bf933bcd2d-01/chapters/" + curChapter, {
            params: {
                'content-type': 'json',
                'include-chapter-numbers': true,
                'include-verse-numbers': true,
                'include-notes': false,
                'include-titles': true
            },
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "en-US,en;q=0.5",
                "user-token": "anonymous",
                "brand-id": "NBG",
                "x-api-key": "896f6f87-fc95-4605-b782-804b99b83800"
            },
            referrer: "https://debijbel.nl",
            mode: "cors"
        }
    ).then(function (response) {
        console.log("[" + vIndex + "/" + fetchable.length + "] Loading " + curChapter);
        fs.writeFileSync(fileName, JSON.stringify(response.data.data));

        index++;
        loadChapter();
    }).catch(function(error) {
        console.log("[" + vIndex + "/" + fetchable.length + "] Error when loading " + curChapter);
        console.error(error);
    });
}

loadChapter();
