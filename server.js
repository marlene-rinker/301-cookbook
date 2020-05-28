'use strict';

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();

const PORT = process.env.PORT;
const app = express();
const methodOverride = require('method-override');
const cors = require('cors');


//== MiddleWare ==//
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(methodOverride('_overrideMethod'));
app.use(cors());


const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
client.connect();

//===!!!search route Querries API Spoontacular. ====//
//=== the functions contained within will be later extracted into a module.

//routes
app.get('/', showHome);
app.post('/save', saveRecipe);
app.delete('/delete', deleteRecipe);
app.get('/my-superdex', showSaved);
app.post('/search', searchResults);

app.get('/about', (request, response) => {
  response.render('pages/about_us', { 'bioArray': bios });
});

//=== the functions contained within will be later extracted into a module. functions marked with [x] need no refactoring for modulation. 

function showHome(req, res) {
  res.render('pages/index.ejs');
}


//==[x] Constructor for Recipe Object ==//
// image size options 90x90, 240x150, 312x150

function RecipeCard(apiObj) {

  this.title = apiObj.title;
  this.image = apiObj.image ? `https://spoonacular.com/recipeImages/${apiObj.id}-240x150` : 'public/styles/imgs/alt-image-lorempixel.jpg';
  this.sourceurl = apiObj.sourceUrl ? httpSecure(apiObj.sourceUrl) : 'We\'re sorry, that is unavailable at this time.';
  this.readyinminutes = apiObj.readyInMinutes;
  this.servings = apiObj.servings;
  this.foreignKey;
  this.api_id = apiObj.id // this may be most useful if we open the option to search further details on a saved recipe, allowing us to make single api calls for each purpose instead of needing more than one.
}

//== Constructor Method for Query Object ==//

RecipeCard.Query = function (req, res) {

  this.apiKey = process.env.SPOONACULAR_API_KEY;
  this.query = req.body.search;
  this.number = 10; // may be made dynamic if future patches allow filtering number of results.
}

//===[x] Callback for app.post(/search)==//
function searchResults(req, res) {
  const spoonUrl = 'https://api.spoonacular.com/recipes/search';
  const query = new RecipeCard.Query(req);

  superagent.get(spoonUrl)
    .set('Content-Type', 'application/json')
    .accept('application/json')
    .query(query)
    .then(list => compileList(list))
    .then(menu => renderMenu(res, menu))
    .catch(error => errorCatch(req, res, error, 'pages/error.ejs'))
}

//== [x] Runs response from api through constructor and returns: array of object literals. 

function compileList(list) {

  const menu = list.body.results.map(curr => new RecipeCard(curr))
  return menu;
}

//== passes object literal to the show route for use by ejs. returns: objectLiteral format--> { list : [ {},{}...{} ] }.
//== [x] Sends results from API  to show.ejs //
function renderMenu(res, menu) {
  // console.log('menu @renderMenu:server.js', menu)
  res.render('pages/show', { 'list': menu, 'showResults': true });
}

//code for about us page

//!!!TODO: modulation requires small refactoring, mostly turning the anonymous arrow function @ app.get('/about') into a callback that calls the randomBios function and returns it's result to the page using it's existing res.render() method and path. 

const marlene = { name: 'Marlene Rinker', image: 'styles/imgs/MRinker_photo.jpeg', bio: 'I’m a Full-stack JavaScript software developer with a background in instructional design, technical writing, QA, and accounting. I love collaborating with others to create a great customer experience. In my past roles, I helped customers though documentation, training, and testing. Now, as a software developer, I get to help customers by influencing how the software is built.', link: 'https://www.linkedin.com/in/marlenerinker/' };

const mason = { name: 'Mason Fryberger', image: 'styles/imgs/Mason.jpeg', bio: 'RTS gamer (the real kind, not mobile wannabes) Nickname from construction crew \"fishhook\", Favorite quote right now: "sometimes you win, sometimes you learn, fail forward" ~John C Maxwell~', link: 'https://www.linkedin.com/in/mason-fryberger-ghub-mason-chance/' };

const david = { name: 'David Palagashvili', image: 'styles/imgs/David.jpg', bio: 'I aim to join the ranks of a company with a national, if not global, vision for a better products, better business, and better service. Raised on 2 continents, 3 Countries, 4 Cities, 6 schools; the choice was sink or swim... and I swam. From food service to sales to middle management, I\'ve worked in several industries and held various positions to learn that a major key to success in any business is to stay at the forefront of technological development. This is evident in the exploits of companies like Amazon, Google, and Tesla to name a few. Such companies are pioneers in their own right and I wish to add to what they\'re accomplishing and help take it even further!', link: 'https://www.linkedin.com/in/david-palagashvili-35040ab0/' };

const wolfe = { name: 'Dave Wolfe', image: 'styles/imgs/Dave.jpg', bio: 'I am a Full Stack JavaScript Developer with a background in sales, customer service, and Quality Assurance for mobile and desktop applications. I’ve owned my own business, volunteered for professional and non-professional organizations, and have experience organizing and running large events. I’m looking for a position as a front end developer, where I can utilize my skills to work directly with internal and external customers, to develop quality software. In my personal life I’m passionate about riding and working on my motorcycle.', link: 'https://www.linkedin.com/in/dave-wolfe623/' };

function randomBios() {
  const bioArr = [marlene, mason, david, wolfe];
  let newArr = [];
  let randomBioIndex = Math.floor(Math.random() * bioArr.length);
  newArr.push(bioArr[randomBioIndex]);

  while (bioArr[randomBioIndex] === newArr[0]) {
    randomBioIndex = Math.floor(Math.random() * bioArr.length);
  }
  newArr.push(bioArr[randomBioIndex]);

  while (bioArr[randomBioIndex] === newArr[0] || bioArr[randomBioIndex] === newArr[1]) {
    randomBioIndex = Math.floor(Math.random() * bioArr.length);
  }
  newArr.push(bioArr[randomBioIndex]);

  while (bioArr[randomBioIndex] === newArr[0] || bioArr[randomBioIndex] === newArr[1] || bioArr[randomBioIndex] === newArr[2]) {
    randomBioIndex = Math.floor(Math.random() * bioArr.length);
  }
  newArr.push(bioArr[randomBioIndex]);
  // console.log('last array', newArr);

  return newArr;
}

const bios = randomBios();

//!!! ready for modulation, no re-factor required.
function saveRecipe(req, res) {
  const sqlQuery = 'INSERT INTO recipes (title, image, sourceUrl, readyInMinutes, servings, api_id) VALUES ($1, $2, $3, $4, $5, $6)';
  const sqlValues = [req.body.title, req.body.image, req.body.sourceurl, req.body.readyinminutes, req.body.servings, req.body.id];
  client.query(sqlQuery, sqlValues)
    .then(() => {
      res.send();
    })
    .catch(error => {
      errorCatch(req, res, error, 'pages/error.ejs');
    })
}

//!!!Ready for modulation, no re-factor required. 
function deleteRecipe(req, res) {
  client.query('DELETE FROM recipes WHERE id=$1', [req.body.id])
    .then(() => {
      res.send()
    })
    .catch(error => {
      errorCatch(req, res, error, 'pages/error.ejs');
    })
}

function showSaved(req, res) {
  const sqlQuery = 'SELECT * FROM recipes';
  client.query(sqlQuery)
    .then(resultFromSql => {
      res.render('pages/show', { list: resultFromSql.rows, showResults: false });
    })
    .catch(error => errorCatch(req, res, error, 'pages/error.ejs'));

}

//==!!! FUNCTION TO APPLY SECURED PROTOCOL TO URLS=== inputReq: url <string> !!!//

function httpSecure(url) {
  if (url.charAt(4) !== 's') {
    return `https${url.slice(4)}`
  } else {
    return url;
  }
}

//!!! == ERROR HANDLER !!! inputReq: error from .catch, req, res, and the correct path as a string. 
function errorCatch(req, res, error, path) {
  res.render(`${path}`, { 'error': error });
}

app.listen(PORT, console.log(`running on ${PORT}`));


