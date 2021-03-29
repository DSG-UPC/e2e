const Web3 = require('web3')
const DDToken = require('../build/contracts/DDToken.json')

async function main() {
    web3 = new Web3('http://localhost:8545');
    const accounts = await web3.eth.getAccounts();
    const net = await web3.eth.net.getId()

    const tokAt = DDToken.networks[net].address
    tok = new web3.eth.Contract(DDToken.abi, tokAt)

    /* SCENARIO:
    0 - MED
    1 - SUB
    2 - PROV
    */

    console.log(`Balance of Sub: ${await tok.methods.balanceOf(accounts[1]).call({from:accounts[0]})}`)
    console.log(`Balance of Med: ${await tok.methods.balanceOf(accounts[0]).call({from:accounts[0]})}`)
    console.log(`Balance of Prov: ${await tok.methods.balanceOf(accounts[2]).call({from:accounts[0]})}`)
    console.log('-------------------------------------')
    
    await tok.methods.approve(accounts[0], 50).send({from:accounts[1]})
    await tok.methods.transferFrom(accounts[1], accounts[0], 50).send({from:accounts[0]})
    
    console.log(`Balance of Sub: ${await tok.methods.balanceOf(accounts[1]).call({from:accounts[0]})}`)
    console.log(`Balance of Med: ${await tok.methods.balanceOf(accounts[0]).call({from:accounts[0]})}`)
    console.log(`Balance of Prov: ${await tok.methods.balanceOf(accounts[2]).call({from:accounts[0]})}`)
    console.log('-------------------------------------')
    
    await tok.methods.transfer(accounts[2], 50).send({from:accounts[0]})
    
    console.log(`Balance of Sub: ${await tok.methods.balanceOf(accounts[1]).call({from:accounts[0]})}`)
    console.log(`Balance of Med: ${await tok.methods.balanceOf(accounts[0]).call({from:accounts[0]})}`)
    console.log(`Balance of Prov: ${await tok.methods.balanceOf(accounts[2]).call({from:accounts[0]})}`)
    console.log('-------------------------------------')

}

main()