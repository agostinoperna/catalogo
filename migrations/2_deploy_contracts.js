var Catalogo = artifacts.require("./Catalogo.sol");

module.exports = function(deployer) {
  deployer.deploy(Catalogo);
}
