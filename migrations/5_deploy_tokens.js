const ERC20 = artifacts.require("DDToken");
const Subscriber = artifacts.require("Subscriber")
const Mediator = artifacts.require("Mediator")

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(ERC20, 1000000, { from: accounts[0] })
  const tok = await ERC20.deployed()
  const sub = await Subscriber.deployed()
  const med = await Mediator.deployed()
  console.log("ERC20: " + tok.address);
  for (i in accounts) {
    await tok.transfer(accounts[i], 2000)
  }
  await tok.transfer(sub.address, 2000)
  await sub.setToken(tok.address)
  await med.setToken(tok.address)
};