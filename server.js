'use strict';

const express = require('express');
const cors = require('cors');
const pg = require('pg');
const superagent = require('superagent');
require('dotenv').config();

// require('dotenv').config();

const PORT = process.env.PORT || 3077;
const app = express();
app.use(cors());


const client = new pg.Client(process.env.DATABASE_URL);
client.on('err', err => { throw err; });
client.connect();


require('dotenv').config();
app.use(cors());


function Geolocation(latitude, longitude, formatted_address, search_query) {
  this.latitude = latitude,
  this.longitude = longitude,
  this.formatted_query = formatted_address,
  this.search_query = search_query
}

function Forcast(forecast, time) {
  this.forecast = forecast,
  this.time = new Date(time * 1000).toDateString();
}

function Event(link, name, date, summary) {
  this.link = link,
  this.name = name,
  this.event_date = date,
  this.summary = summary
}

app.get('/location', (req, res) => {


  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.data}&key=${process.env.GEOCODE_API_KEY}`;

  console.log('YOOOOOO');
  superagent.get(url).then(response => {
    
    console.log('API RESPONSE: ', url)
    
    const geoDataArray = response.body.results;
    const search_query = geoDataArray[0].address_components[0].short_name;
    const formatted_query = geoDataArray[0].formatted_address;
    const lat = geoDataArray[0].geometry.location.lat;
    const lng = geoDataArray[0].geometry.location.lng;

    const nextLocation = new Geolocation(lat, lng, formatted_query, search_query);

    res.send(nextLocation);

  });

});

app.get('/add', (req, res) => {

  superagent.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.data}&key=${process.env.GEOCODE_API_KEY}`).then(response => {

    let geoDataArray = response.body.results;
    let searchquery = geoDataArray[0].address_components[0].short_name;
    let formattedquery = geoDataArray[0].formatted_address;
    let lat = geoDataArray[0].geometry.location.lat;
    let lng = geoDataArray[0].geometry.location.lng;

    let SQL = 'INSERT INTO city_explorer (searchquery, formattedquery, lat, lng) RETURNING *';
    let saveValues = [searchquery, formattedquery, lat, lng];

    client.query(SQL, saveValues)
      .then(results => {
        res.status(200).json(results);
      })
      .catch(err => console.error(err));
  })
});

app.get('/weather', (req, res) => {

  superagent.get(`https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${req.query.data.latitude},${req.query.data.longitude}`).then(response => {

    let dailyData = response.body.daily.data;

    let nextForecast = dailyData.map((val) => {
      let nextForeCastObj = new Forcast(val.summary, val.time);
      return nextForeCastObj;
    });

    res.send(nextForecast);
  });
});


app.get('/events', (req, res) => {

  superagent.get(`http://api.eventful.com/json/events/search?location=${req.query.data.formatted_query}&app_key=${process.env.EVENTFUL_API_KEY}`).then(response => {
    const eventfulJSON = JSON.parse(response.text);

    const eventsArray = eventfulJSON.events.event;

    const nextEvents = eventsArray.map((val) => {
      let nextEventObj = new Event(val.url, val.venue_name, val.start_time, val.title);
      return nextEventObj;
    });

    res.send(nextEvents);

  });
});

//error handler

app.listen(PORT, () => {
  console.log(`App is on PORT: ${PORT}`);
})

