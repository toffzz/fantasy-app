import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
state = {
    fantasyPros: null,
    fantasyFootballers: null
  };

  componentDidMount() {
      // Call our fetch function below once the component mounts
    this.callFantasyPros()
      .then(res => {
        //console.log(res)
        this.setState({ fantasyPros: res.data })
      })
      .catch(err => console.log(err));

    this.callFantasyFootballers()
      .then(res => {
        //console.log(res)
        this.setState({ fantasyFootballers: res.data })
      })
      .catch(err => console.log(err));
  }
    // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  /*callBackendAPI = async () => {
    const response = await fetch('/fantasyfootballers');
    //const response = await fetch('/fantasypros');
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message)
    }
    return body;
  };*/

  callFantasyPros = () => {
    return new Promise((resolve) => {
      fetch('/fantasypros').then((response) => {
        const body = response.json()
        if(response.status !== 200) {
          throw Error(body.message)
        }
        resolve(body)
      })
    })
  }

  callFantasyFootballers = () => {
    return new Promise((resolve) => {
      fetch('/fantasyfootballers').then((response) => {
        const body = response.json()
        if(response.status !== 200) {
          throw Error(body.message)
        }
        resolve(body)
      })
    })
  }

  render() {
    console.log('hey', this.state.fantasyPros ? this.state : false)
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
