const {slideTypes, partTypes} = require('./slide-types');

exports.thema = ' ';
const expandable = [
    {type: partTypes.titel, title: 'Welkom'},
    {type: partTypes.lied, song: 'Opwekking 640', verses: [1, 2]},
    {type: partTypes.titel, title: 'Stil gebed'},
    {type: partTypes.votum},
    {type: partTypes.lied, song: 'Opwekking 281 en Psalm 42 : 5 (oude ber.)'},
    {type: partTypes.titel, title: 'Gebed'},
    {type: partTypes.bijbeltekst, text: 'Daniël 3 : 1 - 18'},
    {type: partTypes.lied, song: 'Lied 329', verses: [1, 2, 3]},
    {type: partTypes.titel, title: 'Verkondiging'},
    {type: partTypes.lied, song: 'Psalm 42', verses: [5]},
    {type: partTypes.titel, title: 'Gebed'},
    {type: partTypes.collecte},
    {type: partTypes.lied, song: 'Lied 409', verses: [1, 3]},
    {type: partTypes.titel, title: 'Geloofsbelijdenis'},
    {type: partTypes.lied, song: 'Lied 409', verses: [4]},
    {type: partTypes.titel, title: 'Zegen'},
    {type: partTypes.lied, title: 'Amenlied', song: 'Lied 409', verses: [5]},
];
const ochtend = false;
const collectenGKv = ['Diaconie', 'Rente en aflossing', 'Jeugdbeleid', 'Rente en aflossing'];
const collectenNGK = ['NGK 1', 'NGK 2', 'NGK 3', 'NGK 4'];

// Mapping functions
function mapToSlide(part) {
    switch (part.type) {
        case partTypes.titel:
            return [{type: slideTypes.titel, title: part.title}];
        case partTypes.votum:
            return [{type: slideTypes.votum, title: part.title || 'Votum en vredegroet', vredegroet: part.vredegroet || 'vredegroet'}];
        case partTypes.lied:
            if (part.verses) {
                return part.verses.map((verse) => {
                    return {type: slideTypes.notenbalk, title: part.title || 'Zingen', song: part.song || '', verses: part.verses, active: verse};
                });
            } else {
                return [{type: slideTypes.notenbalk, title: part.title || 'Zingen', song: part.song || '', verses: []}];
            }
        case partTypes.bijbeltekst:
            return [{type: slideTypes.bijbeltekst, title: part.title || 'Lezen', text: part.text}];
        case partTypes.collecte:
            if (ochtend) {
                return [{type: slideTypes.collecteOchtend, title: part.title || 'Collecte', collectenGKv: collectenGKv}];
            } else {
                return [{type: slideTypes.collecteMiddag, collectenGKv: collectenGKv, collectenNGK: collectenNGK}];
            }
        case partTypes.zegen:
            return [{type: slideTypes.zegen, title: part.zegen || 'Zegen'}];
        default:
            return [];
    }
}

function mapWithEmpty(part) {
    return [{type: slideTypes.liturgie}, ...mapToSlide(part)];
}

function mapToLiturgie(part) {
    if (part.liturgie) {
        if (Array.isArray(part.liturgie)) {
            return part.liturgie;
        } else {
            return [part.liturgie];
        }
    }
    switch (part.type) {
        case partTypes.titel:
            return [part.title];
        case partTypes.votum:
            return [part.title || 'Votum en vredegroet'];
        case partTypes.lied:
            let title = '';
            if (part.title && part.title !== 'Zingen') {
                title += part.title;
                if (part.song) title += ': ';
            }
            if (part.song) title += part.song;
            if (part.verses) title += ' : ' + part.verses.join(', ');
            return [title];
        case partTypes.bijbeltekst:
            return [(part.title || 'Lezen') + (part.text ? ': ' + part.text : '')];
        case partTypes.collecte:
            return [part.title || 'Collecte'];
        case partTypes.zegen:
            return [part.zegen || 'Zegen'];
        default:
            return [];
    }
}

// Map it
exports.slides = [
    {type: slideTypes.welkom, vooraf: true},
    {type: slideTypes.liturgie, vooraf: true},
    {type: slideTypes.kerkdienstgemist, vooraf: true},
    {type: slideTypes.parkeren, vooraf: true},
    ...expandable.flatMap(mapWithEmpty),
    {type: ochtend ? slideTypes.totZiensOchtend : slideTypes.totZiensMiddag, vooraf: false}
];
exports.liturgie = [
    ...expandable.flatMap(mapToLiturgie),
];
