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
            const text = createTextName(part);
            return [(part.title || 'Lezen') + (text ? ': ' + text : '')];
        case partTypes.collecte:
            return [part.title || 'Collecte'];
        case partTypes.zegen:
            return [part.zegen || 'Zegen'];
        default:
            return [];
    }
}

const boeken = JSON.parse(`{"GEN":"Genesis","EXO":"Exodus","LEV":"Leviticus","NUM":"Numeri","DEU":"Deuteronomium","JOS":"Jozua","JDG":"Rechters","RUT":"Ruth","1SA":"1 Samuel","2SA":"2 Samuel","1KI":"1 Koningen","2KI":"2 Koningen","1CH":"1 Kronieken","2CH":"2 Kronieken","EZR":"Ezra","NEH":"Nehemia","EST":"Ester","JOB":"Job","PSA":"Psalmen","PRO":"Spreuken","ECC":"Prediker","SNG":"Hooglied","ISA":"Jesaja","JER":"Jeremia","LAM":"Klaagliederen","EZK":"Ezechiël","DAN":"Daniël","HOS":"Hosea","JOL":"Joël","AMO":"Amos","OBA":"Obadja","JON":"Jona","MIC":"Micha","NAM":"Nahum","HAB":"Habakuk","ZEP":"Sefanja","HAG":"Haggai","ZEC":"Zacharia","MAL":"Maleachi","TOB":"Tobit","JDT":"Judit","ESG":"Ester (Gr.)","1MA":"1 Makkabeeën","2MA":"2 Makkabeeën","WIS":"Wijsheid","SIR":"Sirach","BAR":"Baruch","LJE":"Brief van Jeremia","DAG":"Daniël (Gr.)","MAN":"Manasse","MAT":"Matteüs","MRK":"Marcus","LUK":"Lucas","JHN":"Johannes","ACT":"Handelingen","ROM":"Romeinen","1CO":"1 Korintiërs","2CO":"2 Korintiërs","GAL":"Galaten","EPH":"Efeziërs","PHP":"Filippenzen","COL":"Kolossenzen","1TH":"1 Tessalonicenzen","2TH":"2 Tessalonicenzen","1TI":"1 Timoteüs","2TI":"2 Timoteüs","TIT":"Titus","PHM":"Filemon","HEB":"Hebreeën","JAS":"Jakobus","1PE":"1 Petrus","2PE":"2 Petrus","1JN":"1 Johannes","2JN":"2 Johannes","3JN":"3 Johannes","JUD":"Judas","REV":"Openbaring"}`);
function createTextName(part) {
    if (!part.book) {
        return '';
    }
    return boeken[part.book].replace('Psalmen', 'Psalm') + ' '
        + part.fromChapter + ' : ' + part.fromVerse
        + (parseInt(part.fromChapter, 10) !== parseInt(part.toChapter, 10) || parseInt(part.fromVerse, 10) !== parseInt(part.toVerse, 10) ?
                ' - '
                + (parseInt(part.fromChapter, 10) !== parseInt(part.toChapter, 10) ? part.toChapter + ' : ' : '')
                + part.toVerse : ''
        );
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
