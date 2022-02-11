import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
let owner, Alice, Bob, Joe;

const logEthers = (amount: BigNumber) =>
  console.log(ethers.utils.formatEther(amount));

describe("Apartment", function () {
  it("Contract creator should have 100 shares of apartament", async () => {
    const Apartment = await ethers.getContractFactory("Apartment");
    const apartment = await Apartment.deploy();

    [owner] = await ethers.getSigners();

    await apartment.deployed();
    let ownerBalance = await apartment.balanceOf(owner.address);

    expect(ownerBalance).to.equal(100);
  });

  it("It should be possible to transfer some shares to another user", async () => {
    const Apartment = await ethers.getContractFactory("Apartment");
    const apartment = await Apartment.deploy();

    [owner, Alice] = await ethers.getSigners();

    await apartment.deployed();
    await apartment.transfer(Alice.address, 20);
    expect(await apartment.balanceOf(Alice.address)).to.equal(20);
    expect(await apartment.balanceOf(owner.address)).to.equal(80);
  });

  it("It should be possible to pay the rent and deposit it in ether in the apartment contract", async () => {
    const Apartment = await ethers.getContractFactory("Apartment");
    const apartment = await Apartment.deploy();

    [owner, Alice, Bob] = await ethers.getSigners();

    await apartment.deployed();

    await Bob.sendTransaction({
      to: apartment.address,
      value: ethers.utils.parseEther("1"),
    });

    expect(await apartment.balance()).to.equal(ethers.utils.parseEther("1"));
  });

  it("Owner should be able to withdraw resources paid as rent", async () => {
    const Apartment = await ethers.getContractFactory("Apartment");
    const apartment = await Apartment.deploy();

    [owner, Alice, Bob] = await ethers.getSigners();

    await apartment.deployed();
    await apartment.transfer(Alice.address, 20);

    await Bob.sendTransaction({
      to: apartment.address,
      value: ethers.utils.parseEther("1"),
    });

    const ownerBalanceBeforeWithdrawal = await owner.getBalance();
    await apartment.withdraw();

    expect(await (await owner.getBalance()).gt(ownerBalanceBeforeWithdrawal)).to
      .be.true;
  });

  it("Apartment shareholder be able to withdraw resources paid as rent", async () => {
    const Apartment = await ethers.getContractFactory("Apartment");
    const apartment = await Apartment.deploy();

    [owner, Alice, Bob] = await ethers.getSigners();

    await apartment.deployed();
    await apartment.transfer(Alice.address, 20);

    await Bob.sendTransaction({
      to: apartment.address,
      value: ethers.utils.parseEther("1"),
    });

    const aliceBalanceBeforeWithdrawal = await Alice.getBalance();
    await apartment.connect(Alice).withdraw();
    expect(await (await Alice.getBalance()).gt(aliceBalanceBeforeWithdrawal)).to
      .be.true;
  });

  it("Attempt to withdraw by non shareholder should be reverted", async () => {
    const Apartment = await ethers.getContractFactory("Apartment");
    const apartment = await Apartment.deploy();

    [owner, Alice, Bob] = await ethers.getSigners();

    await apartment.deployed();
    await apartment.transfer(Alice.address, 20);

    await Bob.sendTransaction({
      to: apartment.address,
      value: ethers.utils.parseEther("1"),
    });

    await expect(apartment.connect(Bob).withdraw()).to.be.revertedWith(
      "unauthorized"
    );
  });

  it("Apartment shareholder be able to withdraw resources proportional to his share", async () => {
    const Apartment = await ethers.getContractFactory("Apartment");
    const apartment = await Apartment.deploy();

    [owner, Alice, Bob] = await ethers.getSigners();

    await apartment.deployed();
    await apartment.transfer(Alice.address, 20);

    await Bob.sendTransaction({
      to: apartment.address,
      value: ethers.utils.parseEther("1"),
    });

    const aliceBalanceBeforeWithdrawal = await Alice.getBalance();

    await apartment.connect(Alice).withdraw();
    expect(await (await apartment.balance()).eq(ethers.utils.parseEther("0.8")))
      .to.be.true;
    expect(await (await apartment.balance()).gt(ethers.utils.parseEther("0")))
      .to.be.true;
    expect(await (await Alice.getBalance()).gt(aliceBalanceBeforeWithdrawal)).to
      .be.true;
  });

  it("It should not be possible to withdraw more than one should", async () => {
    const Apartment = await ethers.getContractFactory("Apartment");
    const apartment = await Apartment.deploy();

    [owner, Alice, Bob] = await ethers.getSigners();

    await apartment.deployed();
    await apartment.transfer(Alice.address, 20);

    await Bob.sendTransaction({
      to: apartment.address,
      value: ethers.utils.parseEther("1"),
    });

    await apartment.connect(Alice).withdraw();
    await expect(apartment.connect(Alice).withdraw()).to.be.revertedWith(
      "0 funds to withdraw"
    );
  });

  it("It should be possible to withdraw multiple times provided there were incomes in between", async () => {
    const Apartment = await ethers.getContractFactory("Apartment");
    const apartment = await Apartment.deploy();

    [owner, Alice, Bob] = await ethers.getSigners();

    await apartment.deployed();
    await apartment.transfer(Alice.address, 20);

    await Bob.sendTransaction({
      to: apartment.address,
      value: ethers.utils.parseEther("1"),
    });

    await apartment.connect(Alice).withdraw();
    await Bob.sendTransaction({
      to: apartment.address,
      value: ethers.utils.parseEther("1"),
    });
    await expect(apartment.connect(Alice).withdraw()).not.to.be.revertedWith(
      "0 funds to withdraw"
    );
  });

  it("Each withdrawal should be calculated against new income, not total balance", async () => {
    const Apartment = await ethers.getContractFactory("Apartment");
    const apartment = await Apartment.deploy();

    [owner, Alice, Bob] = await ethers.getSigners();

    await apartment.deployed();
    await apartment.transfer(Alice.address, 20);

    //Alice balance saved for later comparison
    const aliceInitialBalanceBeforeWithdrawals = await Alice.getBalance();

    //1.
    //Bob transfers his rent
    await Bob.sendTransaction({
      to: apartment.address,
      value: ethers.utils.parseEther("1"),
    });

    //Alice makes a withdrawal (20/100 * 1E) =~0.2E
    await apartment.connect(Alice).withdraw();
    //Alice account saved after withdrawal for comparison
    const aliceBalanceAfterFirstWithdrawal = await Alice.getBalance();

    //2.
    //Bob transfers his rent
    await Bob.sendTransaction({
      to: apartment.address,
      value: ethers.utils.parseEther("1"),
    });
    //Alice makes withdrawal (20/10 * newIncome(1E)) =~0.2E
    await apartment.connect(Alice).withdraw();
    //Alice account after all withdrawals saved for comparison
    const aliceBalanceAfterSecondWithdrawal = await Alice.getBalance();

    expect(
      aliceInitialBalanceBeforeWithdrawals.lt(aliceBalanceAfterFirstWithdrawal)
    ).to.be.true;
    expect(
      aliceBalanceAfterFirstWithdrawal.lt(aliceBalanceAfterSecondWithdrawal)
    ).to.be.true;

    //apartmane balance should be following
    // 1E after Bob pays rent
    // 0.8E after Alice withdraws
    // 1.8E after Bob pays rent second time
    // 1.6 after Alice withdraws rent second time
    expect((await apartment.balance()).eq(ethers.utils.parseEther("1.6"))).to.be
      .true;
  });

  it("Transfer of shares should withdraw current funds of both parties", async () => {
    const Apartment = await ethers.getContractFactory("Apartment");
    const apartment = await Apartment.deploy();

    [owner, Alice, Bob] = await ethers.getSigners();

    await apartment.deployed();
    await apartment.transfer(Alice.address, 20);

    const aliceInitialBalace = await Alice.getBalance();
    const ownerInitialBalance = await owner.getBalance();

    //1.
    //Bob transfers his rent
    await Bob.sendTransaction({
      to: apartment.address,
      value: ethers.utils.parseEther("1"),
    });

    //2. Onwer transfer yet 10% of shares to Alice
    await apartment.transfer(Alice.address, 10);

    const aliceCurrentBalance = await Alice.getBalance();
    const ownerCurrentBalance = await owner.getBalance();

   

    //3. After this transfer they both should have funds withdrawn
    expect((await apartment.balance()).eq(ethers.utils.parseEther("0"))).to.be
      .true;
    
      expect(
      aliceCurrentBalance
        .sub(aliceInitialBalace)
        .eq(ethers.utils.parseEther("0.2"))
    , 'alice should have 0.2 more ethers than before transfer').to.be.true;
    
    expect(
      ownerCurrentBalance
        .sub(ownerInitialBalance)
        .lte(ethers.utils.parseEther("0.8"))
    ,'owner should have around 0.8 more ethers than before transfer but not more than 0.8 as he pays gas').to.be.true;
    
    
    
    expect(
      ownerCurrentBalance
        .sub(ownerInitialBalance)
        .gte(ethers.utils.parseEther("0.799"))
    , 'owner should have around 0.8 more ethers than before transfer but more than 0.799 although he pays gas').to.be.true;
  });
});
