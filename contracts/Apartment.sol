//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Apartment is ERC20 {
    
    uint public balance;
    constructor() ERC20("ApartmentContract", "APRTM") {
        super._mint(_msgSender(), 100);
        console.log("Deploying a Greeter with greeting:");
       
    }

    function withdraw() public {
        payable(msg.sender).transfer(address(this).balance);
    }

    receive() external payable {
        console.log("receive");
        balance += msg.value;
    }

    
}
