pragma solidity >=0.6.0 <0.9.0;

import "./DDToken.sol";
import "./Subscriber.sol";

contract Mediator {
    /* GLOBAL VARIABLES */
    struct subInfo {
        bool exists;
        bool readyToPull;
        uint limit;
        uint availableTokens;
    }
    struct provInfo {
        mapping(address => subInfo) subs;
    }

    address public owner;
    mapping(address => provInfo) provs;
    DDToken public tok;

    /* CONSTRUCTOR, FALLBACK, MODIFIERS */
    constructor() public {
        owner = msg.sender;
    }

    receive() external payable {}

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /* GETTERS, SETTERS */
    function getAddr() public view returns (address) {
        address addr = address(this);
        return addr;
    }

    function setToken(address _tokAddress) public {
        tok = DDToken(_tokAddress);
    }

    /* GENERAL FUNCTIONS */
    /* function withdrawToProvider() public {
        uint amount = getBalance();
        msg.sender.call.value(amount)("");
    } */
    function addSubsToProv(
        address _prov,
        address _sub,
        uint _limit
    ) public {
        require(
            provs[_prov].subs[_sub].exists != true,
            "This specific subscriber-provider relationship is already established."
        );
        provs[_prov].subs[_sub].exists = true;
        provs[_prov].subs[_sub].readyToPull = false;
        provs[_prov].subs[_sub].limit = _limit;
    }

    function enableCharging(address _prov, address _sub) public {
        provs[_prov].subs[_sub].readyToPull = true;
    }

    function disableCharging(address _prov, address _sub) public {
        provs[_prov].subs[_sub].readyToPull = false;
    }

    /* PULL PAYMENT FUNCTION CALLED BY THE PROVIDER. */
    function providerPullFromMed(address payable _sub, uint _amount) public {
        require(
            provs[msg.sender].subs[_sub].exists == true,
            "The subscriber has no agreement with the calling provider. Choose a valid subscriber to pull from."
        );
        require(
            provs[msg.sender].subs[_sub].readyToPull == true,
            "The subscriber currently has an agreement with the calling provider, but the money cannot be withdrawn yet. Check again the terms of the agreement."
        );

        provs[msg.sender].subs[_sub].availableTokens -= _amount;

        disableCharging(msg.sender, _sub);
        tok.transfer(msg.sender, _amount);
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
