import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
let owner, Alice, Bob, Joe;

describe("Apartment", function () {
  

  it("Contract creator should have 100 shares of apartament",async () => {
    const Apartment = await ethers.getContractFactory("Apartment");
    const apartment = await Apartment.deploy();

    [owner] = await ethers.getSigners();

    await apartment.deployed();
    let ownerBalance = await apartment.balanceOf(owner.address);
    
    expect(ownerBalance).to.equal(100);
    
  })

  it("It should be possible to transfer some shares to another user", async () => {
    const Apartment = await ethers.getContractFactory("Apartment");
    const apartment = await Apartment.deploy();

    [owner, Alice] = await ethers.getSigners();

    await apartment.deployed();
    await apartment.transfer(Alice.address, 20);
    expect(await apartment.balanceOf(Alice.address)).to.equal(20);
    expect(await apartment.balanceOf(owner.address)).to.equal(80);
  })


  it("It should be possible to pay the rent and deposit it in ether in the apartment contract", async () => {
    const Apartment = await ethers.getContractFactory("Apartment");
    const apartment = await Apartment.deploy();

    [owner, Alice, Bob] = await ethers.getSigners();

    await apartment.deployed();

    await Bob.sendTransaction({
      to: apartment.address,
      value: ethers.utils.parseEther("1")
    })

    expect(await apartment.balance()).to.equal(ethers.utils.parseEther("1"));
  })

  it("Owner should be able to withdraw resources paid as rent", async () => {
    const Apartment = await ethers.getContractFactory("Apartment");
    const apartment = await Apartment.deploy();

    [owner, Alice, Bob] = await ethers.getSigners();

    await apartment.deployed();
    await apartment.transfer(Alice.address, 20);

    await Bob.sendTransaction({
      to: apartment.address,
      value: ethers.utils.parseEther("1")
    });

    const ownerBalanceBeforeWithdrawal = await owner.getBalance();
    await apartment.withdraw();

    expect(await (await owner.getBalance()).gt(ownerBalanceBeforeWithdrawal)).to.be.true;
  })


  it("Shareholder be able to withdraw resources paid as rent", async () => {
    const Apartment = await ethers.getContractFactory("Apartment");
    const apartment = await Apartment.deploy();

    [owner, Alice, Bob] = await ethers.getSigners();

    await apartment.deployed();
    await apartment.transfer(Alice.address, 20);

    await Bob.sendTransaction({
      to: apartment.address,
      value: ethers.utils.parseEther("1")
    });

    const aliceBalanceBeforeWithdrawal = await Alice.getBalance();
    await apartment.connect(Alice).withdraw();
    expect(await (await Alice.getBalance()).gt(aliceBalanceBeforeWithdrawal)).to.be.true;
  
  })

    
  })









});