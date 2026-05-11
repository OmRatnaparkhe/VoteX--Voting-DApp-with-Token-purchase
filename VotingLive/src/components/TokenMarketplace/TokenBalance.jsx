import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const TokenBalance = ({ erc20ContractInstance }) => {
  const { web3State } = useWeb3Context();
  const { selectedAccount } = web3State;
  const [userTokenBalance, setUserTokenBalance] = useState("0");

  useEffect(() => {
    const fetchTokenBalance = async () => {
      try {
        const tokenBalanceWei = await erc20ContractInstance.balanceOf(selectedAccount);
        const tokenBalanceEth = ethers.formatEther(tokenBalanceWei);
        setUserTokenBalance(tokenBalanceEth);
      } catch (error) {
        toast.error("Error: Fetching token balance");
        console.error(error);
      }
    };

    if (erc20ContractInstance && selectedAccount) {
      fetchTokenBalance();
    }
  }, [erc20ContractInstance, selectedAccount]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Your Token Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900">
          {userTokenBalance} <span className="text-sm font-normal text-slate-500">GLD</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenBalance;