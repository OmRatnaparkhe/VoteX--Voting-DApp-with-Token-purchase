import { ethers } from 'ethers';
import VotingAbi from '../constant/VotingAbi.json';
import axios from 'axios';
import { API_URL } from "../config/constants";

const contractAddress = "0x3518289db012C04C0b945Cc3F187baC4Ad0D31af";

export const getWeb3State = async () => {
    try {
        if (!window.ethereum) {
            throw new Error("MetaMask is not installed");
        }

        const accounts = await window.ethereum.request({ method:'eth_requestAccounts' });
        const selectedAccount = accounts[0];

        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        const chainId = parseInt(chainIdHex, 16);

        const provider  = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const message = "Welcome to the Voting DApp! Please sign this message to connect your wallet.";
        const signature = await signer.signMessage(message);
        const dataSignature = { signature };
        const res = await axios.post(`${API_URL}/authentication?accountAddress=${selectedAccount}`, dataSignature);
        localStorage.setItem("token", res.data.token);
        const contractInstance = new ethers.Contract(contractAddress, VotingAbi, signer);
        return {contractInstance, selectedAccount, chainId, signer, provider};
    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

export const restoreWeb3State = async () => {
    try {
        if (!window.ethereum) return null;
        
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length === 0) return null;

        const selectedAccount = accounts[0];
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        const chainId = parseInt(chainIdHex, 16);

        const provider  = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, VotingAbi, signer);
        
        return {contractInstance, selectedAccount, chainId, signer, provider};
    } catch (error) {
        console.error("Restore connection failed:", error);
        return null;
    }
}