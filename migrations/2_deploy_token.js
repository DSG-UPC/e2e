const ERC20 = artifacts.require("DDToken");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(ERC20, 1000000, { from: accounts[0] })

  const tok = await ERC20.deployed()
  console.log("tok:" + tok.address);

  for (i in accounts) {
    await tok.transfer(accounts[i], 10000)
  }
};