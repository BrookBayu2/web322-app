/*********************************************************************************
* WEB322 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
* of this assignment has been copied manually or electronically from any other source 
* (including 3rd party web sites) or distributed to other students.
* 
* Name: Biruk Abebe Student ID: 168432227 Date: 7/20/24
*
* Vercel Web App URL: ________________________________________________________
* 
* GitHub Repository URL: https://github.com/BrookBayu2/web322-app/tree/app
*
********************************************************************************/

const express = require('express');
const path = require('path');
const storeService = require('./store-server'); 
const multer = require('multer'); 
const { v2: cloudinary } = require('cloudinary'); 
const streamifier = require('streamifier'); 
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));


cloudinary.config({
    cloud_name: 'dpxllbzh8', 
    api_key: '256192282584981', 
    api_secret: 'ctwCZLn5IFzg6DVRKGCArktNCQU', 
    secure: true
});


const upload = multer(); 

app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/shop', async (req, res) => {
    try {
        const data = await storeService.getPublishedItems();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

app.get('/items', async (req, res) => {
    try {
        let data;
        if (req.query.category) {
            data = await storeService.getItemsByCategory(req.query.category);
        } else if (req.query.minDate) {
            data = await storeService.getItemsByMinDate(req.query.minDate);
        } else {
            data = await storeService.getAllItems();
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

app.get('/categories', async (req, res) => {
    try {
        const data = await storeService.getCategories();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err });
    }
});


app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
});


app.post('/items/add', upload.single('featureImage'), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log("Image uploaded successfully:", result);
            return result;
        }

        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        }).catch((error) => {
            console.error("Image upload failed:", error); 
            res.status(500).send("Image upload failed.");
        });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;
       
        storeService.addItem(req.body).then(() => {
            res.redirect('/items');
        }).catch((err) => {
            res.status(500).send("Unable to add item.");
        });
    }
});

app.get('/item/:id', async (req, res) => {
    try {
        const data = await storeService.getItemById(req.params.id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

storeService.initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`Express http server listening on port ${PORT}`);
    });
}).catch((err) => {
    console.log(`Unable to start server: ${err}`);
});
