
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cheerio = require('cheerio');
const request = require('request');
const _ = require('lodash')
const csv = require('csvtojson')
const cors = require('cors')

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
app.use(cors())

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
app.get('/fantasypros/:type', cors({ origin: 'http://fantasy-thingy.s3-website-us-east-1.amazonaws.com' }), (req, res) => {
  const fpUrls = {
    hppr: 'https://www.fantasypros.com/nfl/adp/half-point-ppr-overall.php',
    ppr: 'https://www.fantasypros.com/nfl/adp/ppr-overall.php'
  }

  const url = fpUrls[req.params.type] ? fpUrls[req.params.type] : 'https://www.fantasypros.com/nfl/adp/overall.php'

  buildFantasyprosRankings(url).then((players) => {
    res.send({ data: players });
  })

});

app.get('/fantasyfootballers/:type', cors({ origin: 'http://fantasy-thingy.s3-website-us-east-1.amazonaws.com' }),(req, res) => {
  const ffbPaths = {
    hppr: 'public/fantasyfootballers/hppr.csv',
    ppr: 'public/fantasyfootballers/ppr.csv'
  }

  let path = ffbPaths[req.params.type] ? ffbPaths[req.params.type] : 'public/fantasyfootballers/standard.csv'
  let players = []

  csv()
  .fromFile(path)
  .then((jsonObj)=>{
      jsonObj = JSON.parse(JSON.stringify(jsonObj).replace(/Player Name/g, 'name'))
      jsonObj.forEach((rank)=>{
        processFfbRankings(rank, players)
      })

      res.send({ data: players })
  })
})

app.get('/espn', cors({ origin: 'http://fantasy-thingy.s3-website-us-east-1.amazonaws.com' }), (req, res) => {
  const fs = require('fs');

  const processEspnName = (name) => {
    const splitName = name.split(',')

    return splitName[0].split('*')[0]
  }

  fs.readFile('public/espn/draftRankings-10std.html', 'utf8', function (err, data) {
    if (err) throw err;
    const $ = cheerio.load(data)
      let players = []
    $('.draftListPlayerRow').slice(0,350).each((i, element) => {
      const obj = {
        rank: i+1,
        name: processEspnName($(element).children('.draftListPlayerName').text().trim())
      }
      players.push(obj)
    })
    res.send({ data: players })
  });
})

app.get('/fleaflicker', cors({ origin: 'http://fantasy-thingy.s3-website-us-east-1.amazonaws.com' }), (req, res) => {
  const fs = require('fs');

  fs.readFile('public/fleaflicker/rankings.html', 'utf8', function (err, data) {
    if (err) throw err;
    const $ = cheerio.load(data)
      let players = []
    $('.player-text').slice(0,350).each((i, element) => {
      let name = $(element).text().trim()
      name = fleaflickerNameReplace[name] ? fleaflickerNameReplace[name] : name
      const obj = {
        rank: i+1,
        name: name
      }
      players.push(obj)
    })
    res.send({ data: players })
  });
})

const processFfbRankings = (rank, array) => {
  let ffbName = processName(rank['name'])
  ffbName = fantasyFootballersNameReplace[ffbName] ? fantasyFootballersNameReplace[ffbName] : ffbName

  const obj = {
    rank: parseInt(rank.Consensus),
    andyRank: parseInt(rank.Andy),
    jasonRank: parseInt(rank.Jason),
    mikeRank: parseInt(rank.Mike),
    name: ffbName,
    pos: rank.pos
  }

  array.push(obj)
}

const buildFantasyprosRankings = (url) => {
  return new Promise((resolve)=>{
    request.get(url, (err, response, body) => {
      if (err) { return console.log(err); }
      const $ = cheerio.load(body)
      let players = []
      $('table.player-table tbody tr').each((i, element)=>{
        let name = $(element).children('td').eq(1).children('.player-name').text().trim()
        if(name.indexOf('Jaguars') > -1){
          console.log("THIS IS JAGUARS NAME", name)
        }
        name = fantasyProsNameReplace[name] ? fantasyProsNameReplace[name] : name
        const obj = {
          rank: $(element).children('td').eq(0).text().trim(),
          name: name,
          pos: $(element).children('td').eq(2).text().trim()
        }
        players.push(obj)
      })
      resolve(players)
    });
  })
}

const fantasyProsNameReplace = {
  'Todd Gurley': 'Todd Gurley II',
  'Marvin Jones': 'Marvin Jones Jr.',
  'Ronald Jones II': 'Ronald Jones',
  'Mark Ingram': 'Mark Ingram II',
  'Duke Johnson': 'Duke Johnson Jr.',
  'Will Fuller': 'Will Fuller V',
  'D.J. Moore': 'DJ Moore',
  'Robert Kelley': 'Rob Kelley',
  'Jacksonville Jaguars DST': 'Jaguars D/ST',
  'Mitch Trubisky': 'Mitchell Trubisky',
  'Philadelphia Eagles DST': 'Eagles D/ST',
  'Los Angeles Rams DST': 'Rams D/ST',
  'Minnesota Vikings DST': 'Vikings D/ST',
  'Houston Texans DST': 'Texans D/ST',
  'Los Angeles Rams DST': 'Rams D/ST',
  'Baltimore Ravens DST': 'Ravens D/ST',
  'New England Patriots DST': 'Patriots D/ST',
  'Los Angeles Chargers DST': 'Chargers D/ST',
  'Denver Broncos DST': 'Broncos D/ST',
  'New Orleans Saints DST': 'Saints D/ST',
  'Tennessee Titans DST': 'Titans D/ST',
  'Carolina Panthers DST': 'Panthers D/ST',
  'Ted Ginn': 'Ted Ginn Jr.',
  'Washington Redskins DST': 'Redskins D/ST',
  'Arizona Cardinals DST': 'Cardinals D/ST',
  'Atlanta Falcons DST': 'Falcons D/ST',
  'Dallas Cowboys DST': 'Cowboys D/ST'
}

const fantasyFootballersNameReplace = {
  'LeVeon Bell': 'Le\'Veon Bell',
  'Todd Gurley': 'Todd Gurley II',
  'Odell Beckham Jr': 'Odell Beckham Jr.',
  'Marvin Jones': 'Marvin Jones Jr.',
  'Ronald Jones II': 'Ronald Jones',
  'Mark Ingram': 'Mark Ingram II',
  'Duke Johnson': 'Duke Johnson Jr.',
  'Will Fuller': 'Will Fuller V',
  'D.J. Moore': 'DJ Moore',
  'Jack Doyle': 'Jack Doyle',
  'CJ Anderson': 'C.J. Anderson',
  'Mitch Trubisky': 'Mitchell Trubisky',
  'Ted Ginn': 'Ted Ginn Jr.'
}

const fleaflickerNameReplace = {
  'Todd Gurley': 'Todd Gurley II',
  "Odell Beckham": 'Odell Beckham Jr.',
  "Marvin Jones": 'Marvin Jones Jr.',
  "Mark Ingram": 'Mark Ingram II',
  "Will Fuller": 'Will Fuller V',
  "Duke Johnson": 'Duke Johnson Jr.',
  "D.J. Moore": 'DJ Moore',
  "Jacksonville Jaguars": 'Jaguars D/ST',
  "Minnesota Vikings": 'Vikings D/ST',
  "Los Angeles Rams": 'Rams D/ST',
  "Philadelphia Eagles": 'Eagles D/ST',
  "Los Angeles Chargers": 'Chargers D/ST',
  "Ted Ginn": 'Ted Ginn Jr.',
  "Houston Texans": 'Texans D/ST',
  "Denver Broncos": 'Broncos D/ST',
  "Baltimore Ravens": 'Ravens D/ST',
  "New Orleans Saints": 'Saints D/ST',
  "New England Patriots": 'Patriots D/ST',
  "Carolina Panthers": 'Panthers D/ST',
  "Atlanta Falcons": 'Falcons D/ST',
  "Arizona Cardinals": 'Cardinals D/ST',
  "Tennessee Titans": 'Titans D/ST',
  "Washington Redskins": 'Redskins D/ST',
  "Dallas Cowboys": 'Cowboys D/ST'
}
