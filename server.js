'use strict';

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const app = express();
const methodOverride = require('method-override');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(methodOverride('_overrideMethod'));

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
client.connect();

//routes

app.post('/save', saveRecipe);



//functions

function saveRecipe(req, res) {
  console.log('saving on server');
  const sqlQuery = 'INSERT INTO recipes (title, image, sourceUrl, readyInMinutes, servings, api_id) VALUES ($1, $2, $3, $4, $5, $6)';
  const sqlValues = [req.body.title, req.body.image, req.body.sourceUrl, req.body.readyInMinutes, req.body.servings, req.body.id];
  client.query(sqlQuery, sqlValues)
    .then(() => {
      res.send();
    })
    .catch(error => {
      console.log(error);
    })
}

const marlene = { name: 'Marlene Rinker', image: 'styles/imgs/MRinker_photo.jpeg', bio: 'I’m a Full-stack JavaScript software developer with a background in instructional design, technical writing, QA, and accounting. I love collaborating with others to create a great customer experience. In my past roles, I helped customers though documentation, training, and testing. Now, as a software developer, I get to help customers by influencing how the software is built.' };

const mason = { name: 'Mason Fryberger', image: 'styles/imgs/Mason.jpeg', bio: 'RTS gamer (the real kind, not mobile wannabes) Nickname from construction crew \"fishhook\", Favorite quote right now: "sometimes you win, sometimes you learn, fail forward" ~John C Maxwell~' };

const david = { name: 'David Palagashvili', image: 'styles/imgs/David.jpg', bio: '' };

const wolfe = { name: 'Dave Wolfe', image: 'styles/imgs/Dave.jpg', bio: 'I am a Full Stack JavaScript Developer with a background in sales, customer service, and Quality Assurance for mobile and desktop applications. I’ve owned my own business, volunteered for professional and non-professional organizations, and have experience organizing and running large events. I’m looking for a position as a front end developer, where I can utilize my skills to work directly with internal and external customers, to develop quality software. In my personal life I’m passionate about riding and working on my motorcycle.' };

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
  console.log('last array', newArr);

  return newArr;
}




app.get('/', (request, response) => {
  response.render('pages/index');
});

app.get('/about', (request, response) => {
  response.render('pages/about_us', {'bioArray': bios});
});

app.listen(PORT, console.log(`running on ${PORT}`));

const bios = randomBios();
