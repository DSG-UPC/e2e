const web3 = require('./web3.js');
const fs = require('fs')
const DDToken = require('../../build/contracts/DDToken.json')
const Mediator = require('../../build/contracts/Mediator.json')

var accounts, net, chain
const nTx = 100;
var ended = new Array(nTx).fill(0)
var endedTxs = 0
var results = new Array(nTx)

const init = async () => {
    net = await web3.eth.net.getId()
    chain = await web3.eth.getChainId()
    accounts = await web3.eth.getAccounts();
    tokAt = DDToken.networks[net].address
    tok = new web3.eth.Contract(DDToken.abi, tokAt)
    medAt = Mediator.networks[net].address
    med = new web3.eth.Contract(Mediator.abi, medAt)

    console.log(`Network ID is ${net}, Chain ID is ${chain}.`)
    console.log(`Mediator is on ${medAt}`)
    console.log(`Token is on ${tokAt}`)
    console.log(`Set of accounts is:`)
    accounts.map(acc => { console.log(`\n${acc}`) })
    console.log('Account sending the transactions: ', accounts[0], '\n');
};

let c = init().then(async function () {
    let nonce = await web3.eth.getTransactionCount(accounts[0]);
    //console.log(nonce);
    /*
    for (rep in PARALLELTRANS) {
      for (sec in SECONDS) {
        waitForSecond(SECONDS[sec]);
        sendTransactions(nonce, PARALLELTRANS[rep], ETHER, SECONDS[sec]);
      }
    }*/
    sendTx(nonce);
});

function writeJSON() {
    // var sum = ended.reduce(function (a, b) {
    //     return a + b;
    // }, 0);
    if (endedTxs == nTx) {
        const json = JSON.stringify(results, null, "\t");
        //console.log(json);
        fs.writeFile('./results.json', json, err => {
            if (err) {
                console.log('Error writing file', err)
            } else {
                console.log('Successfully wrote file')
            }
        })
        let blockNumbers = []
        let latencies = []
        let minLatency = results[0]['returnTime'] - results[0]['sentTime']
        let maxLatency = results[0]['returnTime'] - results[0]['sentTime']
        let max = results[0]['sentTime']
        let min = results[0]['returnTime']
        for (let id = 0; id < nTx; id++) {
            sentTime = results[id]['sentTime']
            returnTime = results[id]['returnTime']
            if (sentTime < min) min = sentTime;
            if (returnTime > max) max = returnTime;
            if (!blockNumbers.includes(results[id]['blockNumber'])) blockNumbers.push(results[id]['blockNumber'])
            //latencia
            let latency = returnTime - sentTime;
            latencies.push(latency)
            if (latency < minLatency) minLatency = latency;
            if (latency > maxLatency) maxLatency = latency;
        }
        console.log(`Completed ${nTx} transactions in ${max - min}ms.`)
        console.log(`${nTx / ((max - min) / 1000)} tx/s`)
        blocksToPrint = `in ${blockNumbers.length} blocks: `
        for (let id = 0; id < blockNumbers.length; id++) {
            blocksToPrint += `${blockNumbers[id]}, `
        }
        latencySum = latencies.reduce(function (a, b) {
            return a + b;
        }, 0);
        avgLatency = latencySum / nTx
        console.log(blocksToPrint)
        console.log(`Average latency per transaction: ${avgLatency}ms`)
        console.log(`Minimum transaction latency: ${minLatency}ms`)
        console.log(`Maximum transaction latency: ${maxLatency}ms`)
        tok.methods.balanceOf(accounts[0]).call({ from: accounts[0] }).then((res, err) => {
            console.log(res)
        })
        tok.methods.balanceOf(accounts[2]).call({ from: accounts[0] }).then((res, err) => {
            console.log(res)
        })
    }
}

function sendTx(nonce) {
    for (let id = 0; id < nTx; id++) {
        nonce += 1
        //console.log(`starting transaction ${id}`)
        results[id] = {};
        results[id]['id'] = id;
        /* web3.eth.sendTransaction({
            from: accounts[0],
            to: accounts[2],
            //nonce: nonce, // increment the nonce for every transaction
            value: web3.utils.toWei('0.0000001'),
            gas: 3000000
        }) */
        web3.eth.sendTransaction({
            from: accounts[0],
            to: tokAt,
            gas: 200000,
            data: tok.methods.transfer(accounts[2], 50).encodeABI()
        })
            //.once('sending', function(payload){ results[id]['sendingTime']=Date.now() })
            .once('sent', function (payload) {
                results[id]['sentTime'] = Date.now()
                console.log(`sent transaction ${id}`)
            })
            .once('transactionHash', function (hash) {
                results[id]['hashTime'] = Date.now()
                results[id]['txHash'] = hash
            })
            .once('receipt', function (receipt) {
                results[id]['returnTime'] = Date.now()
                results[id]['blockNumber'] = receipt.blockNumber
                results[id]['txIndex'] = receipt.transactionIndex
                results[id]['status'] = receipt.status
                //ended[id] += 1
                endedTxs += 1;
                console.log(`ending transaction ${id}`)
                writeJSON();
            })
    }
}

