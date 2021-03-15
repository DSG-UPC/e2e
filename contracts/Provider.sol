pragma solidity >=0.6.0 <0.9.0;

import "./Mediator.sol";

contract Provider {
    /* GLOBAL VARIABLES */
    struct subInfo {
        bool exists;
        address mediator;
    }

    mapping(address => subInfo) public subsInSys;
    address public owner;

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

    /* GENERAL FUNCTIONS */
    function addSub(address _sub, address _med) public  onlyOwner{
        subsInSys[_sub].exists = true;
        subsInSys[_sub].mediator = _med;
    }

    /* ADD: HOW MUCH DO I CHARGE? */
    function testPulling(address payable _med, address payable _sub) public {
        Mediator(_med).providerPullFromMed(_sub);
    }
}
