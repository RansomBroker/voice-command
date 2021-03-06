/*include modules*/
const {google} = require('googleapis');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
/*disk storage*/
const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "files/"));
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname+ "-"+Date.now()+path.extname(file.originalname)
        )
    }
});

const {PORT, keyFile, range, scopes, spreadsheetId, parents} = require("./config");

const app = express();

const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes
})

app.use(cors());
app.use(express.json({limit:'5mb'}));
app.use(express.urlencoded({extended: true, limit:'5mb'}));
app.use(morgan('tiny'));

/*Get Data To Show To Table*/
app.get('/api/getData', async (req, res) => {
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});

    const data = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range : "Sheet1!A:E"
        });

    let limit = req.query.limit;
    if (data.data.hasOwnProperty("values")) {
        let pageLimit = Math.ceil((data.data.values.length > 1 ? data.data.values.length : 0) / limit);
        let dataStart = ((req.query.page * limit ) - limit) > 1 ? ((req.query.page * limit ) - limit)+1 : 1 ;
        let dataEnd = (req.query.page * limit);

        /*send data to result*/
        await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range : `Sheet1!A${dataStart}:E${dataEnd}`
        }, (err, result) => {
            if (err) {
                res.status(400).json(err);
            }
            res.status(200).json({
                dataStart : dataStart,
                dataEnd: dataEnd,
                limit: limit,
                pageLimit: pageLimit,
                result: result.data.values,
            });
        });
    } else {
        res.status(200).json({
            limit: limit,
            pageLimit: 0,
            result: [],
        });
    }


});

/*Append Data To main sheets*/
app.post('/api/appendData',  async (req, res) => {
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});

    let resource ={
        "majorDimension" : "ROWS",
        "values": [
            [req.body.date, req.body.time , req.body.name, req.body.gender, req.body.homeCity, req.body.imageLink]
        ]
    }

    /*Create new row */
    await googleSheets.spreadsheets.batchUpdate({
        auth,
        spreadsheetId,
        resource: {
            "requests": [
                {
                    "insertDimension": {
                        "range": {
                            "sheetId": 0,
                            "dimension": "ROWS",
                            "startIndex": 0,
                            "endIndex": 1
                        }
                    }
                }
            ]
        }
    })

    /*Then Append it*/
    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "Sheet1!A1:F1",
        valueInputOption: "RAW",
        resource
    }, (err, result) => {
        if (err) {
            res.status(400).json(err.data.error);
        }
        res.status(200).json({
            "status": result.status,
            "statusText": result.statusText,
            "data"  : result.config.data.values,
            "update": result.data
        });
    })
});

/*Upload and get value*/
app.post('/api/upload', multer({storage: diskStorage}).single("image"),async (req, res) => {
    if (!req.file) {
        res.status(400).json({error: "File Not Found"});
    } else {
        const client = await auth.getClient();

        const googleDrive = google.drive({version: 'v3', auth: client});

        let fileMetadata = {
            name : req.file.filename,
            parents
        };

        let media = {
            mimeType: ['image/jpg', 'image/jpeg', 'image/png' ],
            body: fs.createReadStream(req.file.path)
        }

        await googleDrive.files.create({
            resource: fileMetadata,
            media,
        }, function (err, file) {
            if (err){
                res.status(400).json(err);
            }
            res.status(200).json({
                header: file.header,
                status: file.status,
                statusText: file.statusText,
                data: file.data
            });
        })
    }

});

app.post('/api/uploadImagePath',async (req, res) => {
    const client = await auth.getClient();

    const googleDrive = google.drive({version: 'v3', auth: client});

    let fileMetadata = {
        name : `${req.body.fileName}.png`,
        parents
    };

    let media = {
        mimeType: ['image/jpg', 'image/jpeg', 'image/png' ],
        body: fs.createReadStream(`./files/${req.body.fileName}.png`)
    }

    await googleDrive.files.create({
        resource: fileMetadata,
        media,
    }, function (err, file) {
        if (err){
            res.status(400).json(err);
        }
        res.status(200).json({
            header: file.header,
            status: file.status,
            statusText: file.statusText,
            data: file.data
        });
    })
});

app.post("/api/saveImage", (req, res) => {
    const fileContent = new Buffer.from(req.body.data, 'base64');
    fs.writeFile(`./files/${req.body.fileName}.png`, fileContent, err => {
        if (err) {
            res.status(400).json("Something went wrong :(");
        }
        res.status(200).json("success");
    })
})

app.listen(PORT, () => console.log(`Express is running at port ${PORT}`));