//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Apartment is ERC20 {
    

    constructor() ERC20("ApartmentContract", "APRTM") {
        super._mint(_msgSender(), 100);
        console.log("Deploying a Greeter with greeting:");
       
    }
}
