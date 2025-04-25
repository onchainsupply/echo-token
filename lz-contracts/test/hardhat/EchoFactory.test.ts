import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract, ContractFactory } from 'ethers'
import { deployments, ethers } from 'hardhat'
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'
import { Options } from '@layerzerolabs/lz-v2-utilities'

describe('EchoFactory Test', function () {
    const eidA = 1
    const eidB = 2
    const deployFee = ethers.utils.parseEther('0.1')
    const initialSupply = ethers.utils.parseEther('1000000')

    let EchoFactory: ContractFactory
    let EndpointV2Mock: ContractFactory
    let ownerA: SignerWithAddress
    let ownerB: SignerWithAddress
    let endpointOwner: SignerWithAddress

    let EchoFactoryA: Contract
    let EchoFactoryB: Contract
    let mockEndpointV2A: Contract
    let mockEndpointV2B: Contract

    before(async function () {
        EchoFactory = await ethers.getContractFactory('EchoFactory')
        const signers = await ethers.getSigners()
        ;[ownerA, ownerB, endpointOwner] = signers

        const EndpointV2MockArtifact = await deployments.getArtifact('EndpointV2Mock')
        EndpointV2Mock = new ContractFactory(EndpointV2MockArtifact.abi, EndpointV2MockArtifact.bytecode, endpointOwner)
    })

    beforeEach(async function () {
        mockEndpointV2A = await EndpointV2Mock.deploy(eidA)
        mockEndpointV2B = await EndpointV2Mock.deploy(eidB)

        EchoFactoryA = await EchoFactory.connect(ownerA).deploy(mockEndpointV2A.address)
        EchoFactoryB = await EchoFactory.connect(ownerB).deploy(mockEndpointV2B.address)
    })

    it('should launch a Regular token', async function () {
        const tx = await EchoFactoryA.connect(ownerA).launchToken('MOJI', '🌮', initialSupply, ownerA.address, {
            value: deployFee,
        })
        const receipt = await tx.wait()
        const token = receipt.events?.find((e: any) => e.event === 'TokenRegistered')?.args?.token
        expect(ethers.utils.isAddress(token)).to.be.true
        expect(token).to.not.equal(ethers.constants.AddressZero)
    })

    it('should launch a Regular CREATE2 token', async function () {
        const tx = await EchoFactoryA.connect(ownerA).launchToken2('MOJI', '🌮', initialSupply, {
            value: deployFee,
        })
        const receipt = await tx.wait()
        const token = receipt.events?.find((e: any) => e.event === 'TokenRegistered')?.args?.token
        expect(ethers.utils.isAddress(token)).to.be.true
        expect(token).to.not.equal(ethers.constants.AddressZero)
    })

    it('should launch an OFT token', async function () {
        const tx = await EchoFactoryA.connect(ownerA).launchOFT('MOJI', '🌮', initialSupply, {
            value: deployFee,
        })
        const receipt = await tx.wait()
        const token = receipt.events?.find((e: any) => e.event === 'TokenRegistered')?.args?.token
        expect(ethers.utils.isAddress(token)).to.be.true
        expect(await EchoFactoryA.lzEndpoint()).eql(mockEndpointV2A.address)
    })

    it('should launch an OFT CREATE2 token', async function () {
        const tx = await EchoFactoryA.connect(ownerA).launchOFT2('MOJI', '🌮', initialSupply, {
            value: deployFee,
        })
        const receipt = await tx.wait()
        const token = receipt.events?.find((e: any) => e.event === 'TokenRegistered')?.args?.token
        expect(ethers.utils.isAddress(token)).to.be.true
        expect(await EchoFactoryA.lzEndpoint()).eql(mockEndpointV2A.address)
    })

    it('should wrap an existing token as OFTAdapter', async function () {
        const deployTx = await EchoFactoryA.connect(ownerA).launchToken('WRAP', 'WRP', initialSupply, ownerA.address, {
            value: deployFee,
        })
        const deployReceipt = await deployTx.wait()
        const originalToken = deployReceipt.events?.find((e: any) => e.event === 'TokenRegistered')?.args?.token

        const wrapTx = await EchoFactoryA.connect(ownerA).wrapAsOFT(originalToken, { value: deployFee })
        const wrapReceipt = await wrapTx.wait()
        const adapter = wrapReceipt.events?.find((e: any) => e.event === 'TokenRegistered')?.args?.token
        expect(ethers.utils.isAddress(adapter)).to.be.true
        expect(adapter).to.not.equal(ethers.constants.AddressZero)
    })

    it('should bridge OFT tokens between mock chains', async function () {
        const txA = await EchoFactoryA.connect(ownerA).launchOFT('MOJI', '🌮', initialSupply, {
            value: deployFee,
        })
        const receiptA = await txA.wait()
        const tokenA = receiptA.events?.find((e: any) => e.event === 'TokenRegistered')?.args?.token

        const txB = await EchoFactoryB.connect(ownerA).launchOFT('MOJI', '🌮', 0n, {
            value: deployFee,
        })
        const receiptB = await txB.wait()
        const tokenB = receiptB.events?.find((e: any) => e.event === 'TokenRegistered')?.args?.token

        expect(tokenA).to.not.equal(ethers.constants.AddressZero)
        expect(tokenB).to.not.equal(ethers.constants.AddressZero)

        const EchoOFTA = await ethers.getContractAt('EchoOFT', tokenA)
        const EchoOFTB = await ethers.getContractAt('EchoOFT', tokenB)

        // Setting destination endpoints in the LZEndpoint mock for each EchoOFT instance
        await mockEndpointV2A.setDestLzEndpoint(EchoOFTB.address, mockEndpointV2B.address)
        await mockEndpointV2B.setDestLzEndpoint(EchoOFTA.address, mockEndpointV2A.address)

        await EchoOFTA.connect(ownerA).setPeer(eidB, ethers.utils.zeroPad(EchoOFTB.address, 32))
        await EchoOFTB.connect(ownerB).setPeer(eidA, ethers.utils.zeroPad(EchoOFTA.address, 32))

        expect(await EchoOFTA.owner()).to.eq(ownerA.address)
        expect(await EchoOFTB.owner()).to.eq(ownerB.address)

        const tokensToSend = ethers.utils.parseEther('1')

        // Defining extra message execution options for the send operation
        const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()

        const sendParam = [
            eidB,
            ethers.utils.zeroPad(ownerB.address, 32),
            tokensToSend,
            tokensToSend,
            options,
            '0x',
            '0x',
        ]

        // Fetching the native fee for the token send operation
        const [nativeFee] = await EchoOFTA.quoteSend(sendParam, false)

        // Executing the send operation from EchoOFTA contract
        await EchoOFTA.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee })

        // Fetching the final token balances of ownerA and ownerB
        const finalBalanceA = await EchoOFTA.balanceOf(ownerA.address)
        const finalBalanceB = await EchoOFTB.balanceOf(ownerB.address)
        // console.log(finalBalanceA, finalBalanceB)

        // Asserting that the final balances are as expected after the send operation
        expect(finalBalanceA).eql(initialSupply.sub(tokensToSend))
        expect(finalBalanceB).eql(tokensToSend)
    })
})
