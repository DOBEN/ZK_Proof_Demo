import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "./styles.scss";
import { WalletProvider } from "./wallet-connection";
import Home from "./components/Home";
import ConnectWallet from "./components/connect-wallet/ConnectWallet";
import Proof from "./components/proof/Proof";
import FinalPage from "./components/finalPage/FinalPage";
import DevExample from "./components/devExample/DevExample";

export const App = () => {
  const [provider, setProvider] = useState<WalletProvider>();
  const [connectedAccount, setConnectedAccount] = useState<string>();

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

    provider?.on("accountChanged", handleAccountChange);

    return () => {
      provider?.off("accountChanged", handleAccountChange);
    };
  }, [provider]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/connectWallet" element={<ConnectWallet />} />
        <Route path="/proof" element={<Proof />} />
        <Route path="/devExample" element={<DevExample />} />
        <Route path="/finalPage" element={<FinalPage />} />
      </Routes>
    </Router>
  );
};
