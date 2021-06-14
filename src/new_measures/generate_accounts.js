const web3 = require('./web3.js');
const fs = require('fs')

accounts = []

for(let i = 0; i<5000; ++i){
    account = web3.eth.accounts.create()
    output ={
        address : account.address,
        privateKey : account.privateKey,
        nonce : 0
    }
    accounts.push(output)
}

const json = JSON.stringify(accounts, null, "\t");
fs.writeFile('./accounts.json', json, err => {
    if (err) {
        console.log('Error writing file', err)
    } else {
        console.log('Successfully wrote file')
    }
})


// account = web3.eth.accounts.create()
// web3.eth.getTransactionCount(account.address).then(function(nonce){
//     console.log(nonce)
// })

// let jsonData = require('./accounts.json');


// console.log("kek")