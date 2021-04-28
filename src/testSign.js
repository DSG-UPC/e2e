const Web3 = require('web3')
const DDToken = require('../build/contracts/DDToken.json')
const Mediator = require('../build/contracts/Mediator.json')
const nodeplotlib = require('nodeplotlib')
const { Pool } = require('pg')
const { exec } = require('child_process')


async function test0() {
    /* const pool = new Pool({
        host: "localhost",
        port: 5432,
        database: "ereuse",
        user: "ereuse",
        password: "ereuse"
    }) */

    /* .\node_modules\.bin\ganache-cli -m 'neck above size height island destroy they crisp excess total tissue train' -a 50 --account_keys_path keys.json */
    /* ADAPT TO PROVIDER: LOCAL VS TESTBED */
    //web3 = new Web3('http://45.150.187.30:8545');
    web3 = new Web3('http://127.0.0.1:8545');
    accounts = require('../keys.json');
    console.log(`0x${accounts.private_keys['0xeed32604ec378419becd9941ad3ae3e7b0a8d398']}`)
    net = await web3.eth.net.getId()
    chain = await web3.eth.getChainId()

    tokAt = DDToken.networks[net].address
    tok = new web3.eth.Contract(DDToken.abi, tokAt)

    medAt = Mediator.networks[net].address
    med = new web3.eth.Contract(Mediator.abi, medAt)

    console.log(`Using network ${net}.`)
    console.log(`Using chain ${chain}.`)
    console.log(`Token is deployed at ${tokAt}.`)
    console.log(`Mediator is deployed at ${medAt}. Its owner is ${await med.methods.owner().call({ from: accounts[0] })}`)
/*     console.log(`List of subscribers:`)
    for (i = 2; i < 6; ++i) {
        console.log(`           ${accounts[i]}  ${await tok.methods.balanceOf(accounts[i]).call({ from: accounts[0] })} tokens`)
    }
    console.log(`List of providers:`)
    for (i = 6; i < 10; ++i) {
        console.log(`           ${accounts[i]}  ${await tok.methods.balanceOf(accounts[i]).call({ from: accounts[0] })} tokens`)
    } */

    signed = await web3.eth.accounts.signTransaction({
        from: '0xe4ad82972825ecd49b9b90fe5be9a151188d4133',
        to: tokAt,
        gas: 2000000,
        data: tok.methods.transfer('0xe3d5fd083765f6cbe0b45c017653f3fe3b1aee18', 50).encodeABI()
    }, `0x${accounts.private_keys['0xe4ad82972825ecd49b9b90fe5be9a151188d4133']}`)
    var ret = await web3.eth.sendSignedTransaction(signed.rawTransaction)
    
    
    console.log(ret)
    console.log(await tok.methods.balanceOf('0xe4ad82972825ecd49b9b90fe5be9a151188d4133').call({ from: '0xe4ad82972825ecd49b9b90fe5be9a151188d4133' }))
    console.log(await tok.methods.balanceOf('0xe4ad82972825ecd49b9b90fe5be9a151188d4133').call({ from: '0xe4ad82972825ecd49b9b90fe5be9a151188d4133' }))
}

test0()