pragma solidity >=0.6.0 <0.9.0;

import "./DDToken.sol";

contract Mediator {
    address public owner;
    mapping(address => mapping(address => uint256)) deposits;
    DDToken public tok;

    constructor() public {
        owner = msg.sender;
    }

    receive() external payable {}

    modifier onlyOwner() {
        require(msg.sender == owner, "Mediator: Only the owner account can perform this action.");
        _;
    }

    function setToken(address _tokAddress) public onlyOwner {
        tok = DDToken(_tokAddress);
    }

    function depositPull(address _sub, address _prov, uint256 _amount) public onlyOwner {
        deposits[_sub][_prov] += _amount;

        tok.transferFrom(_sub, address(this), _amount);
    }
    
    function depositPush(address _prov, uint256 _amount) public {
        deposits[msg.sender][_prov] += _amount;

        tok.transferFrom(msg.sender, address(this), _amount);
    }

    function refund(address _sub, address _prov) public onlyOwner {
        uint256 _temp = deposits[_sub][_prov];
        deposits[_sub][_prov] = 0;

        tok.transfer(_sub, _temp);
    }

    function payProv(address _sub, address _prov) public onlyOwner {
        uint256 _temp = deposits[_sub][_prov];
        deposits[_sub][_prov] = 0;

        tok.transfer(_prov, _temp);
    }
    
}
