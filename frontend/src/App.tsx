import { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';
import { ConcordiumGRPCClient } from '@concordium/web-sdk';

import './styles.scss';
import { WalletProvider } from './wallet-connection';
import Home from './components/Home';
import ConnectWallet from './components/connect-wallet/ConnectWallet';
import Proof from './components/proof/Proof';
import Submission from './components/submission/Submission';

export const App = () => {
    const [showLogo, setShowLogo] = useState(true);
    const [provider, setProvider] = useState<WalletProvider>();
    const [connectedAccount, setConnectedAccount] = useState<string>();

    const grpcClient = useRef(new ConcordiumGRPCClient(new GrpcWebFetchTransport({ baseUrl: CONFIG.node }))).current;

    useEffect(() => {
        if (provider) {
            return () => {
                provider?.disconnect?.().then(() => provider.removeAllListeners());
            };
        }
    }, [provider]);

    useEffect(() => {
        const handleAccountChange = (newAccount: string | undefined) => {
            setConnectedAccount(newAccount);
        };

        provider?.on('accountChanged', handleAccountChange);

        return () => {
            provider?.off('accountChanged', handleAccountChange);
        };
    }, [provider]);

    const connectProvider = async (provider: WalletProvider) => {
        const account = await provider.connect();
        if (account) {
            setConnectedAccount(account);
        }
        setProvider(provider);
    };


    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLogo(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={<Home />}
                />
                <Route
                    path="/connectWallet"
                    element={<ConnectWallet />}
                />
                <Route
                    path="/proof"
                    element={<Proof />}
                />
                <Route
                    path="/submission"
                    element={<Submission />}
                />

            </Routes>
        </Router>
    );
};
