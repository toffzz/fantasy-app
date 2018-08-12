import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import set from 'lodash/set';
import get from 'lodash/get';
import filter from 'lodash/filter';

class App extends Component {
  state = {
  };

  componentDidMount() {
      // Call our fetch function below once the component mounts
    const rankingApis = ['fantasyPros', 'fantasyFootballers']
    const rankTypes = ['standard', 'hppr', 'ppr']

    rankTypes.forEach((rankType) => {
      rankingApis.forEach((api) => {
        this.fetchApi(api, rankType)
          .then(res => {
            this.setState(prevState => {
              let apiObj = prevState || prevState[rankType] || prevState[rankType][api]
              set(apiObj, [rankType, api], res.data)
              return apiObj
            })
          })
          .catch(err => console.log(err));
      })
    })

    this.fetchPredraftRankings().then((rankingsData)=>{
      this.setState({ predraftRankings: rankingsData.data })
    })
  }

  fetchApi = (baseUrl, type = 'standard') => {
    baseUrl = baseUrl.toLowerCase()
    return new Promise((resolve) => {
      fetch('/' + baseUrl + '/:' + type).then((response) => {
        const body = response.json()
        if(response.status !== 200) {
          throw Error(body.message)
        }
        resolve(body)
      })
    })
  }

  fetchPredraftRankings = () => {
    const baseUrl = 'espn'
    return new Promise((resolve) => {
      fetch('/' + baseUrl + '/').then((response) => {
        const body = response.json()
        if(response.status !== 200) {
          throw Error(body.message)
        }
        resolve(body)
      })
    })
  }


  render() {
    const checkNames = (predraft, fantasyPros, fantasyFootballers) => {
      const fantasyProNames = []
      const fantasyFootballersNames = []
      predraft.forEach((pdObj)=>{
        const name = pdObj.name
        const fpMatch = filter(fantasyPros, (obj) => {
          return get(obj, "name").toLowerCase() === name.toLowerCase()
        })
        if(fpMatch.length === 0){
          fantasyProNames.push(name)
        }

        const fbMatch = filter(fantasyFootballers, (obj) => {
          return get(obj, "name").toLowerCase() === name.toLowerCase()
        })
        if(fbMatch.length === 0){
          fantasyFootballersNames.push(name)
        }
      })

      console.log('fp names not match', fantasyProNames)
      console.log('ffb names not match', fantasyFootballersNames)
      return "hi!"
    }

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        { get(this.state, ['standard', 'fantasyPros']) && get(this.state, ['standard', 'fantasyFootballers']) &&
          get(this.state, ['hppr', 'fantasyPros']) && get(this.state, ['hppr', 'fantasyFootballers']) &&
          get(this.state, ['ppr', 'fantasyPros']) && get(this.state, ['ppr', 'fantasyFootballers']) &&
          get(this.state, ['predraftRankings']) &&
          <div>

          </div>
        }
      </div>
    );
  }
}

export default App;
