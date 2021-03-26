const ERC20 = artifacts.require("DDToken");
const Mediator = artifacts.require("Mediator")

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(ERC20, 1000000, { from: accounts[0] })

  const tok = await ERC20.deployed()
  const med = await Mediator.deployed()
  console.log("tok:" + tok.address);
  console.log("med:" + med.address);

  for (i in accounts) {
    await tok.transfer(accounts[i], 10000)
  }
  await med.setToken(tok.address)
};