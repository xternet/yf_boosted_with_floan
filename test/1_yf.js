const { legos } = require("@studydefi/money-legos");
const { expect } = require('chai');

require('chai')
  .use(require('chai-as-promised'))
  .should()

const LeveragedYieldFarm = artifacts.require('./LeveragedYieldFarm')

const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

contract('LeveragedYieldFarm', ([acc]) => {
  let dai, uniswap, daiSwapAddress, daiSwap, cDai, comp, contract

  beforeEach(async () => {
    //contract from swapping ETH=>DAI
    dai = new web3.eth.Contract(legos.erc20.dai.abi, legos.erc20.dai.address)
    uniswap = new web3.eth.Contract(legos.uniswap.factory.abi, legos.uniswap.factory.address)
    daiSwapAddress = await uniswap.methods.getExchange(legos.erc20.dai.address).call()
    daiSwap = new web3.eth.Contract(legos.uniswap.exchange.abi, daiSwapAddress)

    //Compound
    cDai = new web3.eth.Contract(legos.compound.cDAI.abi, legos.compound.cDAI.address)
    comp = new web3.eth.Contract(legos.erc20.abi, '0xc00e94cb662c3520282e6f5717214004a7f26888')

    contract = await LeveragedYieldFarm.new()
  })

  describe('Uniswap', () => {
    it('swapping 1 ETH for DAI...', async () => {
      const ethBalanceBefore = await web3.eth.getBalance(acc)
      const daiBalanceBefore = await dai.methods.balanceOf(acc).call()

      //1-min. number of retrieved tokens;2525644800 -random timestamp(2050y)
      await daiSwap.methods.ethToTokenSwapInput(1, 2525644800).send({from: acc, value: web3.utils.toWei('1', 'Ether')})

      const ethBalanceAfter = await web3.eth.getBalance(acc)
      const daiBalanceAfter = await dai.methods.balanceOf(acc).call()

      expect(Number(daiBalanceAfter)).to.be.above(Number(daiBalanceBefore))
      expect(Number(ethBalanceAfter)).to.be.below(Number(ethBalanceBefore))
    })
  })

  describe('Leveraged Yield Farming on Compound boosted with dYdX flash loan...', () => {
    beforeEach(async () => {
      //deposit 1.1 DAI to contract (.1 for fee)
      await dai.methods.transfer(contract.address, web3.utils.toWei('1.1', 'Ether')).send({from: acc})

      //supplying 1 DAI with flash loan to Compound
      await contract.depositDai(web3.utils.toWei('1', 'Ether'))
    })

    it('deposit/wait/withdrawing/taking profits...', async () => {
      const ethBalanceBefore = await web3.eth.getBalance(acc)
      const daiBalanceBefore = web3.utils.fromWei(await dai.methods.balanceOf(acc).call())
      const cDaiBalanceBefore = web3.utils.fromWei(await cDai.methods.balanceOf(contract.address).call())
      const compBalanceBefore = web3.utils.fromWei(await comp.methods.balanceOf(acc).call())

      console.log('\nw8 10s to accrue interest...\n')
      await wait(10)

      //Taking profits
      await contract.withdrawDai(web3.utils.toWei('1', 'Ether'))

      const ethBalanceAfter = await web3.eth.getBalance(acc)
      const daiBalanceAfter = web3.utils.fromWei(await dai.methods.balanceOf(acc).call())
      const cDaiBalanceAfter = web3.utils.fromWei(await cDai.methods.balanceOf(contract.address).call())
      const compBalanceAfter = web3.utils.fromWei(await comp.methods.balanceOf(acc).call())

      expect(Number(ethBalanceBefore)).to.be.above(Number(ethBalanceAfter)) //cuz gas fee
      expect(Number(daiBalanceAfter)).to.be.above(Number(daiBalanceBefore)) //cuz interest for supplying
      expect(Number(cDaiBalanceBefore)).to.be.above(Number(cDaiBalanceAfter)) //cuz swapping cDAI=>DAI
      expect(Number(compBalanceAfter)).to.be.above(Number(compBalanceBefore)) //cuz successful YF
    })
  })
})
