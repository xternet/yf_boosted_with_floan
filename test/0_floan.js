const { legos } = require("@studydefi/money-legos");
const { expect } = require('chai');

require('chai')
  .use(require('chai-as-promised'))
  .should()

const FlashLoanTemplate = artifacts.require('./FlashLoanTemplate')

contract('FlashLoanTemplate', ([acc]) => {
  let dai, uniswap, daiSwap, daiSwapAddress

  beforeEach(async () => {
    //contracts declaration for swapping ETH=>DAI
    dai = new web3.eth.Contract(legos.erc20.dai.abi, legos.erc20.dai.address)
    uniswap = new web3.eth.Contract(legos.uniswap.factory.abi, legos.uniswap.factory.address)
    daiSwapAddress = await uniswap.methods.getExchange(legos.erc20.dai.address).call()
    daiSwap = new web3.eth.Contract(legos.uniswap.exchange.abi, daiSwapAddress)

    //swap 1 ETH=>DAI
    await daiSwap.methods.ethToTokenSwapInput(1, 2525644800).send({from: acc, value: web3.utils.toWei('1', 'Ether')})
    
    contract = await FlashLoanTemplate.new()

    //send 1 DAI to contract (for flash loan fee)
    await dai.methods.transfer(contract.address, web3.utils.toWei('1', 'ether')).send({from: acc})
  })

  describe('Performing Flash Loan...', () => {
    it('Borrowing 1M DAI and throws revert info msg.', async () => {
      await contract.initiateFlashLoan(
        legos.dydx.soloMargin.address,
        legos.erc20.dai.address,
        web3.utils.toWei('1000000', 'Ether')
      ).should.be.rejectedWith("!You got desired funds, now code what to do next")
    })
  })
})
