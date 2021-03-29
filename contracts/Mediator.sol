pragma solidity >=0.6.0 <0.9.0;

import "./DDToken.sol";

contract Mediator {
    struct agreement {
        bool exists;
        address prov;
        uint deposit;
    }

    address public owner;
    mapping(address => agreements) subReg;
    DDToken public tok;

    constructor() public {
        owner = msg.sender;
    }

    receive() external payable {}

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function setToken(address _tokAddress) public onlyOwner{
        tok = DDToken(_tokAddress);
    }

    function register(
        address _prov,
        address _sub
    ) public onlyOwner{
        require(
            subReg[_sub].exists != true,
            "This specific subscriber-provider relationship is already established."
        );
        subReg[_sub].exists = true;
    }

    function medPullFromSub(
        address _prov,
        address payable _sub,
        uint _amount
    ) public {
        Subscriber auxSub = Subscriber(_sub);

        provs[_prov].subs[_sub].availableTokens += _amount;

        auxSub.directDebit(_prov, _amount);
    }

    function subPullFromMed(address _prov) public {
        require(
            provs[_prov].subs[msg.sender].readyToPull == false,
            "The deposited amount is already available for the Provider to withdraw. Subscriber can't get tokens back at this stage."
        );
        require(
            provs[_prov].subs[msg.sender].exists == true,
            "The Subscriber-Provider agreement does not exist"
        );

        uint temp = provs[_prov].subs[msg.sender].availableTokens;
        provs[_prov].subs[msg.sender].availableTokens = 0;

        tok.transfer(msg.sender, temp);
    }

    function retToSub(address _sub, address _prov) public {
        uint temp = provs[_prov].subs[_sub].availableTokens;
        provs[_prov].subs[_sub].availableTokens = 0;

        tok.transfer(_sub, temp);
    }
}
