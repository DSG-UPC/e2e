pragma solidity >=0.6.0 <0.9.0;
import "../node_modules/@openzeppelin/contracts/token/ERC20/erc20.sol";

contract DDToken is ERC20{
    constructor(uint256 _initialSupply) public ERC20("DirectDebit", "DD"){
        _setupDecimals(0);
        _mint(msg.sender, _initialSupply);
    }
}