import { Asset, ChainTypes, ContractTypes, NetworkTypes } from '@shapeshiftoss/types'
import { service } from 'lib/assetService'
import { store } from 'state/store'

import { fetchAsset } from './assetsSlice'

jest.mock('lib/assetService', () => ({
  service: {
    byTokenId: jest.fn(),
    description: jest.fn()
  },
  getAssetService: jest.fn()
}))

const runeAsset = {
  name: 'THORChain  ERC20 ',
  precision: 18,
  tokenId: '0x3155ba85d5f96b2d030a4966af206230e46849cb',
  contractType: ContractTypes.ERC20,
  color: '#FFFFFF',
  secondaryColor: '#FFFFFF',
  icon: 'https://assets.coingecko.com/coins/images/13677/thumb/IMG_20210123_132049_458.png?1612179252',
  explorer: 'https://etherscan.io',
  explorerTxLink: 'https://etherscan.io/tx/',
  sendSupport: true,
  receiveSupport: true,
  symbol: 'RUNE',
  chain: ChainTypes.Ethereum,
  network: NetworkTypes.MAINNET,
  slip44: 60
}

const runeDescription =
  'THORChain is building a chain-agnostic bridging protocol that will allow trustless and secure value-transfer connections with most other chains (such as Bitcoin, Ethereum, Monero and all of Binance Chain). Users will be able to instantly swap any asset at fair market prices and deep liquidity. Token holders will be able to stake any asset and earn on liquidity fees. Projects will be able to access manipulation resistant price feeds and accept payments in any currencies, no matter the type or liquidity.'

const setup = ({
  assetData,
  description
}: {
  assetData: Asset | undefined
  description: string | null
}) => {
  ;(service?.byTokenId as unknown as jest.Mock<unknown>).mockImplementation(() => assetData)
  ;(service?.description as unknown as jest.Mock<unknown>).mockImplementation(() => description)
}

describe('assetsSlice', () => {
  it('returns empty object for initialState', async () => {
    expect(store.getState().assets).toEqual({})
  })

  describe('fetchAsset', () => {
    it('does not update state if assetData does not exist', async () => {
      setup({ assetData: undefined, description: null })
      expect(store.getState().assets[runeAsset.tokenId]).toBeFalsy()
      await store.dispatch(
        fetchAsset({
          tokenId: runeAsset.tokenId,
          chain: ChainTypes.Ethereum,
          network: NetworkTypes.MAINNET
        })
      )
      expect(store.getState().assets[runeAsset.tokenId]).toBeFalsy()
    })

    it('updates state if assetData exists but description does not', async () => {
      setup({ assetData: runeAsset, description: null })
      expect(store.getState().assets[runeAsset.tokenId]).toBeFalsy()
      await store.dispatch(
        fetchAsset({
          tokenId: runeAsset.tokenId,
          chain: ChainTypes.Ethereum,
          network: NetworkTypes.MAINNET
        })
      )
      expect(store.getState().assets[runeAsset.tokenId]).toBeTruthy()
      expect(store.getState().assets[runeAsset.tokenId].description).toBeFalsy()
    })

    it('updates state if assetData & description exists', async () => {
      const asset = { ...runeAsset, tokenId: 'tokenId2WithDescription' }
      setup({ assetData: asset, description: runeDescription })
      await store.dispatch(
        fetchAsset({
          tokenId: asset.tokenId,
          chain: ChainTypes.Ethereum,
          network: NetworkTypes.MAINNET
        })
      )
      expect(store.getState().assets[asset.tokenId]).toBeTruthy()
      expect(store.getState().assets[asset.tokenId].description).toBeTruthy()
    })

    it('does not update state if error is thrown', async () => {
      const asset = { ...runeAsset, tokenId: 'tokenId3Error' }
      const consoleError = jest.spyOn(console, 'error').mockImplementation()
      ;(service?.byTokenId as unknown as jest.Mock<unknown>).mockRejectedValue(
        // @ts-ignore
        'Network error: Something went wrong'
      )
      ;(service?.description as unknown as jest.Mock<unknown>).mockRejectedValue(
        // @ts-ignore
        'Network error: Something went wrong'
      )
      expect(store.getState().assets[asset.tokenId]).toBeFalsy()
      await store.dispatch(
        fetchAsset({
          tokenId: asset.tokenId,
          chain: ChainTypes.Ethereum,
          network: NetworkTypes.MAINNET
        })
      )
      expect(store.getState().assets[asset.tokenId]).toBeFalsy()
      expect(console.error).toBeCalled()
      consoleError.mockRestore()
    })
  })
})
