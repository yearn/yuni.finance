import config from "../config";
import async from 'async';
import {
  ERROR,
  DELEGATE,
  DELEGATE_RETURNED,
  SIGN_DELEGATE,
  SIGN_DELEGATE_RETURNED,
  SAVE_DELEGATE,
  SAVE_DELEGATE_RETURNED,
  GET_BALANCE,
  BALANCE_RETURNED,
  GET_DELEGATEE_BALANCE,
  DELEGATEE_BALANCE_RETURNED
} from '../constants';
import Web3 from 'web3';

import { injected } from "./connectors";

const rp = require('request-promise');

const Dispatcher = require('flux').Dispatcher;
const Emitter = require('events').EventEmitter;

const dispatcher = new Dispatcher();
const emitter = new Emitter();

class Store {
  constructor() {

    this.store = {
      universalGasPrice: '70',
      account: {},
      connectorsByName: {
        MetaMask: injected
      },
      web3context: null,
      uniBalances: {

      },
      delegatees: [
        {
          id: 'univalent',
          logo: 'andre-logo.jpg',
          name: 'Univalent',
          surname: '',
          twitter: 'https://twitter.com/AndreCronjeTech',
          address: '0x1994b59E02Cd0d09D839b03660C205e88a929b81',
          totalDelegated: 0
        }
      ]
    }

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case GET_BALANCE:
            this.getBalance(payload);
            break;
          case GET_DELEGATEE_BALANCE:
            this.getDelegateeBalance(payload);
            break;
          case DELEGATE:
            this.delegate(payload);
            break;
          case SIGN_DELEGATE:
            this.signDelegate(payload);
            break;
          case SAVE_DELEGATE:
            this.saveDelegate(payload);
            break;
          default: {
          }
        }
      }.bind(this)
    );
  }

  getStore(index) {
    return(this.store[index]);
  };

  setStore(obj) {
    this.store = {...this.store, ...obj}
    // console.log(this.store)
    return emitter.emit('StoreUpdated');
  };

  getBalance = async () => {
    const account = store.getStore('account')

    if(!account || !account.address) {
      return false
    }

    const web3 = await this._getWeb3Provider();
    if(!web3) return

    async.parallel([
      (callbackInner) => { this._getERC20Balance(web3, account, callbackInner) },
      (callbackInner) => { this._getDelegatedAddress(web3, account, callbackInner) },
    ], (err, data) => {

      const uniBalances = {
        balance: data[0],
        delegatedAddress: data[1]
      }

      store.setStore({ uniBalances: uniBalances })
      return emitter.emit(BALANCE_RETURNED, uniBalances)
    })
  }

  _getERC20Balance = async (web3, account, callback) => {
    const erc20Contract = new web3.eth.Contract(config.uniswapContractABI, config.uniswapContractAddress)

    try {
      let balance = await erc20Contract.methods.balanceOf(account.address).call({ from: account.address });
      balance = parseFloat(balance)/10**18
      callback(null, parseFloat(balance))
    } catch(ex) {
      console.log(ex)
      return callback(ex)
    }
  }

  _getDelegatedAddress = async (web3, account, callback) => {
    const erc20Contract = new web3.eth.Contract(config.uniswapContractABI, config.uniswapContractAddress)

    try {
      const address = await erc20Contract.methods.delegates(account.address).call({ from: account.address });
      callback(null, address)
    } catch(ex) {
      console.log(ex)
      return callback(ex)
    }
  }

  getDelegateeBalance = async () => {
    const web3 = await this._getWeb3Provider();
    if(!web3) return

    const delegatees = store.getStore('delegatees')

    async.map(delegatees, (delegatee, callback) => {
      async.parallel([
        (callbackInner) => { this._getDelegateeBalance(web3, delegatee, callbackInner) },
      ], (err, data) => {
        delegatee.totalDelegated = data[0]

        callback(null, delegatee)
      })
    }, (err, assets) => {
      if(err) {
        return emitter.emit(ERROR, err)
      }

      store.setStore({ delegatees: delegatees })
      return emitter.emit(DELEGATEE_BALANCE_RETURNED, delegatees)
    })
  }

  _getDelegateeBalance = async (web3, delegatee, callback) => {
    const erc20Contract = new web3.eth.Contract(config.uniswapContractABI, config.uniswapContractAddress)

    try {
      var balance = await erc20Contract.methods.getCurrentVotes(delegatee.address).call();
      balance = parseFloat(balance)/10**18
      callback(null, parseFloat(balance))
    } catch(ex) {
      console.log(ex)
      return callback(ex)
    }
  }

  _getERC20Balance = async (web3, account, callback) => {
    const erc20Contract = new web3.eth.Contract(config.uniswapContractABI, config.uniswapContractAddress)

    try {
      var balance = await erc20Contract.methods.balanceOf(account.address).call({ from: account.address });
      balance = parseFloat(balance)/10**18
      callback(null, parseFloat(balance))
    } catch(ex) {
      console.log(ex)
      return callback(ex)
    }
  }

  delegate = async (payload) => {
    const { delegatee } = payload.content
    const account = store.getStore('account')
    const web3 = await this._getWeb3Provider();
    if(!web3) return

    this._delegate(web3, account, delegatee, (err, result) => {
      if(err) {
        return emitter.emit(ERROR, err)
      }

      return emitter.emit(DELEGATE_RETURNED, result)
    })
  }

  _delegate = async (web3, account, delegatee, callback) => {
    const uniswapContract = new web3.eth.Contract(config.uniswapContractABI, config.uniswapContractAddress)

    uniswapContract.methods.delegate(delegatee.address).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
    .on('transactionHash', function(hash){
      callback(null, hash)
    })
    .on('error', function(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    })
  }

  signDelegate = async (payload) => {
    const { delegatee } = payload.content
    const account = store.getStore('account')
    const web3 = await this._getWeb3Provider();
    if(!web3) return

    this._signDelegateBySig(web3, account, delegatee, (err, result) => {
      if(err) {
        return emitter.emit(ERROR, err)
      }

      return emitter.emit(SIGN_DELEGATE_RETURNED, result)
    })
  }

  _signDelegateBySig = async (web3, account, delegatee, callback) => {
    const domain = [
      { name: "name", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ];

    const delegation = [
      { name: 'delegatee', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'expiry', type: 'uint256' }
    ];

    const chainId = web3.currentProvider.networkVersion;

    const domainData = {
      name: "Uniswap",
      version: "1",
      chainId: chainId,
      verifyingContract: config.uniswapContractAddress
    };

    const uniswapContract = new web3.eth.Contract(config.uniswapContractABI, config.uniswapContractAddress)

    const nonce = await uniswapContract.methods.nonces(account.address).call()
    const expiry = 10e9; // expiration of signature, in seconds since unix epoch
    var message = {
      delegatee: delegatee.address,
      nonce: nonce,
      expiry: expiry
    };

    const data = JSON.stringify({
      types: {
        EIP712Domain: domain,
        Delegation: delegation
      },
      domain: domainData,
      primaryType: "Delegation",
      message: message
    });

    const signer = web3.utils.toChecksumAddress(account.address);

    const that = this


    web3.currentProvider.sendAsync(
      {
        method: "eth_signTypedData_v3",
        params: [signer, data],
        from: signer
      },
      function(err, result) {
        if (err || result.error) {
          console.error(err || result.error);
          if(result && result.error && result.error.message) {
            return callback(result.error.message)  
          }
          return callback(err || result.error)
        }

        const signature = that._parseSignature(result.result.substring(2));

        const returnObj = {
          signer: signer,
          message: message,
          r: signature.r,
          s: signature.s,
          v: signature.v
        }

        callback(null, returnObj)
      }
    );
  }

  _parseSignature = (signature) => {
    var r = signature.substring(0, 64);
    var s = signature.substring(64, 128);
    var v = signature.substring(128, 130);

    return {
        r: "0x" + r,
        s: "0x" + s,
        v: parseInt(v, 16)
    }
  }
  saveDelegate = async (payload) => {

    const { signature } = payload.content
    var requestOpts = {
        uri: config.apiURL+'/api/v1/saveSignature',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + config.apiToken,
        },
        body: JSON.stringify({
          signer: signature.signer,
          message: signature.message,
          r: signature.r,
          s: signature.s,
          v: signature.v
        })
    };

    rp(requestOpts)
    .then(function(res) {
      try {
        const json = JSON.parse(res)
        if(json.status === 200) {
          return emitter.emit(SAVE_DELEGATE_RETURNED, json)
        } else {
          return emitter.emit(ERROR, res)
        }
      } catch(ex) {
        return emitter.emit(ERROR, ex)
      }
    })
    .catch(function(err) {
      return emitter.emit(ERROR, err)
    });

  }

  _getWeb3Provider = async () => {
    const web3context = store.getStore('web3context')
    if(!web3context) {
      return null
    }
    const provider = web3context.library.provider
    if(!provider) {
      return null
    }

    const web3 = new Web3(provider);

    return web3
  }

  _getGasPrice = async () => {
    try {
      const url = 'https://gasprice.poa.network/'
      const priceString = await rp(url);
      const priceJSON = JSON.parse(priceString)
      if(priceJSON) {
        return priceJSON.fast.toFixed(0)
      }
      return store.getStore('universalGasPrice')
    } catch(e) {
      console.log(e)
      return store.getStore('universalGasPrice')
    }
  }
}

var store = new Store();

export default {
  store: store,
  dispatcher: dispatcher,
  emitter: emitter
};
