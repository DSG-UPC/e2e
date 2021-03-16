pragma solidity >=0.6.0 <0.9.0;

import "./DDToken.sol";
import "./MediatorInterface.sol";

contract Subscriber {
    struct provInfo {
        bool used;
        uint256 limit;
    }
    struct medInfo {
        bool used;
        mapping(address => provInfo) provs;
    }

    DDToken public tok;
    mapping(address => medInfo) public meds;

    constructor() public {}

    receive() external payable {}

    function setToken(address _tokAddress) public {
        tok = DDToken(_tokAddress);
    }

    function subscribeToProv(
        address _prov,
        address _med,
        uint256 _limit
    ) public {
        meds[_med].used = true;
        meds[_med].provs[_prov].used = true;
        meds[_med].provs[_prov].limit = _limit;

        MediatorInterface auxMed = MediatorInterface(_med);
        auxMed.addSubsToProv(_prov, address(this), _limit);
    }

    function directDebit(address _prov, uint256 _amount) public {
        /* CALLED BY MEDIATOR TO CLAIM TOKENS FOR A SPECIFIC SUBSCRIPTION */
        require(
            meds[msg.sender].used == true &&
                meds[msg.sender].provs[_prov].used == true &&
                meds[msg.sender].provs[_prov].limit >= _amount,
            "The current payment relationship is not established. Check again the details."
        );
        tok.transfer(msg.sender, _amount);
    }

    function test(address _med) public returns (address) {
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
