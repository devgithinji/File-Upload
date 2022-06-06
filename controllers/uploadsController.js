const path = require('path')
const Product = require('../models/Product')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const cloudinary = require('cloudinary').v2
const fs = require('fs')

//upload to local server
const uploadProductImageLocal = async (req, res) => {
    //check if file exists
    if (!req.files) {
        throw  new CustomError.BadRequestError('No file uploaded');
    }
    const productImage = req.files.image;
    //check format
    if (!productImage.mimetype.startsWith('image')) {
        throw  new CustomError.BadRequestError('Please upload an image');
    }
    //check size
    const maxSize = 1024 * 1024;
    if (productImage.size > maxSize) {
        throw  new CustomError.BadRequestError('Please upload image smaller than 1MB');
    }

    const imagePath = path.join(__dirname, '../public/uploads/' + `${productImage.name}`);

    await productImage.mv(imagePath);

    res.status(StatusCodes.OK).json({image: {src: `/uploads/${productImage.name}`}});
}


//upload to cloudinary
const uploadProductImage = async (req, res) => {
    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        use_filename: true,
        folder: 'file-upload'
    });
    //delete the local stored file
    fs.unlinkSync(req.files.image.tempFilePath);
    res.status(StatusCodes.OK).json({image: {src: result.secure_url}})
}


module.exports = {
    uploadProductImageLocal,
    uploadProductImage,
}