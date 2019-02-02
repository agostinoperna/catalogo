pragma solidity ^0.4.18;

contract Proprietario {
  // variabili di stato
  address owner;

  // modificatori
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  // costruttore
  function Ownable() public {
    owner = msg.sender;
  }
}
