import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) // It will remain in short amount in the local server 
    }
})

export const upload = multer({ storage, })// 
