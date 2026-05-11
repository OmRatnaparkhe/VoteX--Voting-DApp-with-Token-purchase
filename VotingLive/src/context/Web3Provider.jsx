import { useEffect, useState } from 'react';
import Web3Context from './Web3Context';
import { getWeb3State, restoreWeb3State } from '../utils/getWeb3State';
import { handleAccountChange } from '../utils/handleAccountChange';
import { handleChainChange } from '../utils/handleChainChange';
import { toast } from "react-hot-toast";

const Web3Provider = ({ children }) => {
    const [web3State, setWeb3State] = useState({
        contractInstance: null,
        selectedAccount: null,
        chainId: null,
        signer: null,
        provider: null
    });
    
    const handleWallet = async () => {
        try {
            const { contractInstance, selectedAccount, chainId, signer, provider } = await getWeb3State();
            setWeb3State({
                contractInstance,
                selectedAccount,
                chainId,
                signer,
                provider
            });
        }
        catch (error) {
            toast.error("Error: Fetching wallet details");
            console.error(error);
        }
    }

    useEffect(() => {
        const autoConnect = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                const restoredState = await restoreWeb3State();
                if (restoredState) {
                    setWeb3State(restoredState);
                }
            }
        };
        autoConnect();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', () => handleAccountChange(setWeb3State));
            window.ethereum.on('chainChanged', () => handleChainChange(setWeb3State));

            return () => {
                window.ethereum.removeListener('accountsChanged', () => handleAccountChange(setWeb3State));
                window.ethereum.removeListener('chainChanged', () => handleChainChange(setWeb3State));
            }
        }
    }, []);

    return (
        <Web3Context.Provider value={{web3State, setWeb3State, handleWallet}}>
            {children}
        </Web3Context.Provider>
    )
}

export default Web3Provider;