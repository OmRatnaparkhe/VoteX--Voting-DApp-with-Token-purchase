import { useWeb3Context } from "@/context/useWeb3Context";
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";

import BuyToken from "@/components/TokenMarketplace/BuyToken";
import SellToken from "@/components/TokenMarketplace/SellToken";
import TokenBalance from "@/components/TokenMarketplace/TokenBalance";
import TokenPrice from "@/components/TokenMarketplace/TokenPrice";
import DepositTokens from "@/components/TokenMarketplace/DepositTokens";

import tokenMarketplaceAbi from "@/constant/TokenMarketplaceAbi.json";
import erc20Abi from "@/constant/Erc20Abi.json";

import { toast } from "react-hot-toast";

const TokenMarketplace = () => {
  const [tokenMarketplaceInstance, setTokenMarketplaceInstance] = useState(null);
  const [erc20ContractInstance, setErc20ContractInstance] = useState(null);
  const [erc20SignerInstance, setErc20SignerInstance] = useState(null);
  const [tokenPrice, setTokenPrice] = useState("0");
  const [marketplaceBalance, setMarketplaceBalance] = useState("0");
  const [ownerBalance, setOwnerBalance] = useState("0");
  const [marketplaceOwner, setMarketplaceOwner] = useState(null);
  const { web3State } = useWeb3Context();
  const { signer, provider, selectedAccount } = web3State;

  const MARKETPLACE_ADDRESS = "0x8E3d618A91E02414b1111F6780F1eE372390815a";
  const TOKEN_ADDRESS = "0xFc511329C26b012E79c6Ea059d43F4d245E2340A";

  // ERC20 with provider (read-only, for balances)
  useEffect(() => {
    if (!provider) return;
    try {
      const instance = new ethers.Contract(TOKEN_ADDRESS, erc20Abi, provider);
      setErc20ContractInstance(instance);
    } catch (error) {
      toast.error("Error initialising token contract");
    }
  }, [provider]);

  // ERC20 with signer (write-capable, for owner deposit)
  useEffect(() => {
    if (!signer) return;
    try {
      const instance = new ethers.Contract(TOKEN_ADDRESS, erc20Abi, signer);
      setErc20SignerInstance(instance);
    } catch (error) {
      console.error("Error creating signed ERC20 instance:", error);
    }
  }, [signer]);

  // Marketplace contract (with signer)
  useEffect(() => {
    if (!signer) return;
    try {
      const instance = new ethers.Contract(MARKETPLACE_ADDRESS, tokenMarketplaceAbi, signer);
      setTokenMarketplaceInstance(instance);
    } catch (error) {
      toast.error("Error: Token Marketplace");
      console.error(error);
    }
  }, [signer]);

  const fetchMarketplaceData = useCallback(async () => {
    try {
      if (tokenMarketplaceInstance) {
        const [price, owner] = await Promise.all([
          tokenMarketplaceInstance.tokenPrice(),
          tokenMarketplaceInstance.owner(),
        ]);
        setTokenPrice(ethers.formatEther(price));
        setMarketplaceOwner(owner.toLowerCase());
      }
      if (erc20ContractInstance) {
        const [mktBalance, ownerBal] = await Promise.all([
          erc20ContractInstance.balanceOf(MARKETPLACE_ADDRESS),
          selectedAccount ? erc20ContractInstance.balanceOf(selectedAccount) : Promise.resolve(0n),
        ]);
        setMarketplaceBalance(ethers.formatEther(mktBalance));
        setOwnerBalance(ethers.formatEther(ownerBal));
      }
    } catch (error) {
      console.error("Error fetching marketplace data:", error);
    }
  }, [tokenMarketplaceInstance, erc20ContractInstance, selectedAccount]);

  useEffect(() => {
    fetchMarketplaceData();
  }, [fetchMarketplaceData]);

  const isOwner = selectedAccount && marketplaceOwner &&
    selectedAccount.toLowerCase() === marketplaceOwner;

  const isLowOnTokens = parseFloat(marketplaceBalance) < 1;

  return (
    <div className="max-w-4xl mx-auto py-2 flex justify-center flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Token Marketplace
        </h1>
        <p className="text-slate-500 mt-2">
          Buy and sell GLD tokens to participate in the voting process.
        </p>
      </div>

      {isOwner && isLowOnTokens && (
        <div className="mb-6">
          <DepositTokens
            erc20ContractInstance={erc20SignerInstance}
            marketplaceAddress={MARKETPLACE_ADDRESS}
            ownerBalance={ownerBalance}
            onDeposited={fetchMarketplaceData}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TokenBalance erc20ContractInstance={erc20ContractInstance} />
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500 mb-2">Marketplace Supply</h3>
              <p className="text-3xl font-bold text-slate-900">
                {marketplaceBalance}
                <span className="text-sm font-normal text-slate-500"> GLD</span>
              </p>
              {isLowOnTokens && (
                <p className="text-xs text-red-500 mt-1 font-medium">No tokens available to buy</p>
              )}
            </div>
          </div>
          <TokenPrice tokenPrice={tokenPrice} />
        </div>
        <div className="space-y-6">
          <BuyToken contractInstance={tokenMarketplaceInstance} tokenPrice={tokenPrice} marketplaceBalance={marketplaceBalance} />
          <SellToken
            erc20ContractInstance={erc20SignerInstance}
            contractInstance={tokenMarketplaceInstance}
            marketplaceAddress={MARKETPLACE_ADDRESS}
          />
        </div>
      </div>
    </div>
  );
};

export default TokenMarketplace;