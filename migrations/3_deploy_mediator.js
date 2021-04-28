const Mediator = artifacts.require("Mediator");
const DDToken = artifacts.require("DDToken");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Mediator, { from: accounts[0] })

  const tok = await DDToken.deployed()
  const med = await Mediator.deployed()
  console.log("med:" + med.address);

  await med.setToken(tok.address, { from: accounts[0] })
};