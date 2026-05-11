import { ethers } from "ethers";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

const SellToken = ({ contractInstance, erc20ContractInstance, marketplaceAddress }) => {
  const sellTokenAmountRef = useRef();
  const approveTokenAmountRef = useRef();
  const [isSelling, setIsSelling] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const sellToken = async (e) => {
    try {
      e.preventDefault();
      setIsSelling(true);
      const tokenValueEth = sellTokenAmountRef.current.value;
      const tokenValueWei = ethers.parseEther(tokenValueEth, 18);
      const tx = await contractInstance.sellGLDToken(tokenValueWei);
      await tx.wait();
      toast.success("Tokens sold successfully");
      sellTokenAmountRef.current.value = "";
    } catch (error) {
      toast.error("Error: Selling Token");
      console.error(error);
    } finally {
      setIsSelling(false);
    }
  };

  const approveToken = async (e) => {
    try {
      e.preventDefault();
      setIsApproving(true);
      const tokenValueEth = approveTokenAmountRef.current.value;
      const tokenValueWei = ethers.parseEther(tokenValueEth, 18);
      const tx = await erc20ContractInstance.approve(marketplaceAddress, tokenValueWei);
      await tx.wait();
      toast.success("Tokens approved successfully");
      approveTokenAmountRef.current.value = "";
    } catch (error) {
      toast.error("Error: Approving token");
      console.error(error);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Sell GLD Tokens</CardTitle>
        <CardDescription>
          First approve the marketplace to spend your tokens, then sell them for ETH.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={approveToken} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="approveAmount">Amount to Approve (in ETH format)</Label>
            <Input
              id="approveAmount"
              type="number"
              step="any"
              ref={approveTokenAmountRef}
              placeholder="e.g. 0.1"
              required
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isApproving} className="w-full">
            {isApproving ? "Approving..." : "Approve Token"}
          </Button>
        </form>

        <div className="h-px bg-slate-200 w-full" />

        <form onSubmit={sellToken} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sellAmount">Amount to Sell (in ETH format)</Label>
            <Input
              id="sellAmount"
              type="number"
              step="any"
              ref={sellTokenAmountRef}
              placeholder="e.g. 0.1"
              required
            />
          </div>
          <Button type="submit" disabled={isSelling} className="w-full">
            {isSelling ? "Selling..." : "Sell Token"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SellToken;