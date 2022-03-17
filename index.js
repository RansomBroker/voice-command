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
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));

/*Get Data To Show To Table*/
app.get('/api/getTempData', async (req, res) => {
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});

    const data = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range : "Sheet2!A:E"
        });

    let limit = req.query.limit;
    let pageLimit = Math.ceil(data.data.values.length / limit);
    console.log(pageLimit);
    let dataEnd =  Math.ceil(data.data.values.length / req.query.page);
    console.log(dataEnd);
    let dataStart =  Math.floor(dataEnd - limit)+1 === 0 ? 1: Math.floor(dataEnd - limit)+1 < 0 ? 1 : Math.floor(dataEnd - limit)+1 === 0 ? 1: Math.floor(dataEnd - limit)+1 ;
    console.log(dataStart);

    /*send data to result*/
    await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range : `Sheet2!A${dataStart}:E${dataEnd}`
    }, (err, result) => {
        if (err) {
            res.status(400).json(err);
        }
        res.status(200).json({
            dataStart : dataStart,
            dataEnd: dataEnd,
            limit: limit,
            pageLimit: pageLimit,
            result: result.data.values.reverse(),
        });
    });
});

/*Append Data To main sheets*/
app.post('/api/appendDataToMainSheet',  async (req, res) => {
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});

    let resource ={
        "majorDimension" : "ROWS",
        "values": [
            [req.body.date, req.body.time , req.body.name, req.body.gender, req.body.homeCity, req.body.imageLink]
        ]
    }

    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "Sheet1!A:F",
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

/*Append to temporary sheets*/
app.post('/api/appendDataToTempSheet',  async (req, res) => {
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});

    let resource ={
        "majorDimension" : "ROWS",
        "values": [
            [req.body.date, req.body.time , req.body.name, req.body.gender, req.body.homeCity, req.body.imageLink]
        ]
    }

    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "Sheet2!A:F",
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


app.listen(PORT, () => console.log(`Express is running at port ${PORT}`));