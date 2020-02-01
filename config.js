const {slideTypes, partTypes} = require('./slide-types');

exports.thema = 'Themaregel';
const expandable = [
    { type: partTypes.titel, title: 'Welkom' },
    { type: partTypes.lied, lied: 'Lied 123' },
    { type: partTypes.bijbeltekst }
];
const ochtend = true;
const collectenGKv = ['GKv 1', 'GKv 2', 'GKv 3', 'GKv 4'];
const collectenNGK = ['NGK 1', 'NGK 2', 'NGK 3', 'NGK 4'];

// Mapping functions
function mapToSlide(part) {
    switch (part.type) {
        case partTypes.titel:
            break;
        case partTypes.lied:
            break;
        case partTypes.bijbeltekst:
            break;
    }
}

// Map it
exports.slides = [
    { type: slideTypes.welkom, vooraf: true },
    { type: slideTypes.liturgie, vooraf: true },
    { type: slideTypes.kerkdienstgemist, vooraf: true },
    { type: slideTypes.parkeren, vooraf: true },
    { type: slideTypes.titel, vooraf: false, title: 'Welkom en mededelingen' },
    { type: slideTypes.votum, title: 'Votum en vredegroeten', vredegroet: 'Groet' },
    { type: slideTypes.notenbalk, vooraf: false, title: 'Zingen', song: 'Lied 123', verses: [1, 2, 4], active: 1 },
    { type: slideTypes.notenbalk, vooraf: false, title: 'Zingen', song: 'Lied 123', verses: [1, 2, 4], active: 2 },
    { type: slideTypes.notenbalk, vooraf: false, title: 'Zingen', song: 'Lied 123', verses: [1, 2, 4], active: 4 },
    { type: slideTypes.notenbalk, vooraf: false, title: 'Zingen', song: 'Lied 456', verses: [1, 2, 3], active: 4 },
    { type: slideTypes.notenbalk, vooraf: false, title: 'Zingen', song: 'Lied 789', verses: [1, 2], active: 2 },
    { type: slideTypes.notenbalk, vooraf: false, title: 'Zingen', song: 'Lied 0', verses: [1], active: 1 },
    { type: slideTypes.collecteOchtend, title: 'Collecte', collectenGKv: collectenGKv },
    { type: slideTypes.collecteMiddag, title: 'Collecte', collectenGKv: collectenGKv, collectenNGK: collectenNGK },
    { type: slideTypes.bijbeltekst, title: 'Lezen' },
    { type: slideTypes.totZiensOchtend, vooraf: false }
];
exports.liturgie = [
    'Welkom',
    'Regel 2',
    'Regel 3',
    'Regel 4',
    'Regel 5',
    'Regel 6',
    'Regel 7',
    'Regel 8',
    'Regel 9',
    'Regel 10',
    'Regel 11',
    'Regel 12',
    'Zegen',
];
