import { useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

const BuyToken = ({ contractInstance, tokenPrice, marketplaceBalance }) => {
  const noTokensAvailable = parseFloat(marketplaceBalance) < 1;
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const buyToken = async (e) => {
    try {
      e.preventDefault();
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }
      if (noTokensAvailable) {
        toast.error("Marketplace has no tokens available");
        return;
      }
      setIsLoading(true);
      
      const tokenAmountWei = ethers.parseUnits(amount.toString(), 18);
      const pricePerTokenWei = ethers.parseEther(tokenPrice.toString());
      const totalValueWei = (tokenAmountWei * pricePerTokenWei) / BigInt(10 ** 18);

      const tx = await contractInstance.buyGLDToken(tokenAmountWei, { 
        value: totalValueWei,
      });
      await tx.wait();
      toast.success("Tokens purchased successfully");
      setAmount("");
    } catch (error) {
      toast.error("Error: Buy Token");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = (parseFloat(amount) || 0) * parseFloat(tokenPrice);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Buy GLD Tokens</CardTitle>
        <CardDescription>
          {noTokensAvailable
            ? "⚠️ Marketplace is out of stock. Contact the administrator to fund it."
            : `Purchase GLD tokens by paying ETH. Current price: ${tokenPrice} ETH/GLD`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={buyToken} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="buyAmount">Amount of Tokens to Buy</Label>
            <Input
              id="buyAmount"
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 10"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading || noTokensAvailable} className="w-full">
            {isLoading ? "Purchasing..." : `Buy Tokens (${totalPrice.toFixed(4)} ETH)`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BuyToken;