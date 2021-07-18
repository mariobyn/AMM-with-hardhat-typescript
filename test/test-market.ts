import { ethers } from "hardhat";
import { Signer } from "ethers";
import { expect } from "chai";
import { Token__factory, Market__factory, Token, Market } from "../typechain"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Market", () => {
    let MarketFactory: any;
    let TokenFactory: any;
    let kiwi: any;
    let plum: any;
    let market: any;
    let owner: SignerWithAddress;
    beforeEach(async () => {
        [owner] = await ethers.getSigners();

        MarketFactory = (await ethers.getContractFactory(
            "Market", owner
        )) as Market__factory;
        TokenFactory = (await ethers.getContractFactory(
            "Token", owner
        )) as Token__factory;


        kiwi = await (await TokenFactory).deploy();
        plum = await (await TokenFactory).deploy();


        market = (await (await MarketFactory).deploy((await kiwi).address, (await plum).address));

        await kiwi.approve(market.address, 2000);
        await plum.approve(market.address, 2000);

    })

    it("Tokens associated correctly to Market Contract", async () => {
        expect(await kiwi.address).not.equal(undefined);
        expect(await plum.address).not.equal(undefined);

        expect(await market.xToken()).to.equal(kiwi.address);
        expect(await market.yToken()).to.equal(plum.address);
    })

    it("Supply", async () => {
        expect(await market.supply(1000, 2000)).to.emit(market, "Supply").withArgs(1000, 2000);
        expect(await kiwi.balanceOf(market.address)).to.equal(1000);
        expect(await plum.balanceOf(market.address)).to.equal(2000);
    })

    it("Trade", async () => {
        expect(await market.supply(1000, 2000)).to.emit(market, "Supply").withArgs(1000, 2000);
        expect(await market.trade(100)).to.emit(market, "Trade").withArgs(100);
        expect(await kiwi.balanceOf(market.address)).to.equal(1100);
        expect(await plum.balanceOf(market.address)).to.equal(1800);
    })

    it("Trade reverts on 0", async () => {
        await expect(market.trade(0)).to.be.revertedWith('amount is 0');
    })

    it("Supply with 0 reverts", async () => {
        await expect(market.supply(0, 1000)).to.be.revertedWith('xAmount or yAmount is 0');
        await expect(market.supply(1000, 0)).to.be.revertedWith('xAmount or yAmount is 0');
        await expect(market.supply(0, 0)).to.be.revertedWith('xAmount or yAmount is 0');
    })

    it("Supply with xAmount greater than available balance fails", async () => {
        await expect(market.supply(3000, 2000)).to.be.revertedWith('xAmount is greater than available balance of sender');
    })

    it("Supply with yAmount greater than available balance fails", async () => {
        await expect(market.supply(2000, 3000)).to.be.revertedWith('yAmount is greater than available balance of sender');
    })
})