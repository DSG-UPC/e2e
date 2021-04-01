const Web3 = require('web3')
const DDToken = require('../build/contracts/DDToken.json')
const Mediator = require('../build/contracts/Mediator.json')
const nodeplotlib = require('nodeplotlib')
const os = require('os')

async function main() {
    const data = [{x: [1, 3, 4, 5], y: [3, 12, 1, 4], type: 'line'}]
    nodeplotlib.stack(data)
    nodeplotlib.plot()

    web3 = new Web3('http://localhost:8545');
    const accounts = await web3.eth.getAccounts();
    const net = await web3.eth.net.getId()
    const chain = await web3.eth.getChainId()

    const tokAt = DDToken.networks[net].address
    tok = new web3.eth.Contract(DDToken.abi, tokAt)

    const medAt = Mediator.networks[net].address
    med = new web3.eth.Contract(Mediator.abi, medAt)

    console.log(accounts)
    console.log(`Using network ${net}.`)
    console.log(`Using chain ${chain}.`)
    console.log(`Token is deployed at ${tokAt}.`)
    console.log(`Mediator is deployed at ${medAt}. Its owner is ${await med.methods.owner().call({ from: accounts[0] })}`)
    console.log(`Sub is ${accounts[1]}`)
    console.log(`Med is ${medAt}`)
    console.log(`Prov is ${accounts[2]}`)

    /* SCENARIO:
    0 - MED
    1 - SUB
    2 - PROV
    */

    /* SUB APPROVES THAT THE MED MOVES ITS TOKENS. IN REAL USE CASE, AN APP CONNECTED WITH METAMASK WOULD LET THE SUB USE ITS ACCOUNT TO INVOKE THE APPROVAL FUNCTION. CONVENIENT PRELIMINARY CHECKINGS, AND TRACKING OF ACTIVE SUBSCRIPTIONS ARE PERFORMED OFF-CHAIN.*/
    console.log(`Starting measures.`)
    const hrstart = process.hrtime()
    await tok.methods.approve(medAt, 50).send({ from: accounts[1] })
    console.log(`Balance of Sub: ${await tok.methods.balanceOf(accounts[1]).call({ from: accounts[0] })}`)
    console.log(`Balance of Med: ${await tok.methods.balanceOf(medAt).call({ from: accounts[0] })}`)
    console.log(`Balance of Prov: ${await tok.methods.balanceOf(accounts[2]).call({ from: accounts[0] })}`)
    console.log('-------------------------------------APPROVAL DONE')
    await med.methods.depositPush(accounts[2], 50).send({ from: accounts[1] })
    console.log(`Balance of Sub: ${await tok.methods.balanceOf(accounts[1]).call({ from: accounts[0] })}`)
    console.log(`Balance of Med: ${await tok.methods.balanceOf(medAt).call({ from: accounts[0] })}`)
    console.log(`Balance of Prov: ${await tok.methods.balanceOf(accounts[2]).call({ from: accounts[0] })}`)
    console.log('-------------------------------------DEPOSIT 1 DONE')
    await med.methods.refund(accounts[1], accounts[2]).send({ from: accounts[0] })
    console.log(`Balance of Sub: ${await tok.methods.balanceOf(accounts[1]).call({ from: accounts[0] })}`)
    console.log(`Balance of Med: ${await tok.methods.balanceOf(medAt).call({ from: accounts[0] })}`)
    console.log(`Balance of Prov: ${await tok.methods.balanceOf(accounts[2]).call({ from: accounts[0] })}`)
    console.log('-------------------------------------REFUND DONE')
    await med.methods.depositPull(accounts[1], accounts[2], 50).send({ from: accounts[0] })
    console.log(`Balance of Sub: ${await tok.methods.balanceOf(accounts[1]).call({ from: accounts[0] })}`)
    console.log(`Balance of Med: ${await tok.methods.balanceOf(medAt).call({ from: accounts[0] })}`)
    console.log(`Balance of Prov: ${await tok.methods.balanceOf(accounts[2]).call({ from: accounts[0] })}`)
    console.log('-------------------------------------DEPOSIT 2 DONE')
    await med.methods.payProv(accounts[1], accounts[2]).send({ from: accounts[0] })
    console.log(`Balance of Sub: ${await tok.methods.balanceOf(accounts[1]).call({ from: accounts[0] })}`)
    console.log(`Balance of Med: ${await tok.methods.balanceOf(medAt).call({ from: accounts[0] })}`)
    console.log(`Balance of Prov: ${await tok.methods.balanceOf(accounts[2]).call({ from: accounts[0] })}`)
    console.log('-------------------------------------PAYMENT TO PROV 1 DONE')
    await med.methods.payProv(accounts[1], accounts[2]).send({ from: accounts[0] })
    console.log(`Balance of Sub: ${await tok.methods.balanceOf(accounts[1]).call({ from: accounts[0] })}`)
    console.log(`Balance of Med: ${await tok.methods.balanceOf(medAt).call({ from: accounts[0] })}`)
    console.log(`Balance of Prov: ${await tok.methods.balanceOf(accounts[2]).call({ from: accounts[0] })}`)
    console.log('-------------------------------------PAYMENT TO PROV 2 (nothing )DONE')
    const hrend = process.hrtime(hrstart)
    const nanos = hrend[0] * 1e9 + hrend[1]
    const millis = nanos / 1e6
    console.info(`Benchmark took ${nanos}ns - ${millis}ms`)
    //console.log(os.cpus())


    await tok.methods.transfer('0xcc02Dd85757abf893184d37E67A3Bc996682e655', 50).send({ from: accounts[0] })
    await tok.methods.balanceOf('0xcc02Dd85757abf893184d37E67A3Bc996682e655').call({ from: accounts[0] })
}

main()