const Subscriber = artifacts.require('Subscriber')

module.exports = async (deployer, network, accounts) => {
    await deployer.deploy(Subscriber, {from: accounts[0]})
}