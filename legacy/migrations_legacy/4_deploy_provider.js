const Provider = artifacts.require('Provider')

module.exports = async (deployer, network, accounts) => {
    await deployer.deploy(Provider, {from: accounts[0]})
    const prov = await Provider.deployed()
    const addr = await prov.address
    console.log(addr)
}