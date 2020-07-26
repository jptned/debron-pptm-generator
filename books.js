const boeken = require('./boeken.json');

// let fetchable = {};
// for (const testament of boeken.testaments) {
//     fetchable[testament.code] = [];
//     for (const book of testament.books) {
//         fetchable[testament.code].push({
//             id: book.id,
//             name: book.name,
//             // chapters: book.chapters.length
//         });
//     }
// }

let fetchable = {};
for (const testament of boeken.testaments) {
    for (const book of testament.books) {
        fetchable[book.id] = book.name;
    }
}

console.log(JSON.stringify(fetchable))
