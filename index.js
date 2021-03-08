const multer = require('multer');
const { createWorker } = require('tesseract.js')
const express = require('express');
const path = require('path');
const app = express();

//app.use(express.urlencoded({ extended: true }))
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,'public')))

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'upload')
    },
    filename: function (req, file, cb) {
        cb(null, "demo.jpg")
    }
})
const maxSize = 1 * 1000 * 1000;
var upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {

        // Set the filetypes, it is optional 
        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);

        var extname = filetypes.test(path.extname(
            file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }

        cb("Error: File upload only supports the "
            + "following filetypes - " + filetypes);
    }
}).single("myFile")

app.post('/', (req, res, next) => {
    upload(req, res, function (err) {

        if (err) {
            res.send(err)
        }
        else {
            const worker = createWorker({
                logger: m => console.log(m)
            });

            (async () => {
                await worker.load();
                await worker.loadLanguage('eng');
                await worker.initialize('eng');
                const { data: { text } } = await worker.recognize('./upload/demo.jpg');
                console.log(text);
                await worker.terminate();
                res.render('index',{xyz:text})
                
            })();
            
        }
    })
})

app.get('/', (req, res) => {
    res.render('index')
})

app.listen(PORT, () => {
    console.log(`sever is running on ${PORT}`)
})
