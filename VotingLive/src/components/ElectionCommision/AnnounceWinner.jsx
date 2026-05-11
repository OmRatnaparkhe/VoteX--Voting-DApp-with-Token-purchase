import { useState } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

const AnnounceWinner = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [isLoading, setIsLoading] = useState(false);

  const fetchWinner = async () => {
    try {
      setIsLoading(true);
      const tx = await contractInstance.announceVotingResult();
      await tx.wait();
      toast.success("Winner announced successfully");
    } catch (error) {
      toast.error("Error: Announcing result");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Announce Winner</CardTitle>
        <CardDescription>
          Calculate the votes and declare the winner of the election. This can only be done after the voting period has ended.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={fetchWinner} disabled={isLoading} className="w-full">
          {isLoading ? "Announcing..." : "Announce Winner"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnnounceWinner;