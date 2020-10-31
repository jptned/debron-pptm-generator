const {slideTypes, partTypes} = require('./slide-types');

// Mapping functions
function mapToSlide(part, ochtend, collectenGKv, collectenNGK) {
    switch (part.type) {
        case partTypes.titel:
            return [{type: slideTypes.titel, title: part.title}];
        case partTypes.votum:
            return [{type: slideTypes.votum, title: part.title || 'Votum en vredegroet', vredegroet: part.vredegroet || 'vredegroet'}];
        case partTypes.lied:
            if (part.verses.length) {
                return part.verses.map((verse) => {
                    return {type: slideTypes.notenbalk, title: part.title || 'Zingen', song: part.song || '', verses: part.verses, active: verse};
                });
            } else {
                return [{type: slideTypes.notenbalk, title: part.title || 'Zingen', song: part.song || '', verses: []}];
            }
        case partTypes.bijbeltekst:
            return [{type: slideTypes.bijbeltekst, title: part.title || 'Lezen', book: part.book,
                fromChapter: part.fromChapter, toChapter: part.toChapter, fromVerse: part.fromVerse, toVerse: part.toVerse}];
        case partTypes.collecte:
            return [{type: slideTypes.collecteMiddag, collectenGKv: collectenGKv, collectenNGK: collectenNGK}];
        case partTypes.zegen:
            return [{type: slideTypes.zegen, title: part.zegen || 'Zegen'}];
        case partTypes.ondertiteling:
            const split = part.text.split(/\n/);
            let curTexts = [];
            let slides = [];
            for (let text of split) {
                // noinspection EqualityComparisonWithCoercionJS
                if (text == false) {
                    slides.push(curTexts);
                    curTexts = [];
                } else {
                    if (curTexts.length >= 2) {
                        slides.push(curTexts);
                        curTexts = [];
                    }
                    curTexts.push(text);
                }
            }
            if (curTexts.length) {
                slides.push(curTexts);
            }
            slides.push([]);

            return [{type: slideTypes.ondertitelingTitel, title: part.title, subTitle: part.subTitle}].concat(
                slides.map(s => { return {type: slideTypes.ondertiteling, texts: s} })
            );
        default:
            return [];
    }
}

function mapWithEmpty(part, ochtend, collectenGKv, collectenNGK) {
    return [{type: slideTypes.liturgie}, ...mapToSlide(part, ochtend, collectenGKv, collectenNGK)];
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
            if (part.verses.length) title += ' : ' + part.verses.join(', ');
            return [title];
        case partTypes.bijbeltekst:
            return [(part.title || 'Lezen') + (part.text ? ': ' + part.text : '')];
        case partTypes.collecte:
            return [part.title || 'Collecte'];
        case partTypes.zegen:
            return [part.zegen || 'Zegen'];
        case partTypes.ondertiteling:
            return [part.title];
        default:
            return [];
    }
}

// Map it
function createConfig(expandable, ochtend, thema, collectenGKv, collectenNGK) {
    return {
        thema: thema,
        slides: [
            {type: slideTypes.welkom, vooraf: true},
            {type: slideTypes.liturgie, vooraf: true},
            // {type: slideTypes.kerkdienstgemist, vooraf: true},
            // {type: slideTypes.parkeren, vooraf: true},
            ...expandable.flatMap(x => mapWithEmpty(x, ochtend, collectenGKv, collectenNGK)),
            {type: /*ochtend ? slideTypes.totZiensOchtend :*/ slideTypes.totZiensMiddag, vooraf: false}
        ],
        liturgie: [
            ...expandable.flatMap(mapToLiturgie),
        ]
    };
}

exports.createConfig = createConfig;
