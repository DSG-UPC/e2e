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

var subAddress;
var subAbi;
var sub;

var medAddress;
var medAbi;
var med;

var provAddress;
var provAbi;
var prov;

async function getNet() {
    web3 = new Web3('http://localhost:8545');
    accounts = await web3.eth.getAccounts();
    console.log(accounts);
}

function getContracts() {
/*     tokAddress = "0x99391F98975d02f65cF2209E5F3137303cB45677";
    tokAbi = require('../build/contracts/DDToken.json').abi;
    tok = new web3.eth.Contract(tokAbi, tokAddress); */

    subAddress = "0x586De1E8864abE6097Ca7E839d63D43Ca5fBf4E0";
    subAbi = require('../build/contracts/Subscriber.json').abi;
    sub = new web3.eth.Contract(subAbi, subAddress);

/*     medAddress = "0x93e799E2a0BDf68Ae21FaE624e37Ab9E287d1CA0";
    medAbi = require('../build/contracts/Mediator.json').abi;
    med = new web3.eth.Contract(medAbi, medAddress);

    provAddress = "0xaf2B1B61314B7A4FC4C59bc8A098EA710041838e";
    provAbi = require('../build/contracts/Provider.json').abi;
    prov = new web3.eth.Contract(provAbi, provAddress); */
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
        console.log(typeof (paymentsMapping.get(`${req.params.sender}-to-${req.params.receiver}`)))
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

app.get('/balance', (req, res) => {
    try {
        tok.methods.balanceOf(String(req.query.acc)).call().then(bal => {
            res.send(`<h1>Balance of the account is ${bal}</h1>`)
        })
    }
    catch (e) {
        console.log(e)
        res.send(`There was an error reading the balance of the account.`)
    }
})

app.get('/subscribe', (req, res) => {
    /* REQUEST HAS TO INCLUDE BOTH THE ACCOUNT OF THE SUBSCRIBER CONTRACT, AND THE ACCOUNT OF THE CLIENT. IS IT THE SAME? */
/*     sub.methods.setToken("0xC7389bFB7d7Daa788Fc85A66D828BB0C6698D707").send({ from: accounts[0] }).then(() => {
        res.send(`Subscription created.`)
    }) */
    sub.methods.subscribeToProv("0xebF313641390E82dFdf5edF8D59747d84e0a68Bd", "0x2e35A4Ea56DB342E2649a4495576C5e8b169e281", "50").send({ from: accounts[0] }).then(() => {
        res.send(`Subscription created.`)
    })
})

app.listen(3000, () => {
    console.log("Server listening on port 3000.")
})