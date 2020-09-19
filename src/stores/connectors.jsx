import { InjectedConnector } from "@web3-react/injected-connector";
import config from '../config'

const POLLING_INTERVAL = 12000;
const RPC_URLS = {
  1: config.infuraProvider
};

export const injected = new InjectedConnector({
  supportedChainIds: [1]
});
