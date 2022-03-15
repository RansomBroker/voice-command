/*include modules*/
const {google} = require('googleapis');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const {PORT, keyFile, range, scopes, spreadsheetId} = require("./config");

const app = express();

const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes
})

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

/*Get Data To Show To Table*/
app.get('/api/getTempData', async (req, res) => {
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});

    await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range : "Sheet2!A:C"
    }, (err, result) => {
        if (err) {
            res.status(400).json(err);
        }
        res.status(200).json(result.data.values.reverse());
    });
});

/*Append Data To main sheets*/
app.post('/api/appendDataToMainSheet',  async (req, res) => {
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});

    let resource ={
        "majorDimension" : "ROWS",
        "values": [
            [req.body.date, req.body.time , req.body.name, req.body.homeCity, req.body.imageLink]
        ]
    }

    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "Sheet1!A:E",
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
            [req.body.date, req.body.time , req.body.name, req.body.homeCity, req.body.imageLink]
        ]
    }

    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "Sheet2!A:E",
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
app.post('/api/upload', async (req, res) => {
    const client = await auth.getClient();
    const googleDrive = google.drive({version: 'v3', auth: client});

    let fileMetadata = {
       name : 'photo.jpg',
        parents: ["1kyWGNsQeRjqpBuhImWQVZ37BDLVkIjtj"]
    };

    let media = {
        mimeType: 'image/jpg',
        body: fs.createReadStream('files/photo.jpg')
    }

    await googleDrive.files.create({
        resource: fileMetadata,
        media,
    }, function (err, file) {
        if (err){
            res.status(400).json(err);
        }
        res.status(200).json(file);
    });

});

app.listen(PORT, () => console.log(`Express is running at port ${PORT}`));