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
var paymentsMapping;

var tokAddress;
var tokAbi;
var tok;

async function getNet() {
    web3 = new Web3('http://localhost:8545');
    accounts = await web3.eth.getAccounts();
    console.log(accounts);
}

function getContracts() {
    tokAddress = "----";
    tokAbi = require('../build/contracts/DDToken.json').abi;
    tok = new web3.eth.Contract(tokAbi, tokAddress);

    tokAddress = "----";
    tokAbi = require('../build/contracts/DDToken.json').abi;
    tok = new web3.eth.Contract(tokAbi, tokAddress);

    tokAddress = "----";
    tokAbi = require('../build/contracts/DDToken.json').abi;
    tok = new web3.eth.Contract(tokAbi, tokAddress);
}

function schedulePayment(sender, receiver, amount, secs) {
    var task = cron.schedule(`*/${secs} * * * * *`, async () => {
        console.log("Starting task.")
        var temp1 = await tok.methods.balanceOf(sender).call()
        var temp2 = await tok.methods.balanceOf(receiver).call()
        console.log('Starting transfer.')
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
    paymentsMapping = new Map();
    res.send(`Environment is up. Web3 is ${web3}`)
})

app.get('/addPayment/:sender/:receiver/:amount/:secs', (req, res) => {
    if (paymentsMapping.has(`${req.params.sender}-to-${req.params.receiver}`)) {
        res.send(`This payment already exists. Use a different sender-receiver combination.`)
    } else {
        paymentsMapping.set(`${req.params.sender}-to-${req.params.receiver}`, schedulePayment(req.params.sender, req.params.receiver, req.params.amount, req.params.secs))
        paymentsMapping.get(`${req.params.sender}-to-${req.params.receiver}`).start()
        console.log(typeof( paymentsMapping.get(`${req.params.sender}-to-${req.params.receiver}`)))
        res.send(`autoTransfer task started. Check the console to see balance updates.`)
    }
})

app.get('/deletePayment/:sender/:receiver/:amount/:secs', (req, res) => {
    if (!paymentsMapping.has(`${req.params.sender}-to-${req.params.receiver}`)) {
        res.send(`This payment does not exist. Use a different sender-receiver combination.`)
    } else {
        paymentsMapping.get(`${req.params.sender}-to-${req.params.receiver}`).stop()
        paymentsMapping.delete(`${req.params.sender}-to-${req.params.receiver}`)
        res.send(`autoTransfer task deleted.`)
    }
})

app.get('/changePayment/:sender/:receiver/:amount/:secs', (req, res) => {
    if (!paymentsMapping.has(`${req.params.sender}-to-${req.params.receiver}`)) {
        res.send(`This payment does not exist. Use a different sender-receiver combination, or create a new payment.`)
    } else {
        paymentsMapping.get(`${req.params.sender}-to-${req.params.receiver}`).stop()
        paymentsMapping.delete(`${req.params.sender}-to-${req.params.receiver}`)
        paymentsMapping.set(`${req.params.sender}-to-${req.params.receiver}`, schedulePayment(req.params.sender, req.params.receiver, req.params.amount, req.params.secs))
        paymentsMapping.get(`${req.params.sender}-to-${req.params.receiver}`).start()
        res.send(`autoTransfer task modified. Check the console to see balance updates.`)
    }
})

app.get('/seePayments', (req, res) => {
    console.log(paymentsMapping)
    res.send(cron.getTasks())
})

app.listen(3000, () => {
    console.log("Server listening on port 3000.")
})