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
    maxWidth: '500px',
    [theme.breakpoints.down('sm')]: {
      margin: '0px 6px'
    }
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
    transform: 'translateX(-50%) translateY(0%)',
    width: 'fit-content'
  },
  goals: {
    padding: '6px 0px',
    display: 'flex'
  },
  goalNumber: {
    minWidth: '150px'
  },
  json: {
    width: '100%',
    marginTop: '40px',
  }
});

class Delegatee extends Component {

  constructor() {
    super()

    this.state = {
      account: store.getStore('account'),
      loading: false,
      signatureResponse: null
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

  signReturned = (res) => {
    this.setState({ loading: false, signatureResponse: res })
    this.props.stopLoading()
  };

  saveReturned = (txHash) => {
    this.setState({ loading: false, signatureResponse: null })
    this.props.stopLoading()
  };

  errorReturned = (error) => {
    this.setState({ loading: false })
    this.props.stopLoading()
  };

  render() {
    const { classes, delegatee, uniBalances, account, addressClicked } = this.props;
    const { loading, signatureResponse } = this.state

    const percent = delegatee.totalDelegated/400000

    let alreadyDelegated = false
    if( uniBalances.delegatedAddress && uniBalances.delegatedAddress.toLowerCase() === delegatee.address.toLowerCase() ) {
      alreadyDelegated = true
    }

    return (
      <div className={ classes.delegateContainer }>
        <div className={ classes.delegateeInfo }>
          <div>
            <Typography variant='h3'>{ delegatee.name } { delegatee.surname }</Typography>
          </div>
        </div>
        <div className={ classes.description }>
          <div className={ classes.goals }>
            <Typography variant='h5' className={ classes.goalNumber}>1st Goal: 10M UNI -</Typography>
            <Typography variant='h5'>The first goal at 10M UNI is to give { delegatee.name } the ability to create votes.</Typography>
          </div>
          <div className={ classes.goals }>
            <Typography variant='h5' className={ classes.goalNumber}>2nd Goal: 40M UNI -</Typography>
            <Typography variant='h5'>The second goal at 40M UNI is so that { delegatee.name } can reach quorum on the votes that they proposes.</Typography>
          </div>
        </div>
        <div className={ classes.pumpBar }>
          <div className={ classes.firstGoal }></div>
          <div className={ classes.secondGoal }></div>
          <Typography className={ classes.firstGoalText } variant={'h5'}>1st goal</Typography>
          <Typography className={ classes.secondGoalText } variant={'h5'}>2nd Goal</Typography>
          <div className={ classes.totalDelegations } style={{ width: percent+'%' }}></div>
          <Typography className={ classes.percentText } variant={'h5'}>Delegated: { this._printNumber(delegatee.totalDelegated) } UNI - { percent.toFixed(0) }%</Typography>
        </div>
        <div className={ classes.description }>
          { alreadyDelegated && <Typography variant={ 'h5'} >You have already delegated to { delegatee.name }. Thanks for showing your support!</Typography> }
          { !alreadyDelegated && <Typography variant='h5'>You can delegate to { delegatee.name } { delegatee.surname } on-chain. By clicking the button below, you will be calling the uniswap contract found <a href={ 'https://etherscan.io/address/'+config.uniswapContractAddress+'#writeContract' } target='_blank' rel='noopener noreferrer'>here</a> delegate() function. This will delegate your UNI to { delegatee.name }'s <a href={'https://etherscan.io/address/'+delegatee.address} target='_blank'  rel='noopener noreferrer'>address</a>.</Typography> }
        </div>
        <div className={ classes.action }>
          { (!account || !account.address) &&
            <Button
              disabled={ loading }
              onClick={ addressClicked }
              fullWidth
              className={ classes.uniButton }
              variant='contained'
              color='primary'>
              <Typography className={ classes.buttonText } variant={ 'h5'} >Connect wallet</Typography>
            </Button>
          }
          { !(!account || !account.address) && !alreadyDelegated &&
            <Button
              disabled={ loading }
              onClick={ this.onDelegate }
              fullWidth
              className={ classes.uniButton }
              variant='contained'
              color='primary'>
              <Typography className={ classes.buttonText } variant={ 'h5'} >Delegate to { delegatee.name }</Typography>
            </Button>
          }
        </div>
        { (!alreadyDelegated && !signatureResponse) &&
          <React.Fragment>
            <div className={ classes.description }>
              <Typography variant='h5'>If you don't want to spend the gas fees, { delegatee.name } will submit the transaction on-chain on your behalf. By clicking the button below, you will be signing the transaction on the uniswap contract found <a href={ 'https://etherscan.io/address/'+config.uniswapContractAddress+'#writeContract' } target='_blank' rel='noopener noreferrer'>here</a> delegateBySig(). This will be sent to { delegatee.name } to submit on your behalf.</Typography>
            </div>
            <div className={ classes.action }>
              { (!account || !account.address) &&
                <Button
                  disabled={ loading }
                  onClick={ addressClicked }
                  fullWidth
                  className={ classes.uniButton }
                  variant='contained'
                  color='primary'>
                  <Typography className={ classes.buttonText } variant={ 'h5'} >Connect wallet</Typography>
                </Button>
              }
              { !(!account || !account.address) &&
                <Button
                  disabled={ loading }
                  onClick={ this.onSign }
                  fullWidth
                  className={ classes.uniButton }
                  variant='contained'
                  color='primary'>
                  <Typography className={ classes.buttonText } variant={ 'h5'} >Sign delegateBySig transaction</Typography>
                </Button>
              }
            </div>
          </React.Fragment>
        }
        { signatureResponse &&
          <TextField
            className={ classes.json }
            id="outlined-textarea"
            multiline
            variant="outlined"
            fullWidth
            value={ JSON.stringify(signatureResponse, null, 2) }
          />
        }
        { (!alreadyDelegated && signatureResponse) &&
          <React.Fragment>
            <div className={ classes.action }>
              <Button
                disabled={ loading }
                onClick={ this.onSave }
                fullWidth
                className={ classes.uniButton }
                variant='contained'
                color='primary'>
                <Typography className={ classes.buttonText } variant={ 'h5'} >Send signature to { delegatee.name }</Typography>
              </Button>
            </div>
          </React.Fragment>
        }
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
    const { delegatee, startLoading } = this.props
    const { signatureResponse } = this.state

    this.setState({ loading: true })
    startLoading()

    dispatcher.dispatch({ type: SAVE_DELEGATE, content: { delegatee, signature: signatureResponse } })
  }
}

export default withStyles(styles, { withTheme: true })(Delegatee);
