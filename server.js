'use strict';

//Global Variables
const PORT = process.env.PORT || 3077;
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const app = express();

require('dotenv').config();
app.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);
client.on('err', err => { throw err; });
client.connect();

//Constructors
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

//Event Handler
// function queryLocation(req, res) {
//   let searchHandler = {
//     caheHit: (data) => {
//       response.status(200).send(data);
//     },
//     cacheMiss: (query) => {
//     return searchLaToLng (query)
//       .then(result => {
//         response.send(result);
//       }).catch
//   }
// }
// queryLocation(req.query.data, searchHandler);

////serch SQL first////

function queryLocation(query) {

  const SQL = "SELECT * FROM location WHERE search_query = $1";
  const values = [query];
  console.log('This is what it is: ', query);

  return client.query(SQL, values).then(queryData => {

    // console.log('QUERY DATA', queryData);

    if (queryData.rowCount) {
      console.log('FOUND THE CITY ', query);
      return queryData.rows[0];
    } else {
      return false;
    }
  }).catch(err => console.error(err));
}

///////////end SQL search///////

app.get('/location', (req, res) => {


  //if queryLocation has no results
  queryLocation(req.query.data).then(dbResponse => {

    //Run this code
    if (dbResponse) {
      res.send(dbResponse);
    } else {

      let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.data}&key=${process.env.GEOCODE_API_KEY}`;

      superagent.get(url).then(response => {
        const geoDataArray = response.body.results;
        const search_query = req.query.data;
        const formatted_query = geoDataArray[0].formatted_address;
        const lat = geoDataArray[0].geometry.location.lat;
        const lng = geoDataArray[0].geometry.location.lng;

        const nextLocation = new Geolocation(lat, lng, formatted_query, search_query);

        const SQL = `
        INSERT INTO location
          (search_query, formatted_query, latitude, longitude)
          VALUES($1, $2, $3, $4)
          RETURNING id
        `;

        client.query(SQL, [search_query, formatted_query, lat, lng]);

        res.send(nextLocation);

      });
    }
    //or else send something else
  })
});


app.get('/weather', (req, res) => {

  console.log(req.query.data)

  let url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${req.query.data.latitude},${req.query.data.longitude}`;

  superagent.get(url).then(response => {

    let dailyData = response.body.daily.data;

    let nextForecast = dailyData.map((val) => {
      let nextForeCastObj = new Forcast(val.summary, val.time);
      return nextForeCastObj;
    });

    res.send(nextForecast);

  }).catch(err => {
    console.error(err);
  })

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



app.listen(PORT, () => {
  console.log(`App is on PORT: ${PORT}`);
});

