const ERC20 = artifacts.require("DDToken");
const Subscriber = artifacts.require("Subscriber")
const Mediator = artifacts.require("Mediator")
const Provider = artifacts.require("Provider")
const dotenv = require('dotenv'); dotenv.config();

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(ERC20, 1000000, { from: accounts[0] })

  const tok = await ERC20.deployed()
  const sub = await Subscriber.deployed()
  const med = await Mediator.deployed()
  const prov = await Provider.deployed()

  console.log("tok:" + tok.address);
  console.log("prov:" + prov.address);
  console.log("med:" + med.address);
  console.log("sub:" + sub.address);

  process.env.TOK = tok.address;
  process.env.PROV = prov.address;
  process.env.MED = med.address;
  process.env.SUB = sub.address;

  for (i in accounts) {
    await tok.transfer(accounts[i], 2000)
  }
  await tok.transfer(sub.address, 2000)
  await sub.setToken(tok.address)
  await med.setToken(tok.address)
};