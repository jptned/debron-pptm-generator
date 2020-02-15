const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {createConfig} = require('./config');
const {generatePresentation} = require("./generate");
const app = express();
const port = 3000;
const fileSystem = require('fs');
const path = require('path');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.post('/generate', (req, res) => {
    const config = createConfig(req.body.liturgie, req.body.presentatie.ochtend, req.body.presentatie.thema || ' ', [req.body.collecte.gkv1, req.body.collecte.gkv2, req.body.collecte.gkv3, req.body.collecte.gkv4], [req.body.collecte.ngk1, req.body.collecte.ngk2, req.body.collecte.ngk3, req.body.collecte.ngk4]);
    const date = new Date(req.body.presentatie.date);
    const filename = date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear() + ', ' + (req.body.presentatie.ochtend ? 'ochtend' : 'middag');

    generatePresentation(config, filename, function(err) {
        if (err) {
            res.json('Something went wrong');
            return;
        }
        const filePath = path.join(__dirname, 'generated/' + filename + '.pptm');
        const stat = fileSystem.statSync(filePath);

        res.writeHead(200, {
            'Content-Type': 'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
            'Content-Length': stat.size
        });

        const readStream = fileSystem.createReadStream(filePath);
        readStream.on('end', function () {
            fileSystem.unlink(filePath, function() {})
        });
        readStream.pipe(res);
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
