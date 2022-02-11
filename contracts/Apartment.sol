//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Apartment is ERC20 {
    uint256 public balance;
    uint256 public totalIncome;
    mapping(address => uint256) withdrawRegister;

    constructor() ERC20("ApartmentContract", "APRTM") {
        super._mint(_msgSender(), 100);
        console.log("Deploying a Greeter with greeting:");

    }

    function withdraw() public {
        withdraw(msg.sender);
    }

    function withdraw(address recipient) private {
        require(this.balanceOf(recipient) > 0, "unauthorized");
        require(getFundsToWithdraw(recipient) > 0,
            "0 funds to withdraw"
        );
        uint fundsToWithdraw = getFundsToWithdraw(recipient);
        balance = balance - fundsToWithdraw;
        withdrawRegister[recipient] = totalIncome;
        payable(recipient).transfer(fundsToWithdraw);
    }

    function transfer(address recipient, uint amount)
        public
        virtual
        override
        returns (bool)
    {
        if(getFundsToWithdraw(recipient) > 0){
            console.log(getFundsToWithdraw(recipient));
            withdraw(recipient); 
        }
        if(getFundsToWithdraw(msg.sender) > 0){
            withdraw(msg.sender); 
        }

        super.transfer(recipient, amount);
        return true;
    }

    function getFundsToWithdraw(address recipient) public view returns(uint){
        return (totalIncome -
            withdrawRegister[recipient]) * this.balanceOf(recipient) / 100;
    }

    

    receive() external payable {
        balance += msg.value;
        totalIncome += msg.value;
    }
}
