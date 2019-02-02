module.exports = {
     // See <http://truffleframework.com/docs/advanced/configuration>
     // to customize your Truffle configuration!
     networks: {
          ganache: {
               host: "localhost",
               port: 7545,
               network_id: "*" // Match any network id
          },
          catalgo: {
            host: "localhost",
            port: 8545,
            network_id: "4224",
            gas: 4700000
          },
          rinkeby: {
            host: "localhost",
            port: 8545,
            network_id: "4", //rinkeby test network
            gas: 4700000
          },
          live: {
            host: "localhost",
            port: 8545,
            network_id: "1",
            gas: 4700000,
            gasPrice: 57000000000,
            from: "0xbf6f5e78e154799c7856f4cf9f269cf7a7201310"
          }
     }
};
