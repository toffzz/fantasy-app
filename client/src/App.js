import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import set from 'lodash/set';
import get from 'lodash/get';
import filter from 'lodash/filter';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

class App extends Component {
  state = {
  };

  constructor(props) {
      super(props)
  }

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

  getType(){
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('type')
  }

  getPlatform(){
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('platform')
  }
  fetchApi = (baseUrl, type = 'standard') => {
    baseUrl = baseUrl.toLowerCase()
    return new Promise((resolve) => {
      fetch('/' + baseUrl + '/' + type).then((response) => {
        const body = response.json()
        if(response.status !== 200) {
          throw Error(body.message)
        }
        resolve(body)
      })
    })
  }

  fetchPredraftRankings = () => {
    let baseUrl = 'espn'
    if(this.getPlatform() === 'fleaflicker'){
      baseUrl = 'fleaflicker'
    }
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

    const createTableData = () => {
      let tableData = []
      let type = (this.getType() === 'ppr' || this.getType() === 'hppr') ? this.getType() : 'standard'

      const predraftRankings = get(this.state, 'predraftRankings')
      const fpRanks = get(this.state, [type, 'fantasyPros'])
      const ffbRanks = get(this.state, [type, 'fantasyFootballers'])

      predraftRankings.forEach(pdObj => {
        let fpObj = find(fpRanks, (o) => {
          return o.name.toLowerCase() === pdObj.name.toLowerCase()
        })

        let ffbObj = find(ffbRanks, (o) => {
          return o.name.toLowerCase() === pdObj.name.toLowerCase()
        })

        let rankObj = {
          rank: pdObj.rank,
          name: pdObj.name,
          selected: pdObj.selected,
          fpRank: get(fpObj, 'rank'),
          ffbRank: get(ffbObj, 'rank'),
          andyRank: get(ffbObj, 'andyRank'),
          jasonRank: get(ffbObj, 'jasonRank'),
          mikeRank: get(ffbObj, 'mikeRank')
        }
        tableData.push(rankObj)
      })

      return tableData
    }

    const playerSelect = (name) =>{
      this.setState((prevState)=> {
        const rankIndex = findIndex(prevState.predraftRankings, { name: name })
        const prevSelectState = get(prevState, ['predraftRankings', rankIndex, 'selected'])
        set(prevState, ['predraftRankings', rankIndex, 'selected'], !prevSelectState)
        return prevState
      })
    }

    const greenShades = {
      //0CA630 - https://www.tutorialrepublic.com/html-reference/html-color-picker.php
      1: '#E6F6EA',
      2: '#CEEDD5',
      3: '#B6E4C0',
      4: '#9DDBAC',
      5: '#85D297',
      6: '#6DC982',
      7: '#54C06E',
      8: '#3CB759',
      9: '#24AE44',
      10: '#0CA630',
      11: '#0A952B',
      12: '#098426',
      13: '#087421',
      14: '#07631C',
      15: '#065318'
    }

    const redShades = {
      //ED6DA0 - https://www.tutorialrepublic.com/html-reference/html-color-picker.php
      1: '#FDF0F5',
      2: '#FBE1EC',
      3: '#F9D3E2',
      4: '#F7C4D9',
      5: '#F6B6CF',
      6: '#F4A7C6',
      7: '#F298BC',
      8: '#F08AB3',
      9: '#EE7BA9',
      10: '#ED6DA0',
      11: '#D56290',
      12: '#BD5780',
      13: '#A54C70',
      14: '#8E4160',
      15: '#763650'
    }
    const handleStyle = (row) => {
      const strikeThroughStyle = () => {
        let returnStyle = {}

        if(row.column.parentColumn){
          returnStyle.width = '100%'
          returnStyle.display = 'block'

          const rankDiff = row.original.rank - row.value
          const shadeLevel = Math.abs(Math.floor(rankDiff / 2))
          if(shadeLevel != 0){
            if(rankDiff > 0){
              returnStyle.backgroundColor = greenShades[shadeLevel] ? greenShades[shadeLevel] : '#065318'
            } else if (rankDiff < 0) {
              returnStyle.backgroundColor = redShades[shadeLevel] ? redShades[shadeLevel] : '#630028'
            }
          }
        }

        if(row.original.selected === true){
          returnStyle.textDecoration = 'line-through'
          returnStyle.color = row.column.id !== 'name' ? 'white' : '#CFCFCF'
          returnStyle.backgroundColor = 'white'
        }

        return returnStyle
      }
      return(
        <span style={strikeThroughStyle()}> { row.value } </span>
      )
    }

    const columns = [
      {
        Header: 'Selected',
        Cell: row => {
          const clickHandler = () => {
            playerSelect(row.original.name)
          }
          return(<div onClick={() => clickHandler()}>(x)</div>)
        }
      },
      {
        Header: 'Rank',
        accessor: 'rank',
        Cell: row => handleStyle(row)
      },
      {
        Header: 'Name',
        accessor: 'name',
        Cell: row => handleStyle(row)
      },
      {
        Header: "Fantasy Pros",
        columns: [
          {
            Header: 'Rank',
            accessor: 'fpRank',
            Cell: row => handleStyle(row)
          }
        ]
      },
      {
        Header: "Fantasy Footballers",
        columns: [
          {
            Header: 'Rank',
            accessor: 'ffbRank',
            Cell: row => handleStyle(row)
          },
          {
            Header: 'Andy Rank',
            accessor: 'andyRank',
            Cell: row => handleStyle(row)
          },
          {
            Header: 'Jason Rank',
            accessor: 'jasonRank',
            Cell: row => handleStyle(row)
          },
          {
            Header: 'Mike Rank',
            accessor: 'mikeRank',
            Cell: row => handleStyle(row)
          }
        ]
      }
    ]

    return (
      <div className="App">
        { get(this.state, ['standard', 'fantasyPros']) && get(this.state, ['standard', 'fantasyFootballers']) &&
          get(this.state, ['hppr', 'fantasyPros']) && get(this.state, ['hppr', 'fantasyFootballers']) &&
          get(this.state, ['ppr', 'fantasyPros']) && get(this.state, ['ppr', 'fantasyFootballers']) &&
          get(this.state, ['predraftRankings']) &&
          <ReactTable
            data={createTableData()}
            columns={columns}
          />
        }
      </div>
    );
  }
}

export default App;
