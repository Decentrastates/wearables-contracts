import assertRevert from '../helpers/assertRevert'

const ChainlinkOracle = artifacts.require('ChainlinkOracle')
const DummyAggregatorV3Interface = artifacts.require(
  'DummyAggregatorV3Interface'
)

const BN = web3.utils.BN
const expect = require('chai').use(require('bn-chai')(BN)).expect

const oracleContractDecimals = 18
const feedContractDecimals = 8

let dataFeedContract

beforeEach(async function () {
  dataFeedContract = await DummyAggregatorV3Interface.new(
    feedContractDecimals,
    10 ** feedContractDecimals
  )
})

describe('ChainlinkOracle', function () {
  describe('initialize', function () {
    it('should be initialized with correct values', async function () {
      const chainlinkOracleContract = await ChainlinkOracle.new(
        dataFeedContract.address,
        oracleContractDecimals
      )

      const dataFeed = await chainlinkOracleContract.dataFeed()
      expect(dataFeed).to.be.equal(dataFeedContract.address)

      const decimals = await chainlinkOracleContract.decimals()
      expect(decimals).to.eq.BN(oracleContractDecimals)
    })
  })

  describe('getRate', function () {
    it('should return the rate', async function () {
      const chainlinkOracleContract = await ChainlinkOracle.new(
        dataFeedContract.address,
        oracleContractDecimals
      )

      const rate = await chainlinkOracleContract.getRate()
      const expectedRate = web3.utils.toBN(10 ** oracleContractDecimals)
      expect(rate).to.eq.BN(expectedRate)
    })

    it('should revert when feed answer is negative', async function () {
      const dataFeedContract = await DummyAggregatorV3Interface.new(
        feedContractDecimals,
        10 ** feedContractDecimals * -1
      )
      const chainlinkOracleContract = await ChainlinkOracle.new(
        dataFeedContract.address,
        oracleContractDecimals
      )

      const expectedError = 'ChainlinkOracle#getRate: RATE_BELOW_0'

      await assertRevert(chainlinkOracleContract.getRate(), expectedError)
    })
  })
})
