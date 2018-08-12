import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import set from 'lodash/set';

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
    console.log('hey', this.state.standard ? this.state : false)
    console.log('hey', this.state.ppr ? this.state : false)
    console.log('hey', this.state.hppr ? this.state : false)
    console.log('lala', this.state.predraftRankings ? this.state : "noPredraft")
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        // Render the newly fetched data inside of this.state.data
        <p className="App-intro"></p>
      </div>
    );
  }
}

export default App;
