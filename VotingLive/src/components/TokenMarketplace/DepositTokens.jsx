import { useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * DepositTokens – Allows the marketplace owner to fund the contract with GLD.
 *
 * Flow:
 *  1. Owner calls erc20.transfer(marketplaceAddress, amount)
 *     This moves tokens from the owner's wallet directly into the marketplace.
 *
 * Why transfer() and not approve() + transferFrom()?
 *  The marketplace contract has no `depositTokens()` function, so we send tokens
 *  directly with a standard ERC-20 transfer.  The marketplace can then send them
 *  to buyers from its own balance.
 */
const DepositTokens = ({ erc20ContractInstance, marketplaceAddress, ownerBalance, onDeposited }) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const depositTokens = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      setIsLoading(true);
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await erc20ContractInstance.connect(erc20ContractInstance.runner).transfer(
        marketplaceAddress,
        amountWei
      );
      await tx.wait();
      toast.success(`${amount} GLD deposited into marketplace`);
      setAmount("");
      if (onDeposited) onDeposited();
    } catch (error) {
      toast.error("Error: Could not deposit tokens");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-amber-300 bg-amber-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <CardTitle className="text-xl text-amber-900">Fund Marketplace (Owner Only)</CardTitle>
        </div>
        <CardDescription className="text-amber-700">
          The marketplace currently has no tokens to sell. Transfer GLD from your wallet into
          the marketplace so buyers can purchase them.
          <span className="block mt-1 font-semibold">Your wallet balance: {ownerBalance} GLD</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={depositTokens} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="depositAmount" className="text-amber-900">Amount of GLD to Deposit</Label>
            <Input
              id="depositAmount"
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500"
              required
              className="border-amber-300 focus:ring-amber-500"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isLoading ? "Depositing..." : `Deposit ${amount || 0} GLD to Marketplace`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DepositTokens;
