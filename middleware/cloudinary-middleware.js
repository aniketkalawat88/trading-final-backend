const cloudinary = require('cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();

cloudinary.v2.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY // Click 'View API Keys' above to copy your API secret
});
const storage = multer.diskStorage({
    filename: function (req ,file , cb){
         cb(null , file.originalname)
    }
})

const upload = multer({storage:storage})
module.exports = upload ;

