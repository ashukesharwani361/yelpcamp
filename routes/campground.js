const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema } = require('../schemas.js');
const Campground = require('../models/campground');

const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer  = require('multer');       
const { storage } = require('../cloudinary/index');
const upload = multer({ storage }) //Multer is a node.js middleware for 
// handling multipart/form-data, which is primarily used for uploading files.


router.route('')
    .get(campgrounds.index)
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createNewCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router.route('/:id')     // arranging routes with same path in one place.
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))


module.exports = router;