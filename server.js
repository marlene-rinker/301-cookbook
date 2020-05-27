'use strict';

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();
const methodOverride = require('method-override');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true}));
app.use(express.static('./public'));
app.use(methodOverride('_overrideMethod'));
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
client.connect();

//routes
app.get('/test',(req, res)=>{
  res.render('pages/test.ejs');
})
app.post('/test', saveRecipe);
// app.post('/save', saveRecipe);
// app.get('/test',(req, res) => {
//   // res.send('The recipe was saved')
//   res.render('pages/show.ejs', {message: 'The recipe was saved'})
// });


//functions

function saveRecipe(req, res) {
  console.log('saving on server');
  const sqlQuery = 'INSERT INTO recipes (title, image, sourceUrl, readyInMinutes, servings, api_id) VALUES ($1, $2, $3, $4, $5, $6)';
  const sqlValues = [req.body.title, req.body.image, req.body.sourceUrl, req.body.readyInMinutes, req.body.servings, req.body.id];
  client.query(sqlQuery, sqlValues)
    .then (() => {
      res.send();
    })
    .catch(error => {
      console.log(error);
    })
}




app.listen(PORT, console.log(`running on ${PORT}`));
