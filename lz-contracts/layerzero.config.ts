import { EndpointId } from '@layerzerolabs/lz-definitions'
const amoy_testnetContract = {
    eid: EndpointId.AMOY_V2_TESTNET,
    contractName: 'EchoOFT',
}
const arbitrum_testnetContract = {
    eid: EndpointId.ARBSEP_V2_TESTNET,
    contractName: 'EchoOFT',
}
const core_testnetContract = {
    eid: EndpointId.COREDAO_V2_TESTNET,
    contractName: 'EchoOFT',
}
export default {
    contracts: [
        { contract: amoy_testnetContract },
        { contract: arbitrum_testnetContract },
        { contract: core_testnetContract },
    ],
    connections: [
        {
            from: amoy_testnetContract,
            to: arbitrum_testnetContract,
            config: {
                sendLibrary: '0x1d186C560281B8F1AF831957ED5047fD3AB902F9',
                receiveLibraryConfig: { receiveLibrary: '0x53fd4C4fBBd53F6bC58CaE6704b92dB1f360A648', gracePeriod: 0 },
                sendConfig: {
                    executorConfig: { maxMessageSize: 10000, executor: '0x4Cf1B3Fa61465c2c907f82fC488B43223BA0CF93' },
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0x55c175DD5b039331dB251424538169D8495C18d1'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
                receiveConfig: {
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0x55c175DD5b039331dB251424538169D8495C18d1'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
            },
        },
        {
            from: amoy_testnetContract,
            to: core_testnetContract,
            config: {
                sendLibrary: '0x1d186C560281B8F1AF831957ED5047fD3AB902F9',
                receiveLibraryConfig: { receiveLibrary: '0x53fd4C4fBBd53F6bC58CaE6704b92dB1f360A648', gracePeriod: 0 },
                sendConfig: {
                    executorConfig: { maxMessageSize: 10000, executor: '0x4Cf1B3Fa61465c2c907f82fC488B43223BA0CF93' },
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0x55c175DD5b039331dB251424538169D8495C18d1'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
                receiveConfig: {
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0x55c175DD5b039331dB251424538169D8495C18d1'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
            },
        },
        {
            from: arbitrum_testnetContract,
            to: amoy_testnetContract,
            config: {
                sendLibrary: '0x4f7cd4DA19ABB31b0eC98b9066B9e857B1bf9C0E',
                receiveLibraryConfig: { receiveLibrary: '0x75Db67CDab2824970131D5aa9CECfC9F69c69636', gracePeriod: 0 },
                sendConfig: {
                    executorConfig: { maxMessageSize: 10000, executor: '0x5Df3a1cEbBD9c8BA7F8dF51Fd632A9aef8308897' },
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0x53f488E93b4f1b60E8E83aa374dBe1780A1EE8a8'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
                receiveConfig: {
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0x53f488E93b4f1b60E8E83aa374dBe1780A1EE8a8'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
            },
        },
        {
            from: arbitrum_testnetContract,
            to: core_testnetContract,
            config: {
                sendLibrary: '0x4f7cd4DA19ABB31b0eC98b9066B9e857B1bf9C0E',
                receiveLibraryConfig: { receiveLibrary: '0x75Db67CDab2824970131D5aa9CECfC9F69c69636', gracePeriod: 0 },
                sendConfig: {
                    executorConfig: { maxMessageSize: 10000, executor: '0x5Df3a1cEbBD9c8BA7F8dF51Fd632A9aef8308897' },
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0x53f488E93b4f1b60E8E83aa374dBe1780A1EE8a8'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
                receiveConfig: {
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0x53f488E93b4f1b60E8E83aa374dBe1780A1EE8a8'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
            },
        },
        {
            from: core_testnetContract,
            to: amoy_testnetContract,
            config: {
                sendLibrary: '0xc8361Fac616435eB86B9F6e2faaff38F38B0d68C',
                receiveLibraryConfig: { receiveLibrary: '0xD1bbdB62826eDdE4934Ff3A4920eB053ac9D5569', gracePeriod: 0 },
                sendConfig: {
                    executorConfig: { maxMessageSize: 10000, executor: '0x3Bdb89Df44e50748fAed8cf851eB25bf95f37d19' },
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0xAe9BBF877BF1BD41EdD5dfc3473D263171cF3B9e'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
                receiveConfig: {
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0xAe9BBF877BF1BD41EdD5dfc3473D263171cF3B9e'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
            },
        },
        {
            from: core_testnetContract,
            to: arbitrum_testnetContract,
            config: {
                sendLibrary: '0xc8361Fac616435eB86B9F6e2faaff38F38B0d68C',
                receiveLibraryConfig: { receiveLibrary: '0xD1bbdB62826eDdE4934Ff3A4920eB053ac9D5569', gracePeriod: 0 },
                sendConfig: {
                    executorConfig: { maxMessageSize: 10000, executor: '0x3Bdb89Df44e50748fAed8cf851eB25bf95f37d19' },
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0xAe9BBF877BF1BD41EdD5dfc3473D263171cF3B9e'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
                receiveConfig: {
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0xAe9BBF877BF1BD41EdD5dfc3473D263171cF3B9e'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
            },
        },
    ],
}
