const cities = require('./cities');
const {places,descriptors} = require('./seedhelpers');
//destructuring horhi  as you can see order didnt matter in 
//which order you destructured the two properties
const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
mongoose.connect('mongodb://localhost:27017/yelp-camp')
//catch(error => console.error(error));



const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
   console.log("Database connected");
});

const sample = array =>   array[Math.floor(Math.random()*array.length)];
//is single line syntax mei yeh cheez automatically 
//return ho jati hai isliye return nahi likha hai
const seedDB = async () =>{
    await Campground.deleteMany({});
    const c=  new Campground({title: 'purple field'});
    await c.save();
    for(let i = 0 ;i<50;i++){
        const randomk = Math.floor(Math.random()*1000);
       const camp= new Campground({
            author: '62cd11eb4984fc8af8995f14',
            location:`${cities[randomk].city},${cities[randomk].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image:`https://source.unsplash.com/random/515x300?camping,${i}`,
            description: 'lorem ipsumifh Bgppngoi bhoijgorign',
            price:1200 
        })
        await camp.save();
    }
}

seedDB().then(() => {//seedDB return promise becuase
    //its an async function
    mongoose.connection.close();
});