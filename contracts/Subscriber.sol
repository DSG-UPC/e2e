pragma solidity >=0.6.0 <0.9.0;

import "./DDToken.sol";
import "./MediatorInterface.sol";

contract Subscriber {
    struct provInfo {
        bool used;
    }
    struct medInfo {
        bool used;
        mapping(address => provInfo) provs;
    }

    DDToken public tok;
    mapping(address => medInfo) public meds;

    event breakPoint();

    constructor() public {}

    receive() external payable {}

    function setToken(address _tokAddress) public {
        tok = DDToken(_tokAddress);
    }

    function subscribeToProv(address _prov, address _med, uint _amount)
        public
    {
        meds[_med].used = true;
        meds[_med].provs[_prov].used = true;

        emit breakPoint();

        MediatorInterface auxMed = MediatorInterface(_med);
        auxMed.addSubsToProv(_prov, address(this), _amount);
    }

    function pushToMed(address _med, uint _amount) public {
        tok.transfer(_med, _amount);
    }

    function directDebit(address _prov, uint _amount) public {
        /* CALLED BY MEDIATOR TO CLAIM TOKENS FOR A SPECIFIC SUBSCRIPTION */
        require(
            meds[msg.sender].used == true &&
                meds[msg.sender].provs[_prov].used == true,
            "The current payment relationship is not established. Check again the details."
        );
        pushToMed(msg.sender, _amount);
    }
    function test(address _med) public returns(address){
        MediatorInterface m = MediatorInterface(_med);
        address ret = m.getAddr();
        return ret;
    }
}
/* 
const tok = await DDToken.deployed();
const sub = await Subscriber.deployed();
const med = await Mediator.deployed();
const prov = await Provider.deployed();
 */