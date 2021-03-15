pragma solidity >=0.6.0 <0.9.0;

import "./DDToken.sol";
import "./Subscriber.sol";

contract MediatorInterface {
    /* GETTERS, SETTERS */
    function getAddr() public view virtual returns (address) {}

    function addSubsToProv(
        address _prov,
        address _sub,
        uint256 _amount
    ) public virtual {}

    function enableCharging(address _prov, address _sub) public virtual {}

    function disableCharging(address _prov, address _sub) public virtual {}

    function providerPullFromMed(address payable _sub) public virtual {}

    function medPullFromSub(address _prov, address payable _sub, uint256 amount) public virtual {}
}
