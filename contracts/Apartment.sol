//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Apartment is ERC20 {
    
    uint public balance;
    uint public totalIncome;
    mapping(address => uint) withdrawRegister;

    constructor() ERC20("ApartmentContract", "APRTM") {
        super._mint(_msgSender(), 100);
        console.log("Deploying a Greeter with greeting:");
       
    }

    function withdraw() public {
        require(this.balanceOf(msg.sender) > 0, "unauthorized");
        require(totalIncome > withdrawRegister[msg.sender], "0 funds to withdraw");
        uint meansToWithdraw = address(this).balance / 100 * this.balanceOf(msg.sender);
        balance = balance - meansToWithdraw;
        withdrawRegister[msg.sender] = totalIncome;
        payable(msg.sender).transfer(meansToWithdraw);
    }

    receive() external payable {
        balance += msg.value;
        totalIncome +=msg.value;
    }

    
}
