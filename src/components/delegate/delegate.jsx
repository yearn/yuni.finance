import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
} from '@material-ui/core';
import Delegatee from './delegatee.jsx'

import {
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DELEGATE_RETURNED,
  ERROR,
  GET_BALANCE,
  BALANCE_RETURNED,
  GET_DELEGATEE_BALANCE,
  DELEGATEE_BALANCE_RETURNED,
  SIGN_DELEGATE_RETURNED,
  SAVE_DELEGATE_RETURNED
} from '../../constants'

import Snackbar from '../snackbar'
import Loader from '../loader'
import UnlockModal from '../unlock/unlockModal.jsx'

import Store from "../../stores";
const emitter = Store.emitter
const dispatcher = Store.dispatcher
const store = Store.store


const styles = theme => ({
  root: {
    minWidth: '100vw',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundPosition: '0px -30vh',
    backgroundRepeat: 'no-repeat',
    backgroundImage: 'radial-gradient(50% 50% at 50% 50%, rgba(255, 0, 122, 0.1) 0%, rgba(255, 255, 255, 0) 100%)'
  },
  header: {
    padding: '1rem',
    borderBottom: '1px solid #dedede',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '40px'
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  delegateeContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  disclaimer: {
    border:  '1px solid rgba(43,57,84,.5)',
    color: 'rgba(43,57,84,.5)',
    padding: '12px',
    borderRadius: '12px',
    marginBottom: '40px',
    width: 'fit-content'
  },
  icon: {
    marginRight: '24px'
  },
  title: {
    flex: 1,
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  titleReplacement: {
    display: 'none',
    [theme.breakpoints.down('sm')]: {
      flex: 1,
      display: 'block'
    }
  },
  walletAddress: {
    padding: '12px',
    border: '2px solid rgb(174, 174, 174)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    '&:hover': {
      border: "2px solid #dedede"
    }
  },
  uniBalance: {
    display: 'flex',
    flexDirection: 'row',
    '-webkit-box-align': 'center',
    alignItems: 'center',
    borderRadius: '12px',
    whiteSpace: 'nowrap',
    color: 'white',
    padding: '4px 16px',
    height: '45px',
    fontWeight: '500',
    background: 'radial-gradient(174.47% 188.91% at 1.84% 0%, rgb(255, 0, 122) 0%, rgb(33, 114, 229) 100%), rgb(237, 238, 242)',
    marginRight: '12px'
  }
});

class Delegate extends Component {

  constructor(props) {
    super()

    this.state = {
      account: store.getStore('account'),
      delegatees: store.getStore('delegatees'),
      uniBalances: store.getStore('uniBalances'),
      snackbarType: null,
      snackbarMessage: null,
      loading: false,
    }
  }

  componentWillMount() {
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(DELEGATE_RETURNED, this.showHash);
    emitter.on(SIGN_DELEGATE_RETURNED, this.signDelegateReturned);
    emitter.on(SAVE_DELEGATE_RETURNED, this.saveDelegateReturned);
    emitter.on(ERROR, this.errorReturned);
    emitter.on(BALANCE_RETURNED, this.balanceReturned);
    emitter.on(DELEGATEE_BALANCE_RETURNED, this.delegateeBalanceReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.removeListener(DELEGATE_RETURNED, this.showHash);
    emitter.removeListener(SIGN_DELEGATE_RETURNED, this.signDelegateReturned);
    emitter.removeListener(SAVE_DELEGATE_RETURNED, this.saveDelegateReturned);
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(BALANCE_RETURNED, this.balanceReturned);
    emitter.removeListener(DELEGATEE_BALANCE_RETURNED, this.delegateeBalanceReturned);
  }

  connectionConnected = () => {
    this.setState({ account: store.getStore('account') })

    dispatcher.dispatch({ type: GET_BALANCE, content: {} })
    dispatcher.dispatch({ type: GET_DELEGATEE_BALANCE, content: {} })
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore('account') })

    dispatcher.dispatch({ type: GET_BALANCE, content: {} })
    dispatcher.dispatch({ type: GET_DELEGATEE_BALANCE, content: {} })
  }

  balanceReturned = () => {
    this.setState({ uniBalances: store.getStore('uniBalances') })
  }

  delegateeBalanceReturned = () => {
    this.setState({ delegatees: store.getStore('delegatees') })
  }

  signDelegateReturned = () => {
    this.setState({ loading: false })
  }

  saveDelegateReturned = (result) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null }
    this.setState(snackbarObj)
    this.setState({ loading: false })
    const that = this
    setTimeout(() => {
      const snackbarObj = { snackbarMessage: 'Signature submitted', snackbarType: 'Success' }
      that.setState(snackbarObj)
    })
  }

  errorReturned = (error) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null }
    this.setState(snackbarObj)
    this.setState({ loading: false })
    const that = this
    setTimeout(() => {
      const snackbarObj = { snackbarMessage: error.toString(), snackbarType: 'Error' }
      that.setState(snackbarObj)
    })
  };

  showHash = (txHash) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null }
    this.setState(snackbarObj)
    this.setState({ loading: false })
    const that = this
    setTimeout(() => {
      const snackbarObj = { snackbarMessage: txHash, snackbarType: 'Hash' }
      that.setState(snackbarObj)
    })
  }

  render() {
    const {
      account,
      modalOpen,
      loading,
      snackbarMessage,
      uniBalances
    } = this.state
    const { classes } = this.props

    let address = null;
    if (account.address) {
      address = account.address.substring(0,6)+'...'+account.address.substring(account.address.length-4,account.address.length)
    }

    return (
      <div className={ classes.root }>
        <div className={ classes.header }>
          <img
            className={ classes.icon }
            alt="Logo"
            src={ require('../../assets/uniswap-logo.svg') }
            height={ '40px' }
          />
          <Typography variant='h3' className={ classes.title }>yuni.finance</Typography>
          <div className={ classes.titleReplacement }></div>
          { address &&
            <div className={ classes.uniBalance }>
              <Typography variant={ 'h4'}>{ (uniBalances && uniBalances.balance) ? uniBalances.balance.toFixed(0) +' UNI' : '0 UNI' }</Typography>
            </div>
          }
          <div className={ classes.account }>
            { address &&
              <Typography variant={ 'h4'} className={ classes.walletAddress } noWrap onClick={this.addressClicked} >
                { address }
                <div className={ classes.connectedDot }></div>
              </Typography>
            }
            { !address &&
              <Typography variant={ 'h4'} className={ classes.walletAddress } noWrap onClick={this.addressClicked} >
                Connect your wallet
              </Typography>
            }
          </div>
        </div>
        <div className={ classes.contentContainer }>
          <Typography variant={'h5'} className={ classes.disclaimer }>This project is in beta. Use at your own risk.</Typography>
          <div className={ classes.delegateeContainer }>
            { this.rederDelegatees() }
          </div>
        </div>
        { modalOpen && this.renderModal() }
        { loading && <Loader /> }
        { snackbarMessage && this.renderSnackbar() }
      </div>
    )
  };

  rederDelegatees = () => {
    const { delegatees, uniBalances, account } = this.state

    return delegatees.map((delegatee) => {
      return (
        <Delegatee key={ delegatee.address } delegatee={ delegatee } startLoading={ this.startLoading } stopLoading={ this.stopLoading } uniBalances={ uniBalances } addressClicked={ this.addressClicked } account={ account } />
      )
    })
  };

  startLoading = () => {
    this.setState({ loading: true })
  }

  stopLoading = () => {
    this.setState({ loading: false })
  }

  addressClicked = () => {
    this.setState({ modalOpen: true })
  }

  closeModal = () => {
    this.setState({ modalOpen: false })
  }

  renderModal = () => {
    return (
      <UnlockModal closeModal={ this.closeModal } modalOpen={ this.state.modalOpen } />
    )
  }

  renderSnackbar = () => {
    var {
      snackbarType,
      snackbarMessage
    } = this.state
    return <Snackbar type={ snackbarType } message={ snackbarMessage } open={true}/>
  };
}

export default withRouter(withStyles(styles)(Delegate));
