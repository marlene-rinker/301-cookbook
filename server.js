'use strict';

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();
const methodOverride = require(method-override);

app.set('view engine', 'ejs');
app.use(express.urlunencoded({ extended: true}));
app.use(express.static('./public'));
app.use(methodOverride('_overrideMethod'));
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
client.connect();








app.listen(PORT, console.log(`running on ${PORT}`));
