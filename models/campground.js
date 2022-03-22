const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

// https://res.cloudinary.com/ashu361/image/upload/v1645547142/YelpCamp/skj0u4qyhj

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true } };    // By default mongoose doesn't include virtuals
// when the document is converted into json, so we have to do this.
const CampgroundSchema = new Schema({
    title: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'                            // reffering to Review model.
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popupMarkup').get(function () {
    return `<strong><a href = "/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</P>`
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {    // doc refers to the document
    if (doc) {                                             // that has already been deleted. 
        await Review.deleteMany({
            _id: {
                $in: doc.reviews     // removing reviews whose ids are in doc.reviews.
            }
        })
    }
})

const Campground = mongoose.model('Campground', CampgroundSchema);
module.exports = Campground;


