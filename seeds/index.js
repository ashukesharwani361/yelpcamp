const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers.js');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database Connected");
})

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '620652cf84c5b114f1edaf5d',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            // img: 'https://picsum.photos/600/300',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.Distinctio sint sit vitae eaque inventore veritatis ab perspiciatis volupta possimus ut, cum sapiente autem quam doloremque quod corporis delectus voluptatibus eligendi.',
            price,
            geometry: { 
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ] 
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/ashu361/image/upload/v1645547141/YelpCamp/u7wt7kh5xy6x3ao94f6i.jpg',
                  filename: 'YelpCamp/u7wt7kh5xy6x3ao94f6i'
                },
                {
                  url: 'https://res.cloudinary.com/ashu361/image/upload/v1645547142/YelpCamp/skj0u4qyhjqd93vqwkkm.jpg',
                  filename: 'YelpCamp/skj0u4qyhjqd93vqwkkm'
                }
              ]
        });
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close()
})