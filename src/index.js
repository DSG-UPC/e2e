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
    tokAddress = "----";
    tokAbi = require('../build/contracts/DDToken.json').abi;
    tok = new web3.eth.Contract(tokAbi, tokAddress);

    subAddress = "----";
    subAbi = require('../build/contracts/Subscriber.json').abi;
    sub = new web3.eth.Contract(subAbi, subAddress);

    medAddress = "----";
    medAbi = require('../build/contracts/Mediator.json').abi;
    med = new web3.eth.Contract(medAbi, medAddress);

    provAddress = "----";
    provAbi = require('../build/contracts/Provider.json').abi;
    prov = new web3.eth.Contract(provAbi, provAddress);
}

function getSub(at) {
    return new web3.eth.Contract(require('../build/contracts/Subscriber.json').abi, at)
}

function getMed(at) {
    return new web3.eth.Contract(require('../build/contracts/Mediator.json').abi, at)
}

function getProv(at) {
    return new web3.eth.Contract(require('../build/contracts/Provider.json').abi, at)
}

function getTok(at) {
    return new web3.eth.Contract(require('../build/contracts/DDToken.json').abi, at)
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

function periodicPayment(s, m, p, t, l, periodicity, num) {
    var time
    switch (periodicity) {
        case `second`:
            time = `*/${num} * * * * *`
            break
        case `day`:
            time = `* * * 1 * *`
            break
        case `month`:
            time = `* * * * ${num} *`
            break
        default:
            time = `*/${10} * * * * *`
    }
    var task = cron.schedule(time, async () => {
        console.log("Generating automated payment.")
        var temp1 = await getTok(t).methods.balanceOf(s).call()
        var temp2 = await getTok(t).methods.balanceOf(m).call()
        console.log(`${temp1} -- ${temp2}`)
        var charger = getMed(m)
        console.log('Starting transfer.')
        charger.methods.medPullFromSub(p, s, 1).send({ from: accounts[0], gas: 5000000 }).then(() => {
            console.log(`Balances are ${temp1} and ${temp2}.`)
        }, () => {
            console.log(`Something went wrong.`)
        })
    }, {
        scheduled: true
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
        getTok(req.query.tok).methods.balanceOf(String(req.query.acc)).call().then(bal => {
            res.send(`Balance of the account is ${bal}`)
        }, () => {
            console.log(`Request to Blockchain failed.`)
        })
    }
    catch (e) {
        console.log(e)
        res.send(`There was an error reading the balance of the account.`)
    }
})

app.get('/subscribe', (req, res) => {
    /* REQUEST HAS TO INCLUDE BOTH THE ACCOUNT OF THE SUBSCRIBER CONTRACT, AND THE ACCOUNT OF THE CLIENT. IS IT THE SAME? */
    /* AMOUNT PULLED PERIODICALLY IS SET TO TE LIMIT. IS THE AMOUNT FIXED, OR VARIABLE? IF VARIABLE, HOW DOES IT CHANGE? FOR TESTING, MEDIATOR CHARGES THE MAX ALLOWED AMOUNT TO SUB.*/
    getSub(String(req.query.sub)).methods.subscribeToProv(String(req.query.prov), String(req.query.med), parseInt(req.query.limit)).send({ from: accounts[0], gas: 5000000 })
        .then(() => {
            paymentsMapping.set(`${String(req.query.sub)}-${String(req.query.med)}-${String(req.query.prov)}`, periodicPayment(String(req.query.sub), String(req.query.med), String(req.query.prov), String(req.query.tok), parseInt(req.query.limit), String(req.query.periodicity), parseInt(req.query.num)))
            res.send(`Subscription created. Generating automated payment task.`)
        }, () => {
            res.send(`Request to Blockchain failed.`)
        })

})

app.get('/enableCharging', (req, res) => {
    getMed(req.query.med).methods.enableCharging(String(req.query.prov), String(req.query.sub)).send({ from: accounts[0], gas: 5000000 }).then(() => {
        res.send(`Provider ${String(req.query.prov)} CAN pull deposits of Subscriber ${String(req.query.sub)} through Mediator ${req.query.med}`)
    }, () => {
        res.send(`Request to Blockchain failed.`)
    })
})

app.get('/disableCharging', (req, res) => {
    getMed(req.query.med).methods.disableCharging(String(req.query.prov), String(req.query.sub)).send({ from: accounts[0], gas: 5000000 }).then(() => {
        res.send(`Provider ${String(req.query.prov)} CANNOT pull deposits of Subscriber ${String(req.query.sub)} through Mediator ${req.query.med}`)
    }, () => {
        res.send(`Request to Blockchain failed.`)
    })
})

/* NON-AUTOMATED PULLING FROM SUBSCRIBER. UNNECESSARY IF SUBSCRIPTION SET, SINCE IT CREATES AN AUTOMATED TASK WITH THE SAME EFFECT */
app.get('/pullSub', (req, res) => {
    med.methods.medPullFromSub(String(req.query.prov), String(req.query.sub), parseInt(req.query.amount)).send({ from: accounts[0], gas: 5000000 }).then(() => {
        res.send(`Mediator pulled from Sub. Check balances.`)
    }, () => {
        res.send(`Request to Blockchain failed.`)
    })
})

app.get('/pullMed', (req, res) => {
    getProv(req.query.prov).methods.pull(String(req.query.med), String(req.query.sub), parseInt(req.query.amount)).send({ from: accounts[0], gas: 5000000 }).then(() => {
        res.send(`Provider pulled from Med. Check balances.`)
    }, () => {
        res.send(`Request to Blockchain failed.`)
    })
})

app.listen(3000, () => {
    console.log("Server listening on port 3000.")

    getNet()
    //getContracts()
    paymentsMapping = new Map();
    console.log(`Environment is up. Web3 is ${web3}`)
})