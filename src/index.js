const Web3 = require('web3')
const cron = require('node-cron')
const express = require('express')
const fs = require('fs')

app = express()
/* 
* * * * * *
| | | | | |
| | | | | day of week
| | | | month
| | | day of month
| | hour
| minute
second ( optional )
 */

var accounts;
var web3;

var tokAddress;
var tokAbi;
var tok;

async function getNet() {
    web3 = new Web3('http://localhost:8545');
    accounts = await web3.eth.getAccounts();
    console.log(accounts);
}

function getContracts() {
    tokAddress = "0xa44eD41638e02638302Ca270d0B65145A675b820";
    tokAbi = require('../build/contracts/DDToken.json').abi;
    tok = new web3.eth.Contract(tokAbi, tokAddress);
}

function schedulePayment(sender, receiver, amount, secs) {
    var task = cron.schedule(`*/${secs} * * * * *`, async () => {
        var temp1 = await tok.methods.balanceOf(sender).call()
        var temp2 = await tok.methods.balanceOf(receiver).call()
        await tok.methods.transfer(receiver, amount).send({ from: sender })
        console.log(`Balances are ${temp1} and ${temp2}.`)
    }, {
        scheduled: false
    })
    return task
}

app.get('/', (req, res) => {
    getNet()
    getContracts()
    res.send(`Environment is up. Web3 is ${web3}`)
})

app.get('/:sender/:receiver/:amount/:secs', (req, res) => {
    var task = schedulePayment(req.params.sender, req.params.receiver, req.params.amount, req.params.secs)
    task.start()
    res.send(`autoTransfer task started. Check the console to see balance updates.`)
})

app.listen(3000, () => {
    console.log("Server listening on port 3000.")
})