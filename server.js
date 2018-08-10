
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cheerio = require('cheerio');
const request = require('request');
const _ = require('lodash')
const csv = require('csvtojson')

const processName = (name) => {
  const splitName = name === undefined ? [] : name.split(' ')
  let returnName = ''

  if(splitName.length > 2){
    if(splitName[splitName.length - 1].startsWith("(")){
      splitName.forEach((sName, i) => {
        if(i < splitName.length - 2){
          returnName = returnName + (i === 0 ? '' : ' ') + sName
        }
      })
    }
  }

  return returnName !== '' ? returnName : name
}

app.use(express.static('public'))

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
app.get('/fantasypros', (req, res) => {
  request.get('https://www.fantasypros.com/nfl/adp/overall.php', (err, response, body) => {
    if (err) { return console.log(err); }
    const $ = cheerio.load(body)
    let players = []
    $('table.player-table tbody tr').each((i, element)=>{
      const obj = {
        rank: $(element).children('td').eq(0).text().trim(),
        name: processName($(element).children('td').eq(1).text().trim()),
        pos: $(element).children('td').eq(2).text().trim()
      }
      console.log(obj)
      players.push(obj)
    })
    res.send({ data: players });
  });
});

app.get('/fantasyfootballers', (req, res) => {
  const csvFilePath = 'public/fantasyfootballers/standard.csv'

  csv()
  .fromFile(csvFilePath)
  .then((jsonObj)=>{
      jsonObj = JSON.parse(JSON.stringify(jsonObj).replace(/Player Name/g, 'name'))
      console.log(jsonObj);

      let players = []
      jsonObj.forEach((rank)=>{
        const obj = {
          rank: parseInt(rank.Consensus),
          andyRank: parseInt(rank.Andy),
          jasonRank: parseInt(rank.Jason),
          mikeRank: parseInt(rank.Mike),
          name: processName(rank['name']),
          pos: rank.pos
        }
        players.push(obj)
      })

      res.send({ data: players })
  })
})
