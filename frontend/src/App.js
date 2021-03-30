import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react'
import Web3 from 'web3'
import { Navbar, Jumbotron, Container, ListGroup } from 'react-bootstrap'
import DDToken from './contracts/DDToken.json'
import Mediator from './contracts/Mediator.json'

class App extends Component {
  async componentDidMount() {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.enable()
      const web3 = new Web3(window.ethereum)
      const net = await web3.eth.net.getId()
      const chain = await web3.eth.getChainId()
      const accounts = await web3.eth.getAccounts()
      if (typeof accounts[0] !== 'undefined') {
        this.setState({
          account: accounts[0],
          web3: web3,
          net: net,
          chain: chain
        })
        console.log(this.state)
      }
      else {
        window.alert('Please install Metamask')
      }
      try{
        /* const token = Token.networks['5777'].address
        const dbankAddress = dBank.networks['5777'].address */
      }
      catch(e){
        console.log(e)
        window.alert(`Could not fetch deployed contracts.`)
      }
    }
    else {
      window.alert('Please install Metamask')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      net: 'undefined',
      chain: 'undefined',
      account: '',
      tokAt: '',
      tok: null,
      medAt: '',
      med: null,
    }
  }

  render() {
    return (
      <div className="App">
        <Navbar bg="light">
          <Navbar.Brand href="/">eReuse</Navbar.Brand>
        </Navbar>
        <Jumbotron fluid>
          <Container>
            <h1>Welcome</h1>
            <ListGroup>
              <ListGroup.Item variant="info">Your account: {this.state.account}</ListGroup.Item>
              <ListGroup.Item variant="info">Token account: {this.state.tokAt}</ListGroup.Item>
              <ListGroup.Item variant="info">Mediator account: {this.state.medAt}</ListGroup.Item>
            </ListGroup>
          </Container>
        </Jumbotron>
      </div>
    )
  }
}

/* function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
} */

export default App;
