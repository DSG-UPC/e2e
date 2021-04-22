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

    /* neck above size height island destroy they crisp excess total tissue train */
    /* ADAPT TO PROVIDER: LOCAL VS TESTBED */
    //web3 = new Web3('http://45.150.187.30:8545');
    web3 = new Web3('http://127.0.0.1:8545');
    accounts = require('../keys.json');
    console.log(accounts)
    net = await web3.eth.net.getId()
    chain = await web3.eth.getChainId()

    tokAt = DDToken.networks[net].address
    tok = new web3.eth.Contract(DDToken.abi, tokAt)

    medAt = Mediator.networks[net].address
    med = new web3.eth.Contract(Mediator.abi, medAt)

    console.log(accounts)
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

/*     signed = await web3.eth.accounts.signTransaction({
        from: accounts[2],
        to: tokAt,
        gas: 2000000,
        data: tok.methods.transfer(accounts[3], 50).encodeABI()
    }, '0x3ad5dd57a4984db071edaf9f6ec1df125e31d4721808c875eb6f2f9d33455aeb')
    var ret = await web3.eth.sendSignedTransaction(signed.rawTransaction)
    console.log(ret)
    console.log(await tok.methods.balanceOf(accounts[2]).call({ from: accounts[2] }))
    console.log(await tok.methods.balanceOf(accounts[3]).call({ from: accounts[3] })) */
}

test0()