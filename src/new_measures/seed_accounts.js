const web3 = require('./web3.js');
const fs = require('fs')
const DDToken = require('../../build/contracts/DDToken.json')
const Mediator = require('../../build/contracts/Mediator.json')
var jsonAccounts = require('./accounts.json')

var accounts, net, chain
const nTx = 25
var ended = new Array(nTx).fill(0)
var endedTxs = 0
var results = new Array(nTx+1)
var iteration = 0

const init = async () => {
    net = await web3.eth.net.getId()
    chain = await web3.eth.getChainId()
    accounts = await web3.eth.getAccounts();
    tokAt = DDToken.networks[net].address
    tok = new web3.eth.Contract(DDToken.abi, tokAt)
    medAt = Mediator.networks[net].address
    med = new web3.eth.Contract(Mediator.abi, medAt)
};

const startIteration = async (it) => {
    if(it>=jsonAccounts.length/nTx) return
    let c = init()
        .then(async function () {
            console.log("STARTING ITERATION " + it)
            endedTxs = 0
            let nonce = await web3.eth.getTransactionCount(accounts[0]);
            sendTx(nonce, nTx * it);
        })
}


function sendTx(nonce,start) {
    for (let id = 0; id < nTx; id++) {
        nonce += 1
        results[id] = {};
        results[id]['id'] = id;
        web3.eth.sendTransaction({
            from: accounts[0],
            to: tokAt,
            gas: 200000,
            data: tok.methods.transfer(jsonAccounts[start+id].address, 100).encodeABI()
        })
            .once('receipt', function (receipt) {
                endedTxs += 1;
                console.log("ended transaction "+(start+id))
                if (endedTxs==nTx){
                    console.log("FINISHING ITERATION "+iteration)
                    iteration++
                    startIteration(iteration)
                }
            })
    }
}

startIteration(iteration)

