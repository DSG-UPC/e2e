pragma solidity >=0.6.0 <0.9.0;

import "./DDToken.sol";
import "./Subscriber.sol";
import "./MediatorInterface.sol";

contract Mediator is MediatorInterface {
    /* GLOBAL VARIABLES */
    struct subInfo {
        bool exists;
        bool readyToPull;
        uint256 deposit;
        /* ADD HOLD TIME LATER */
    }
    struct provInfo {
        mapping(address => subInfo) subs;
    }

    address public owner;
    mapping(address => provInfo) provs;
    DDToken public tok;

    event breakPoint();

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
    function getAddr() public view override returns (address) {
        address addr = address(this);
        return addr;
    }

    function setToken(address _tokAddress) public {
        tok = DDToken(_tokAddress);
    }

    /* GENERAL FUNCTIONS */
    /* function withdrawToProvider() public {
        uint256 amount = getBalance();
        msg.sender.call.value(amount)("");
    } */
    function addSubsToProv(
        address _prov,
        address _sub,
        uint256 _amount
    ) public override {
        require(
            provs[_prov].subs[_sub].exists != true,
            "This specific subscriber-provider relationship is already esttablished."
        );
        provs[_prov].subs[_sub].exists = true;
        provs[_prov].subs[_sub].readyToPull = false;
        provs[_prov].subs[_sub].deposit = _amount;
        emit breakPoint();
    }

    function enableCharging(address _prov, address _sub) public override {
        provs[_prov].subs[_sub].readyToPull = true;
    }

    function disableCharging(address _prov, address _sub) public override {
        provs[_prov].subs[_sub].readyToPull = false;
    }

    /* PULL PAYMENT FUNCTION CALLED BY THE PROVIDER. */
    function providerPullFromMed(address payable _sub) public override {
        require(
            provs[msg.sender].subs[_sub].exists == true,
            "The subscriber has no agreement with the calling provider. Choose a valid subscriber to pull from."
        );
        require(
            provs[msg.sender].subs[_sub].readyToPull == true,
            "The subscriber currently has an agreement with the calling provider, but the money cannot be withdrawn yet. Check again the terms of the agreement."
        );

        uint256 dep = provs[msg.sender].subs[_sub].deposit;
        //provs[msg.sender].subs[_sub].deposit = 0;
        disableCharging(msg.sender, _sub);

        //tok.transfer(msg.sender, dep);
        /* Subscriber auxSub = Subscriber(_sub);
        auxSub.directDebit(msg.sender, dep); */
        tok.transfer(msg.sender, dep);
    }

    function medPullFromSub(address _prov, address payable _sub, uint256 _amount) public override {
        Subscriber auxSub = Subscriber(_sub);
        auxSub.directDebit(_prov, _amount);
    }
}
