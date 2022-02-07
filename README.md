
# Implementation of Dividend-Paying Token - 7 Key Takeaways

Recently I have challenged myself to implement a so-called dividend-paying token. It’s been a blockchain Ethereum based smart contract that allows people to share some assets and benefit from them later on.

![](https://cdn-images-1.medium.com/max/4480/1*A6Rhg6qSvA89aGbPa30lKA.png)

What is Dividend-Paying Token? An easy to imagine example would be an apartment that one cannot afford however it would be much easier if a bunch of fellows shares the effort. In such a situation, these apartment’s shareholders should eventually share the costs and share the benefits - the rent the flat earns monthly.

Let’s imagine that 3 friends decided to buy an apartment together in the following scenario.

![Initial shares situation that will be referenced later](https://cdn-images-1.medium.com/max/5000/1*z6zQi8ew1iLcIEiFfIabHw.png)*Initial shares situation that will be referenced later*

Alice, Bob, and Joe contributed different amounts hence they can now expect different benefits. If the apartment has been rented for the weekend and earned $1000, Alice, Bob and Joe will receive $150, $600, and $250 respectively.

In mentioned example:
- the apartment is a dividend-bearing token,
- Alice, Bob, and Joe are shareholders,
- the $1000 the flat has earned is the dividend

### Be Careful

The whole example here presents **my personal thoughts** on the coding task. It hasn’t been publicly deployed and remained a theoretical experiment of mine. Its purpose is not to be advice of any kind, especially it is not advice in terms of investing or accounting. **Remember deploying smart contracts inevitably brings in several vulnerabilities and risks and might be exploited against you and your solution.**

## Do not start from scratch

### The first pitfall — lack of good foundation

At first, I have focused on the dividend distribution only and I have forgotten that the apartment is not only a dividend-paying token but additionally a regular transferable token that has a lot in common with the ERC-20 standard. It can be freely transferred between network addresses, a network address can have some balance of it as well as it can have an allowance to be transferred among the network addresses. These features undoubtedly suggest that the ERC-20 standard is a perfect base for the intended use case.

### Optimize memory utilization

The tricky part in smart contract development as a whole is striving to optimize both computation complexity and memory usage. I initially stored in the flat smart contract the register of how many shares each shareholder has. There is a better way that optimizes gas usage so reduces the cost of the transaction. The more gas-efficient way is to limit to minimum things you redundantly store. The apartment should store little data about its co-owners. In most simple cases having a list of flat co-owners’ addresses would suffice.
So I shouldn’t have stored users’ shares count separately since it is already stored as the token is ERC-20 and can be fetched using the balanceOf method.

![](https://cdn-images-1.medium.com/max/8624/1*Tdkxg5l1J5ozPGAxa7HJHQ.png)

## Think in a blockchain way

### Do not iterate

At first, I stored the shares register on the apartment contract side and was iterating over the list of all shareholders every time. This is of course GAS-inefficient as the number of operations is too high while it can be minimized.

![](https://cdn-images-1.medium.com/max/3638/1*aEajKkW6CsMvzJzVjATZbA.png)

The iteration I mentioned was totally wrong as I insisted to pay all dividends instantaneously instead of per explicit co-owner's request. The difference is significant, especially when the number of co-owners rises. This resulted in that every time a dividend is earned a series of operations needs to be done, whereas in a lazy approach you might not need to do anything while no one actually asked you for the dividend.

*I guess this is the most crucial takeaway of this programming experiment. A kind of refreshing experience for a developer to think differently about simple things. Valuable resources for this are:
[https://weka.medium.com/dividend-bearing-tokens-on-ethereum-42d01c710657](https://weka.medium.com/dividend-bearing-tokens-on-ethereum-42d01c710657) [https://programtheblockchain.com/posts/2018/02/07/writing-a-simple-dividend-token-contract/](https://programtheblockchain.com/posts/2018/02/07/writing-a-simple-dividend-token-contract/)*

### **Have a withdrawal register**

As already stated, the contract pays nothing immediately. It waits until someone comes, and wants to withdraw their earned rent share.

In order to achieve this, we need to have a register in case this person comes again in a while. Such a register can be implemented in different ways, however, its main goal is to be able to tell how much the apartment has earned for a specific shareholder since their recent withdrawal request. Especially as every shareholder has free access to their balance and can freely withdraw it. I guess there is no need to make it too advanced, I haven’t kept uninterrupted track of all withdrawals just the **moment** of recent withdrawal. And by the moment I mean the total amount earned on contract so far. Let’s see it in action below.

![Storing the total income of the smart contract as a time instance in a register enables the lazy approach.](https://cdn-images-1.medium.com/max/4054/1*8Ak7LW_eiIvMVkUR6A7TtQ.png)*Storing the total income of the smart contract as a time instance in a register enables the lazy approach.*

### Keep things clean

The recent withdrawal register works ok as long, as the flat shares situation remains unchanged. In case a user decides to transfer some part of their shares to any other user, the withdrawal register becomes useless, because it doesn't keep track of the share change. To mitigate this, the flat needs to calculate the funds owed to each share transfer participant and either save in yet another register or make the transfer participants withdraw it.

![](https://cdn-images-1.medium.com/max/3232/1*IOiJja3melvfo4xYZpNAXw.png)

### Unit test your solution

Undoubtedly, deferring dividends payout and optimizing memory utilization increases the complexity of the solution and is itself a good enough reason to add in unit testing. For this case, I have used hardhat, and unit tests were for the whole time my only interface to interact with the contract. It also proves that it is easy to write unit tests on a hardhat, and surely for such algorithmic nature of the problem, it is worth the effort.

### Calculate wisely

The math you introduce can inevitably bring in several pitfalls. For instance, dividing two numbers may get you into the problem of losing reminders forever. Be aware of this and plan it accordingly. I haven't analyzed it deep enough but I am fully aware that the problem exists. *You may have noticed that I have in all examples based on specific numbers that introduce no division remainings hence the math to handle was so simple.*

## Wrapping up

Next time I approach the Dividend Paying Token scenario I will:

* use ERC-20 if the common part with its interface justifies it

* avoid looping over arrays

* look for possibilities to defer computation them until required

* beware of math-related problems

* without hesitation cover solution with unit tests
