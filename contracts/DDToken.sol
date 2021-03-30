pragma solidity >=0.6.0 <0.9.0;
import "../node_modules/@openzeppelin/contracts/token/ERC20/erc20.sol";

contract DDToken is ERC20{
    //address owner;

    constructor(uint256 _initialSupply) public ERC20("DirectDebit", "DD"){
        _setupDecimals(0);
        _mint(msg.sender, _initialSupply);
        //owner = msg.sender;
    }

    /* function setOwner (address _newOwner) public returns(bool){
        require(msg.sender == owner);
        owner = _newOwner;
        return true;
    }
 */
    function transferFrom(address sender, address recipient, uint256 amount) public override returns(bool){
        require(allowance(sender, msg.sender) >= amount, "ERC20: Allowance exceeded.");
        _transfer(sender, recipient, amount);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public override returns(bool){
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public override returns(bool){
        return true;
    }
}