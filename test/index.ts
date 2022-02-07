import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
let owner, Alice, Bob, Joe;

describe("Apartment", function () {
  

  it("Contract creator should have 100 shares of apartament",async () => {
    const Apartment = await ethers.getContractFactory("Apartment");
    const apartment = await Apartment.deploy();

    [owner, Alice, Bob, Joe] = await ethers.getSigners();

    await apartment.deployed();
    let ownerBalance = await apartment.balanceOf(owner.address);
    
    expect(ownerBalance).to.equal(100);
    
  })
});