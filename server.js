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

app.get('/pages/show', (req, res) => res.render('pages/show'))

//== TODO: Constructor for Recipe Object ==//

function RecipeCard(apiObj){
  const card = apiObj.results;
 
  this.title = card.title;
  this.image = card.image ? card.image : 'public/styles/imgs/alt-image-lorempixel.jpg'; //!!! we may need to check the <type> of this return, is it an actual image asset? or a minified link to an image asset
  this.sourceUrl = card.sourceUrl ? httpSecure(card.sourceUrl) : 'We\'re sorry, that is unavailable at this time.';
  this.readyInMinutes = card.readyInMinutes;
  this.servings = card.servings;
  this.foreignKey;
  this.api_id = card.id // this may be most useful if we open the option to search further details on a saved recipe, allowing us to make single api calls for each purpose instead of needing more than one. 
  
}

//== TODO:  Constructor Method for Query Object ==//

RecipeCard.Query = function (req, res){
  this.apiKey = process.env.SPOONTACULAR_API_KEY;
  this.query = req.body.search;
  this.number = 10; // may be made dynamic if future patches allow filtering number of results. 
  this.type = 'application/json'

}


//=== !!! Callback for app.post(/search)==//
function searchResults(req, res){
  const spoonUrl = 'https://api.spoonacular.com/recipes/search';
  const query = new RecipeCard.Query(req);

  console.log('req.body', req.body)
  console.log('req.params', req.body.params)
  console.log('req.query', req.body.query)
  superagent.get(spoonUrl)
    .query(query)
    .then(list => compileList(list))
    .then(menu => renderMenu(menu))
    .catch(error => errorCatch(req, res, error, 'pages/error.ejs'))
};

//== Runs respons from api through constructor and returns: array of object literals. 
function compileList(list){
  const menu = list.body.results.map(curr => new RecipeCard(curr));
  return menu; 
}


//== passes object literal to the show route for use by ejs. returns: objectLiteral with property list value is array of objectLiterals. 
function renderMenu(req, res, menu){
  res.render('/pages/show', {'list' : menu});
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
