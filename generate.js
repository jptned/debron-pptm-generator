const ncp = require('ncp').ncp;
const zipFolder = require('zip-a-folder');
const fs = require('fs');
const replace = require('replace-in-file');
const {slideTypes} = require('./slide-types');
const path = require('path');
const rmdir = require('rimraf');

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function createSlideReferences(dest, config) {
    let slideRefs = "";
    for (const slide of config.slides) {
        slideRefs += '<Relationship Id="rId' + slide.id + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide' + slide.index + '.xml"/>';
    }
    replace.sync({
        files: dest + '/ppt/_rels/presentation.xml.rels',
        from: '{{slides}}',
        to: slideRefs
    });

    let slideList = "";
    for (const slide of config.slides) {
        slideList += '<p:sldId id="' + slide.index + '" r:id="rId' + slide.id + '"/>';
    }
    replace.sync({
        files: dest + '/ppt/presentation.xml',
        from: '{{slides}}',
        to: slideList
    });
}

function createSlideMaster(dest, config) {
    replace.sync({
        files: dest + '/ppt/slideMasters/slideMaster1.xml',
        from: '{{Thema}}',
        to: config.thema
    });
}

function createSections(dest, config) {
    let vooraf = "";
    let sectionVooraf = "";
    let sectionDienst = "";
    for (const slide of config.slides) {
        if (slide.vooraf) {
            vooraf += '<p:sld r:id="rId' + slide.id + '"/>';
            sectionVooraf += '<p14:sldId id="' + slide.index + '"/>';
        } else {
            sectionDienst += '<p14:sldId id="' + slide.index + '"/>';
        }
    }
    replace.sync({
        files: dest + '/ppt/presentation.xml',
        from: '{{vooraf}}',
        to: vooraf
    });
    replace.sync({
        files: dest + '/ppt/presentation.xml',
        from: '{{section-vooraf}}',
        to: sectionVooraf
    });
    replace.sync({
        files: dest + '/ppt/presentation.xml',
        from: '{{section-dienst}}',
        to: sectionDienst
    });
}

function paragraph(content) {
    if (content === '') return '';
    return `<a:p>
                <a:pPr marL="0" indent="0">
                    <a:lnSpc>
                        <a:spcPct val="115000"/>
                    </a:lnSpc>
                </a:pPr>
                ` + content + `
            </a:p>`;
}

function blankLine() {
    return paragraph(`<a:endParaRPr lang="nl-NL" sz="3500" b="1" dirty="0">
                    <a:solidFill>
                        <a:srgbClr val="FFFFFF"/>
                    </a:solidFill>
                    <a:effectLst>
                        <a:prstShdw prst="shdw14" dist="35921" dir="2700000">
                            <a:scrgbClr r="0" g="0" b="0">
                                <a:alpha val="43000"/>
                            </a:scrgbClr>
                        </a:prstShdw>
                    </a:effectLst>
                    <a:latin typeface="Century Gothic" panose="020B0502020202020204" pitchFamily="34" charset="0"/>
                </a:endParaRPr>`);
}

function heading(title) {
    return paragraph(`<a:r>
                <a:rPr lang="nl-NL" sz="4000" dirty="0">
                    <a:solidFill>
                        <a:srgbClr val="FFFFFF"/>
                    </a:solidFill>
                    <a:effectLst>
                        <a:prstShdw prst="shdw14" dist="35921" dir="2700001">
                            <a:scrgbClr r="0" g="0" b="0">
                                <a:alpha val="43000"/>
                            </a:scrgbClr>
                        </a:prstShdw>
                    </a:effectLst>
                    <a:latin typeface="Century Gothic" panose="020B0502020202020204" pitchFamily="34" charset="0"/>
                </a:rPr>
                <a:t>` + escapeXml(title) + `</a:t>
            </a:r>`);
}

function verse(number) {
    return `<a:r>
                <a:rPr lang="nl-NL" sz="4000" b="1" baseline="30000" dirty="0">
                    <a:solidFill>
                        <a:srgbClr val="FFFFFF"/>
                    </a:solidFill>
                    <a:effectLst>
                        <a:prstShdw prst="shdw14" dist="35921" dir="2700000">
                            <a:scrgbClr r="0" g="0" b="0">
                                <a:alpha val="43000"/>
                            </a:scrgbClr>
                        </a:prstShdw>
                    </a:effectLst>
                    <a:latin typeface="Century Gothic" panose="020B0502020202020204" pitchFamily="34" charset="0"/>
                </a:rPr>
                <a:t>` + number + ` </a:t>
            </a:r>`;
}

function text(text) {
    return `<a:r>
                <a:rPr lang="nl-NL" sz="4000" b="1" dirty="0">
                    <a:solidFill>
                        <a:srgbClr val="FFFFFF"/>
                    </a:solidFill>
                    <a:effectLst>
                        <a:prstShdw prst="shdw14" dist="35921" dir="2700000">
                            <a:scrgbClr r="0" g="0" b="0">
                                <a:alpha val="43000"/>
                            </a:scrgbClr>
                        </a:prstShdw>
                    </a:effectLst>
                    <a:latin typeface="Century Gothic" panose="020B0502020202020204" pitchFamily="34" charset="0"/>
                </a:rPr>
                <a:t>` + escapeXml(text) + `</a:t>
            </a:r>`
}

function createParagraphs(slide) {
    let first = true;
    let curPar = '';
    let paragraphs = '';

    for (let i = slide.fromChapter; i <= slide.toChapter; i++) {
        let bookID = slide.book + '.' + i;
        const fileName = './bijbel-database/' + bookID + '.json';
        if (fs.existsSync(fileName)) {
            const bookInfo = JSON.parse(fs.readFileSync(fileName, 'UTF-8'));
            for (const [key, value] of Object.entries(bookInfo)) {
                const j = parseInt(key);
                if (i === slide.fromChapter && j < slide.fromVerse || i === slide.toChapter && j > slide.toVerse) {
                    continue;
                }
                for (const part of value) {
                    if (part.type === 'blank' && first) {
                        continue;
                    }
                    if (part.type === 'heading' || part.type === 'blank' || part.startParagraph) {
                        paragraphs += paragraph(curPar);
                        curPar = '';
                    }

                    switch (part.type) {
                        case 'heading':
                            if (!first) {
                                paragraphs += blankLine();
                            }
                            paragraphs += heading(part.text);
                            break;
                        case 'blank':
                            paragraphs += blankLine();
                            break;
                        case 'text':
                            curPar += text(part.text);
                            break;
                        case 'number':
                            curPar += verse(part.text);
                            break;
                    }
                    first = false;
                }
            }
            paragraphs += paragraph(curPar);
            curPar = '';
        }
    }

    return paragraphs;
}

function ondertitelingsRegel(text) {
    return `<a:p><a:r><a:rPr lang="nl-NL" dirty="0"/><a:t>` + escapeXml(text) + `</a:t></a:r></a:p>`;
}

const boeken = JSON.parse(`{"GEN":"Genesis","EXO":"Exodus","LEV":"Leviticus","NUM":"Numeri","DEU":"Deuteronomium","JOS":"Jozua","JDG":"Rechters","RUT":"Ruth","1SA":"1 Samuel","2SA":"2 Samuel","1KI":"1 Koningen","2KI":"2 Koningen","1CH":"1 Kronieken","2CH":"2 Kronieken","EZR":"Ezra","NEH":"Nehemia","EST":"Ester","JOB":"Job","PSA":"Psalmen","PRO":"Spreuken","ECC":"Prediker","SNG":"Hooglied","ISA":"Jesaja","JER":"Jeremia","LAM":"Klaagliederen","EZK":"Ezechiël","DAN":"Daniël","HOS":"Hosea","JOL":"Joël","AMO":"Amos","OBA":"Obadja","JON":"Jona","MIC":"Micha","NAM":"Nahum","HAB":"Habakuk","ZEP":"Sefanja","HAG":"Haggai","ZEC":"Zacharia","MAL":"Maleachi","TOB":"Tobit","JDT":"Judit","ESG":"Ester (Gr.)","1MA":"1 Makkabeeën","2MA":"2 Makkabeeën","WIS":"Wijsheid","SIR":"Sirach","BAR":"Baruch","LJE":"Brief van Jeremia","DAG":"Daniël (Gr.)","MAN":"Manasse","MAT":"Matteüs","MRK":"Marcus","LUK":"Lucas","JHN":"Johannes","ACT":"Handelingen","ROM":"Romeinen","1CO":"1 Korintiërs","2CO":"2 Korintiërs","GAL":"Galaten","EPH":"Efeziërs","PHP":"Filippenzen","COL":"Kolossenzen","1TH":"1 Tessalonicenzen","2TH":"2 Tessalonicenzen","1TI":"1 Timoteüs","2TI":"2 Timoteüs","TIT":"Titus","PHM":"Filemon","HEB":"Hebreeën","JAS":"Jakobus","1PE":"1 Petrus","2PE":"2 Petrus","1JN":"1 Johannes","2JN":"2 Johannes","3JN":"3 Johannes","JUD":"Judas","REV":"Openbaring"}`);
function createTextTitle(slide) {
    if (!slide.book) {
        return '';
    }
    return boeken[slide.book].replace('Psalmen', 'Psalm') + ' '
        + slide.fromChapter + ' : ' + slide.fromVerse
        + (parseInt(slide.fromChapter, 10) !== parseInt(slide.toChapter, 10) || parseInt(slide.fromVerse, 10) !== parseInt(slide.toVerse, 10) ?
                ' - '
                + (parseInt(slide.fromChapter, 10) !== parseInt(slide.toChapter, 10) ? slide.toChapter + ' : ' : '')
                + slide.toVerse : ''
        );
}

function createSlides(basis, dest, config, name, callback) {
    for (const slide of config.slides) {
        fs.copyFileSync(basis + '/ppt/slides/_rels/' + slide.type + '.xml.rels', dest + '/ppt/slides/_rels/slide' + slide.index + '.xml.rels');
        fs.copyFileSync(basis + '/ppt/slides/' + slide.type + '.xml', dest + '/ppt/slides/slide' + slide.index + '.xml');
        if (slide.type === slideTypes.titel) {
            replace.sync({
                files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                from: '{{titel}}',
                to: escapeXml(slide.title)
            });
        } else if (slide.type === slideTypes.bijbeltekst) {
            if (slide.book) {
                slide.title += ': ';
            }

            const paragraphs = createParagraphs(slide);
            const textTitle = escapeXml(createTextTitle(slide));

            replace.sync({
                files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                from: '{{titel}}',
                to: escapeXml(slide.title)
            });
            replace.sync({
                files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                from: '{{tekst}}',
                to: textTitle
            });
            replace.sync({
                files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                from: '{{paragraphs}}',
                to: paragraphs
            });
        } else if (slide.type === slideTypes.notenbalk) {
            let text = "";
            text += `<a:r>
                <a:rPr kumimoji="0" lang="nl-NL" sz="4000" b="1" i="0" u="none" strike="noStrike" kern="1200" cap="none" spc="0" normalizeH="0" baseline="0" noProof="0" dirty="0">
                    <a:ln>
                        <a:noFill/>
                    </a:ln>
                    <a:solidFill>
                        <a:prstClr val="black">
                            <a:lumMod val="75000"/>
                            <a:lumOff val="25000"/>
                        </a:prstClr>
                    </a:solidFill>
                    <a:effectLst/>
                    <a:uLnTx/>
                    <a:uFillTx/>
                    <a:latin typeface="Century Gothic"/>
                    <a:cs typeface="Century Gothic"/>
                    <a:sym typeface="Gill Sans" charset="0"/>
                </a:rPr>
                <a:t>${escapeXml(slide.title) + (slide.song.length ? ': ' : '')}</a:t>
            </a:r>`;
            if (slide.song.length) {
                text += `<a:r>
                    <a:rPr lang="nn-NO" sz="4000" dirty="0">
                        <a:solidFill>
                            <a:prstClr val="black">
                                <a:lumMod val="75000"/>
                                <a:lumOff val="25000"/>
                            </a:prstClr>
                        </a:solidFill>
                        <a:latin typeface="Century Gothic"/>
                        <a:cs typeface="Century Gothic"/>
                    </a:rPr>
                    <a:t>${escapeXml(slide.song) + (slide.verses.length ? ' : ' : '')}</a:t>
                </a:r>`;
            }
            if (slide.verses.length) {
                let before = '';
                let active = '';
                let after = '';
                const activeIndex = slide.verses.indexOf(slide.active);
                if (activeIndex === -1) {
                    before = slide.verses.join(', ');
                } else {
                    if (activeIndex !== 0) {
                        before = slide.verses.slice(0, activeIndex).join(', ') + ', ';
                    }
                    active = slide.active;
                    if (activeIndex !== slide.verses.length - 1) {
                        after = ', ' + slide.verses.slice(activeIndex + 1).join(', ');
                    }
                }

                if (before) {
                    text += `<a:r>
                        <a:rPr lang="nn-NO" sz="4000" dirty="0">
                            <a:solidFill>
                                <a:prstClr val="black">
                                    <a:lumMod val="75000"/>
                                    <a:lumOff val="25000"/>
                                </a:prstClr>
                            </a:solidFill>
                            <a:latin typeface="Century Gothic"/>
                            <a:cs typeface="Century Gothic"/>
                        </a:rPr>
                        <a:t>${before}</a:t>
                    </a:r>`;
                }

                if (active) {
                    text += `<a:r>
                        <a:rPr lang="nn-NO" sz="4000" b="1" u="sng" dirty="0">
                            <a:solidFill>
                                <a:srgbClr val="003E90"/>
                            </a:solidFill>
                            <a:latin typeface="Century Gothic"/>
                            <a:cs typeface="Century Gothic"/>
                        </a:rPr>
                        <a:t>${active}</a:t>
                    </a:r>`;
                }

                if (after) {
                    text += `<a:r>
                        <a:rPr lang="nn-NO" sz="4000" dirty="0">
                            <a:solidFill>
                                <a:prstClr val="black">
                                    <a:lumMod val="75000"/>
                                    <a:lumOff val="25000"/>
                                </a:prstClr>
                            </a:solidFill>
                            <a:latin typeface="Century Gothic"/>
                            <a:cs typeface="Century Gothic"/>
                        </a:rPr>
                        <a:t>${after}</a:t>
                    </a:r>`;
                }
            }

            replace.sync({
                files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                from: '{{lied-titel}}',
                to: text
            });
        } else if (slide.type === slideTypes.collecteOchtend) {
            for (let i = 0; i < 4; i++) {
                replace.sync({
                    files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                    from: '{{collecte-' + i + '}}',
                    to: escapeXml(slide.collectenGKv[i])
                });
            }

            replace.sync({
                files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                from: '{{titel}}',
                to: escapeXml(slide.title),
            });
        } else if (slide.type === slideTypes.collecteMiddag) {
            for (let i = 1; i <= 2; i++) {
                replace.sync({
                    files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                    from: '{{collecte-gkv-' + i + '}}',
                    to: escapeXml(slide.collectenGKv[i-1])
                });
            }

            if (slide.type === slideTypes.collecteMiddag) {
                for (let i = 1; i <= 2; i++) {
                    replace.sync({
                        files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                        from: '{{collecte-ngk-' + i + '}}',
                        to: escapeXml(slide.collectenNGK[i-1])
                    });
                }
            }
        } else if (slide.type === slideTypes.votum) {
            replace.sync({
                files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                from: '{{titel}}',
                to: escapeXml(slide.title)
            });
            replace.sync({
                files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                from: '{{vredegroet}}',
                to: escapeXml(slide.vredegroet)
            });
        } else if (slide.type === slideTypes.zegen) {
            replace.sync({
                files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                from: '{{titel}}',
                to: escapeXml(slide.title)
            });
        } else if (slide.type === slideTypes.ondertitelingTitel) {
            replace.sync({
                files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                from: '{{titel}}',
                to: escapeXml(slide.title)
            });
            replace.sync({
                files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                from: '{{subTitel}}',
                to: escapeXml(slide.subTitle)
            });
        } else if (slide.type === slideTypes.ondertiteling) {
            replace.sync({
                files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                from: '{{ondertiteling}}',
                to: slide.texts.map(ondertitelingsRegel).join('')
            });
        }
    }
}

function zip(name, callback) {
    const filePath = path.join(__dirname, 'generated/' + name + '.pptm');
    const dest = path.join(__dirname, 'generated/' + name);
    zipFolder.zipFolder(dest, filePath, function (err) {
        if (err) {
            console.log('Something went wrong!', err);
            callback(err);
        }
        rmdir.sync(dest);
        callback();
    });
}

function createSlideLayout(dest, config) {
    const rules = config.liturgie.map((item) => {
        return `
            <a:p>
                <a:pPr><a:lnSpc><a:spcPct val="130000"/></a:lnSpc></a:pPr>
                <a:r>
                    <a:rPr lang="nl-NL" sz="4000" b="1" dirty="0">
                        <a:solidFill><a:schemeClr val="bg1"/></a:solidFill>
                        <a:effectLst><a:outerShdw blurRad="50800" dist="38100" dir="2700000" algn="tl" rotWithShape="0"><a:prstClr val="black"><a:alpha val="40000"/></a:prstClr></a:outerShdw></a:effectLst>
                        <a:latin typeface="Century Gothic"/>
                        <a:cs typeface="Century Gothic"/>
                    </a:rPr>
                    <a:t>${escapeXml(item)}</a:t>
                </a:r>
            </a:p>
        `;
    });
    const left = rules.slice(0, Math.ceil(rules.length / 2)).join('');
    const right = rules.slice(Math.ceil(rules.length / 2)).join('');

    replace.sync({
        files: dest + '/ppt/slideLayouts/slideLayout1.xml',
        from: '{{liturgie-links}}',
        to: left
    });
    replace.sync({
        files: dest + '/ppt/slideLayouts/slideLayout1.xml',
        from: '{{liturgie-rechts}}',
        to: right
    });
}

function createCustomization(dest, name) {
    replace.sync({
        files: dest + '/userCustomization/customUI.xml',
        from: /{{name}}/g,
        to: name
    });
}

function generatePresentation(config, name, callback) {
    let id = 10;
    let index = 1;
    for (let slide of config.slides) {
        slide.id = id;
        slide.index = index;
        id++;
        index++;
    }

    // Copy folder
    ncp.limit = 16;
    const original = './basis-leeg';
    const basis = './basis';
    const dest = './generated/' + name;

    ncp(original, dest, function (err) {
        if (err) {
            callback(err);
            return console.error(err);
        }

        createSlides(basis, dest, config, name, callback);
        createSlideReferences(dest, config);
        createSlideMaster(dest, config);
        createSlideLayout(dest, config);
        createSections(dest, config);
        createCustomization(dest, name);

        zip(name, callback);
    });
}

exports.generatePresentation = generatePresentation;
