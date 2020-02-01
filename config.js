const {slideTypes} = require('./slide-types');

exports.thema = 'Themaregel';
exports.slides = [
    { type: slideTypes.welkom, vooraf: true },
    { type: slideTypes.liturgie, vooraf: true },
    { type: slideTypes.kerkdienstgemist, vooraf: true },
    { type: slideTypes.parkeren, vooraf: true },
    { type: slideTypes.titel, vooraf: false, title: 'Welkom en mededelingen' },
    { type: slideTypes.notenbalk, vooraf: false, title: 'Zingen', song: 'Lied 123', verses: [1, 2, 4], active: 1 },
    { type: slideTypes.notenbalk, vooraf: false, title: 'Zingen', song: 'Lied 123', verses: [1, 2, 4], active: 2 },
    { type: slideTypes.notenbalk, vooraf: false, title: 'Zingen', song: 'Lied 123', verses: [1, 2, 4], active: 4 },
    { type: slideTypes.notenbalk, vooraf: false, title: 'Zingen', song: 'Lied 456', verses: [1, 2, 3], active: 4 },
    { type: slideTypes.notenbalk, vooraf: false, title: 'Zingen', song: 'Lied 789', verses: [1, 2], active: 2 },
    { type: slideTypes.notenbalk, vooraf: false, title: 'Zingen', song: 'Lied 0', verses: [1], active: 1 },
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
