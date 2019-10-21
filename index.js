'use strict';

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const AWS = require("aws-sdk");


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Express server listening on port ${server.address().port} in ${app.settings.env} mode`);
});

// Reading the inbound SMS messages
const handleRoute = (req, res) => {

  let params = req.body;

  if (req.method === "GET") {
    params = req.query
  }

  if (!params.to || !params.msisdn) {
    res.status(400).send({'error': 'This is not a valid inbound SMS message!'});
  } else {
    translateText(params);
    res.status(200).end();
  }
};

// Using route here to allow for GET or POST from https://dashboard.nexmo.com/settings
app.route('/message')
  .get(handleRoute)
  .post(handleRoute)
  .all((req, res) => res.status(405).send());


function translateText(params) {
  var translate = new AWS.Translate({region: process.env.AWS_REGION})
  var opts = {
    SourceLanguageCode: 'auto',
    TargetLanguageCode: 'en',
    Text: params.text
  };
  translate.translateText(opts, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    }
    else{
      console.log(params.text);
      console.dir(data, {depth: null})
    }
  });
}
