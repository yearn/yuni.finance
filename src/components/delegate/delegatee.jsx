import React, { Component } from "react";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  TextField,
  Button
} from '@material-ui/core';

import {
  ERROR,
  DELEGATE,
  DELEGATE_RETURNED,
  SIGN_DELEGATE,
  SIGN_DELEGATE_RETURNED,
  SAVE_DELEGATE,
  SAVE_DELEGATE_RETURNED
} from '../../constants'

import { colors } from '../../theme'
import config from '../../config'

import Store from "../../stores";
const emitter = Store.emitter
const dispatcher = Store.dispatcher
const store = Store.store

const styles = theme => ({
  delegateContainer: {
    borderRadius: '30px',
    padding: '24px',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    boxShadow: 'rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px',
    maxWidth: '500px'
  },
  delegateeInfo: {
    display: 'flex'
  },
  twitterLink: {
    cursor: 'pointer',
    color: 'rgba(43,57,84,.5)'
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
  },
  icon: {
    borderRadius: '25px',
  },
  action: {
    width: '100%',
    marginTop: '24px'
  },
  uniButton: {
    padding: '18px',
    borderRadius: '12px',
    outline: 'none',
    border: '1px solid transparent',
    display: 'flex',
    '-webkit-box-pack': 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    '-webkit-box-align': 'center',
    alignItems: 'center',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 1,
  },
  buttonText: {
    color: 'white',
    fontWeight: 500,
    fontSize: '20px'
  },
  description: {
    paddingTop: '24px'
  },
  pumpBar: {
    position: 'relative',
    marginTop: '60px',
    marginBottom: '44px',
    width: '100%',
    height: '10px',
    background: colors.uniPinklight
  },
  firstGoal: {
    position: 'absolute',
    left: '25%',
    borderRight: '1px solid '+colors.text,
    height: '100%'
  },
  firstGoalText: {
    position: 'absolute',
    top: '-12px',
    left: '25%',
    transform: 'translateX(-50%) translateY(-50%)'
  },
  secondGoal: {
    position: 'absolute',
    left: '100%',
    borderRight: '1px solid '+colors.text,
    height: '100%'
  },
  secondGoalText: {
    position: 'absolute',
    top: '-20px',
    right: '0',
  },
  totalDelegations: {
    background: colors.uniPink,
    height: '100%',
  },
  percentText: {
    position: 'absolute',
    top: '12px',
    left: '50%',
    transform: 'translateX(-50%) translateY(0%)'
  },
  goals: {
    padding: '6px 0px',
    display: 'flex'
  },
  goalNumber: {
    minWidth: '150px'
  }
});

class Delegatee extends Component {

  constructor() {
    super()

    this.state = {
      account: store.getStore('account'),
      signature: null,
      loading: false
    }
  }

  componentWillMount() {
    emitter.on(SIGN_DELEGATE_RETURNED, this.signReturned);
    emitter.on(SAVE_DELEGATE_RETURNED, this.saveReturned);
    emitter.on(DELEGATE_RETURNED, this.delegateRetrurned);
    emitter.on(ERROR, this.errorReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(SIGN_DELEGATE_RETURNED, this.signReturned);
    emitter.removeListener(SAVE_DELEGATE_RETURNED, this.saveReturned);
    emitter.removeListener(DELEGATE_RETURNED, this.delegateRetrurned);
    emitter.removeListener(ERROR, this.errorReturned);
  };

  delegateRetrurned = () => {
    this.setState({ loading: false })
    this.props.stopLoading()
  };

  signReturned = () => {
    this.setState({ loading: false })
    this.props.stopLoading()
  };

  saveReturned = (txHash) => {
    this.setState({ loading: false })
    this.props.stopLoading()
  };

  errorReturned = (error) => {
    this.setState({ loading: false })
    this.props.stopLoading()
  };

  render() {
    const { classes, delegatee, uniBalances } = this.props;
    const { loading, signature } = this.state

    const percent = delegatee.totalDelegated/24000000

    let alreadyDelegated = false
    if( uniBalances.delegatedAddress && uniBalances.delegatedAddress.toLowerCase() === delegatee.address.toLowerCase() ) {
      alreadyDelegated = true
    }

    return (
      <div className={ classes.delegateContainer }>
        <div className={ classes.delegateeInfo }>
          <div className={ classes.iconContainer }>
            <img
              className={ classes.icon }
              alt="Logo"
              src={ require('../../assets/delegatees/'+delegatee.logo) }
              height={ '50px' }
            />
          </div>
          <div>
            <Typography variant='h3'>{ delegatee.name } '{ delegatee.moto }' { delegatee.surname }</Typography>
            <Typography variant='h4' className={ classes.twitterLink } onClick={ () => { window.open(delegatee.twitter, '_blank')  }} >{ delegatee.twitter }</Typography>
          </div>
        </div>
        <div className={ classes.description }>
          <div className={ classes.goals }>
            <Typography variant='h5' className={ classes.goalNumber}>1st Goal: 10M UNI -</Typography>
            <Typography variant='h5'>The first goal at 10M UNI is to give { delegatee.name } the ability to create votes.</Typography>
          </div>
          <div className={ classes.goals }>
            <Typography variant='h5' className={ classes.goalNumber}>2nd Goal: 40M UNI -</Typography>
            <Typography variant='h5'>The second goal at 40M UNI is so that { delegatee.name } can reach quorum on the votes that he proposes.</Typography>
          </div>
        </div>
        <div className={ classes.pumpBar }>
          <div className={ classes.firstGoal }></div>
          <div className={ classes.secondGoal }></div>
          <Typography className={ classes.firstGoalText } variant={'h5'}>1st goal</Typography>
          <Typography className={ classes.secondGoalText } variant={'h5'}>2nd Goal</Typography>
          <div className={ classes.totalDelegations } style={{ width: percent+'%' }}></div>
          <Typography className={ classes.percentText } variant={'h5'}> Total Delegated: { this._printNumber(delegatee.totalDelegated) } UNI - { percent.toFixed(0) }%</Typography>
        </div>
        <div className={ classes.description }>
          { alreadyDelegated && <Typography variant={ 'h5'} >You have already delegated to { delegatee.name }. Thanks for showing your support!</Typography> }
          { !alreadyDelegated && <Typography variant='h5'>You can delegate to { delegatee.name } { delegatee.surname } on-chain. By clicking the button below, you will be calling the uniswap contract found <a href={ 'https://etherscan.io/address/'+config.uniswapContractAddress+'#writeContract' } target='_blank'>here</a> delegate() function. This will delegate your UNI to { delegatee.name }'s <a href={'https://etherscan.io/address/'+delegatee.address} target='_blank'>address</a>.</Typography> }
        </div>
        <div className={ classes.action }>
          { !alreadyDelegated &&
            <Button
              disabled={ loading || alreadyDelegated }
              onClick={ this.onDelegate }
              fullWidth
              className={ classes.uniButton }
              variant='contained'
              color='primary'>
              <Typography className={ classes.buttonText } variant={ 'h5'} >Delegate to { delegatee.name }</Typography>
            </Button>
          }
        </div>
      </div>
    )
  };

  _printNumber = (labelValue) => {
    return Math.abs(Number(labelValue)) >= 1.0e+9
    ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(1) + "B"
    : Math.abs(Number(labelValue)) >= 1.0e+6
    ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(1) + "M"
    : Math.abs(Number(labelValue)) >= 1.0e+3
    ? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(1) + "K"
    : Math.abs(Number(labelValue));
  }

  onChange = (event) => {
    let val = []
    val[event.target.id] = event.target.value
    this.setState(val)
  }

  onDelegate = () => {
    const { delegatee, startLoading } = this.props

    this.setState({ loading: true })
    startLoading()

    dispatcher.dispatch({ type: DELEGATE, content: { delegatee } })
  }

  onSign = () => {
    const { delegatee, startLoading } = this.props

    this.setState({ loading: true })
    startLoading()

    dispatcher.dispatch({ type: SIGN_DELEGATE, content: { delegatee } })
  }

  onSave = () => {
    const { delegatee, startLoading  } = this.props

    this.setState({ loading: true })
    startLoading()

    dispatcher.dispatch({ type: SAVE_DELEGATE, content: { delegatee } })
  }
}

export default withStyles(styles, { withTheme: true })(Delegatee);
