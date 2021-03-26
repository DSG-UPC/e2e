const Mediator = artifacts.require('Mediator')

module.exports = async (deployer, network, accounts) => {
    await deployer.deploy(Mediator, {from: accounts[0]})
    /* const med = await Mediator.deployed()
    const addr = await med.address
    console.log(addr) */
}