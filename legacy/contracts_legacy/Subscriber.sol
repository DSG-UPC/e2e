pragma solidity >=0.6.0 <0.9.0;

import "./DDToken.sol";
import "./Mediator.sol";

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
    address payable public lastMed;
    address public lastProv;

    constructor() public {}

    receive() external payable {}

    function setToken(address _tokAddress) public {
        tok = DDToken(_tokAddress);
    }

    function subscribeToProv(
        address _prov,
        address payable _med,
        uint256 _limit
    ) public {
        meds[_med].used = true;
        meds[_med].provs[_prov].used = true;
        meds[_med].provs[_prov].limit = _limit;

        lastMed = _med;
        lastProv = _prov;

        Mediator auxMed = Mediator(_med);
        auxMed.addSubsToProv(_prov, address(this), _limit);
    }

    function directDebit(address _prov, uint256 _amount) public {
        /* CALLED BY MEDIATOR TO CLAIM TOKENS FOR A SPECIFIC SUBSCRIPTION */
        require(
            meds[msg.sender].used == true &&
                meds[msg.sender].provs[_prov].used == true &&
                meds[msg.sender].provs[_prov].limit >= _amount,
            "The current payment relationship is not established, or the payment surpassed the agreed limit.. Check again the details."
        );
        tok.transfer(msg.sender, _amount);
    }

    function recoverFunds(address _prov, address payable _med) public {
        Mediator m = Mediator(_med);
        m.subPullFromMed(_prov);
    }

    function test(address payable _med) public view returns (address) {
        Mediator m = Mediator(_med);
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
