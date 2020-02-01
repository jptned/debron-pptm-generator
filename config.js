const {slideTypes, partTypes} = require('./slide-types');

exports.thema = 'Ra, ra, wie ben ik?';
const expandable = [
    {type: partTypes.titel, title: 'Welkom'},
    {type: partTypes.lied, song: '\'Votum en groet\''},
    {type: partTypes.lied, song: '\'Met open armen\''},
    {type: partTypes.lied, song: '\'In U weet ik wie ik ben\''},
    {type: partTypes.bijbeltekst, title: 'Wetslezing', text: 'Galaten 5 : 13 - 25'},
    {type: partTypes.lied, song: 'Opwekking 811', verses: [1, 2]},
    {type: partTypes.titel, title: 'Gebed'},
    {type: partTypes.lied, song: 'Kinderopwekking 77'},
    {type: partTypes.titel, title: 'Kindermoment'},
    {type: partTypes.bijbeltekst, title: 'Tekst', text: 'Genesis 26 : 34 - 27 : 41'},
    {type: partTypes.lied, song: 'DNP Psalm 36', verses: [1]},
    {type: partTypes.titel, title: 'Verkondiging'},
    {type: partTypes.lied, song: 'Opwekking 599', verses: [1, 2, 3]},
    {type: partTypes.titel, title: 'Gebed'},
    {type: partTypes.collecte},
    {type: partTypes.lied, song: 'Opwekking 710', verses: [1, 2]},
    {type: partTypes.titel, title: 'Zegen'},
    {type: partTypes.lied, title: 'Amen', song: 'Lied 456', verses: [4]},
];
const ochtend = true;
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
