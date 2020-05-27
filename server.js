'use strict';

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const app = express();
const methodOverride = require('method-override');
const cors = require('cors');


//== MiddleWare ==//
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true}));
app.use(express.static('./public'));
app.use(methodOverride('_overrideMethod'));
app.use(cors());


const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
client.connect();


app.get('/', (req, res) => res.render('pages/index'))

//===!!!search route Querries API Spoontacular. ====//
//=== the functions contained within will be later extracted into a module. 
app.post('/search', searchResults)

app.get('/show', (req, res) => res.render('show.ejs'))

//== Constructor for Recipe Object ==//
// image size options 90x90, 240x150, 312x150
// the img extension can be found at the end of the card.image value, if we need to make this dynamic we can use a function to pull the extention and pass it in to the template literal
 
function RecipeCard(apiObj){
 
  this.title = apiObj.title;
  this.image = apiObj.image ? ` https://spoonacular.com/recipeImages/${this.api_id}-240x150.` : 'public/styles/imgs/alt-image-lorempixel.jpg';
  this.sourceUrl = apiObj.sourceUrl ? httpSecure(apiObj.sourceUrl) : 'We\'re sorry, that is unavailable at this time.';
  this.readyInMinutes = apiObj.readyInMinutes;
  this.servings = apiObj.servings;
  this.foreignKey;
  this.api_id = apiObj.id // this may be most useful if we open the option to search further details on a saved recipe, allowing us to make single api calls for each purpose instead of needing more than one. 
  
}

//== Constructor Method for Query Object ==//

RecipeCard.Query = function (req, res){
  
  this.apiKey = process.env.SPOONTACULAR_API_KEY;
  this.query = req.body.search;
  this.number = 1; // may be made dynamic if future patches allow filtering number of results. 
}


//=== !!! Callback for app.post(/search)==//
function searchResults(req, res){
  // console.log('req.body@ searchResults:server.js-->', req.body)//[x] returns:{search : 'meatloaf'}
  const spoonUrl = 'https://api.spoonacular.com/recipes/search';
  const query = new RecipeCard.Query(req);
  
  superagent.get(spoonUrl)
    .set( 'Content-Type', 'application/json')
    .accept('application/json')
    .query(query)
    .then(list => compileList(list))
    .then(menu => renderMenu(req, res, menu))
    .catch(error => errorCatch(req, res, error, 'pages/error.ejs'))
};

//== Runs response from api through constructor and returns: array of object literals. 
function compileList(list){
  //[x] console.log('list.body.results[0] @ compileList:server.js-->', list.body.results[0]);
  const menu = list.body.results.map(curr => new RecipeCard(curr))
  return menu; 
}

//== passes object literal to the show route for use by ejs. returns: objectLiteral format--> { list : [ {},{}...{} ] }. 
function renderMenu(res, menu){
  // console.log('menu @renderMenu:server.js', menu)
  res.render('./pages/show', {'list' : menu , 'showResults': true});
}
//==!!! FUNCTION TO APPLY SECURED PROTOCOL TO URLS=== inputReq: url <string> !!!//
//
function httpSecure(url){
  if(url.charAt(4) !== 's'){  
   return `https${url.slice(4)}` 
  } else {
    return url;
  }
 }

 //!!! == ERROR HANDLER !!! inputReq: error from .catch, req, res, and the correct path as a string. 
function errorCatch(req, res, error, path){
  res.render(`${path}`, {'error': error});
}

app.get('/', (request, response) => {
    response.render('pages/index');
});

app.listen(PORT, console.log(`running on ${PORT}`));
