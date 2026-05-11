import { useState } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

const EmergencyDeclare = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [isLoading, setIsLoading] = useState(false);

  const declareEmergency = async (e) => {
    try {
      e.preventDefault();
      setIsLoading(true);
      const tx = await contractInstance.emergencyStopVoting();
      await tx.wait();
      toast.success("Emergency declared successfully");
    } catch (error) {
      toast.error("Error: Emergency declare");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-destructive/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl text-destructive">Emergency Stop</CardTitle>
        <CardDescription>
          Immediately halt the voting process in case of an emergency. This action is irreversible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={declareEmergency} 
          variant="destructive" 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Stopping..." : "Declare Emergency"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmergencyDeclare;