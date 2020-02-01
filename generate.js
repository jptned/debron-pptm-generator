const ncp = require('ncp').ncp;
const zipFolder = require('zip-a-folder');
const fs = require('fs');
const config = require('./config');
const replace = require('replace-in-file');
const {slideTypes} = require('./slide-types');

// Add ID's to slids
let id = 10;
let index = 1;
for (let slide of config.slides) {
    slide.id = id;
    slide.index = index;
    id++;
    index++;
}

function createSlideReferences() {
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

function createSlideMaster() {
    replace.sync({
        files: dest + '/ppt/slideMasters/slideMaster1.xml',
        from: '{{Thema}}',
        to: config.thema
    });
}

function createSections() {
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

function createSlides() {
    for (const slide of config.slides) {
        fs.copyFileSync(basis + '/ppt/slides/' + slide.type + '.xml', dest + '/ppt/slides/slide' + slide.index + '.xml');
        fs.copyFileSync(basis + '/ppt/slides/_rels/' + slide.type + '.xml.rels', dest + '/ppt/slides/_rels/slide' + slide.index + '.xml.rels');

        if (slide.type === slideTypes.titel) {
            replace.sync({
                files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                from: '{{titel}}',
                to: slide.title
            });
        } else if (slide.type === slideTypes.bijbeltekst) {
            if (slide.text) {
                slide.title += ': ';
            } else {
                slide.text = '';
            }

            replace.sync({
                files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                from: '{{titel}}',
                to: slide.title
            });
            replace.sync({
                files: dest + '/ppt/slides/slide' + slide.index + '.xml',
                from: '{{tekst}}',
                to: slide.text
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
                <a:t>${slide.title + (slide.song.length ? ': ' : '')}</a:t>
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
                    <a:t>${slide.song + (slide.verses.length ? ' : ' : '')}</a:t>
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
        } else if (slide.type === slideTypes.collecteOchtend || slide.type === slideTypes.collecteMiddag) {
            for (let i = 0; i < 4; i++) {
                replace.sync({
                    files: dest + '/ppt/slideLayouts/slideLayout4.xml',
                    from: '{{collecte-gkv-' + i + '}}',
                    to: slide.collectenGKv[i]
                });
            }

            if (slide.type === slideTypes.collecteMiddag) {
                for (let i = 0; i < 4; i++) {
                    replace.sync({
                        files: dest + '/ppt/slideLayouts/slideLayout4.xml',
                        from: '{{collecte-ngk-' + i + '}}',
                        to: slide.collectenNGK[i]
                    });
                }
            }
        }
    }
}

function zip() {
    const zipFilePath = './' + name + '.pptm';
    zipFolder.zipFolder(dest, zipFilePath, function (err) {
        if (err) {
            console.log('Something went wrong!', err);
        }
        console.log('done!');
    });
}

function createSlideLayout() {
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
                    <a:t>${item}</a:t>
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

// Copy folder
ncp.limit = 16;
const name = 'test-' + Math.round((new Date()).getTime() / 1000);
const original = './basis-leeg';
const basis = './basis';
const dest = './' + name;

ncp(original, dest, function (err) {
    if (err) {
        return console.error(err);
    }

    createSlides();
    createSlideReferences();
    createSlideMaster();
    createSlideLayout();
    createSections();

    zip();
});

