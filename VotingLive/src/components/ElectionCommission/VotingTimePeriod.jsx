import { useRef } from "react";
import { useWeb3Context } from "../../../context/useWeb3Context";
import { toast } from "react-hot-toast";
import { triggerVotingStatusUpdate } from "../../../utils/votingStatusUpdater";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";

const VotingTimePeriod = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const startTimeRef = useRef();
  const endTimeRef = useRef();

  const setTimePeriod = async (e) => {
    e.preventDefault();
    try {
      const startTimeSeconds = parseInt(startTimeRef.current.value);
      const endTimeSeconds = parseInt(endTimeRef.current.value);
      
      if (!contractInstance) throw new Error("Contract not found");
      
      try {
        const tx = await contractInstance.setVotingPeriod(startTimeSeconds, endTimeSeconds);
        await tx.wait();
        
        // Store timestamps in localStorage for retrieval
        localStorage.setItem('votingStartTime', startTimeSeconds.toString());
        localStorage.setItem('votingEndTime', endTimeSeconds.toString());
        
        toast.success("Voting time period set successfully");
        triggerVotingStatusUpdate(); // Trigger global update
        startTimeRef.current.value = "";
        endTimeRef.current.value = "";
      } catch (error) {
        toast.error("Error setting voting time period");
        console.error(error);
      }
    } catch (error) {
      toast.error("Error setting voting time period");
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Set Voting Period</CardTitle>
        <CardDescription>
          Configure the start delay and voting duration in seconds. End time must be &gt; 3600s.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={setTimePeriod} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Delay (seconds from now)</Label>
            <Input id="startTime" type="number" ref={startTimeRef} placeholder="e.g. 0 for immediately" required min="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">Voting Duration (seconds)</Label>
            <Input id="endTime" type="number" ref={endTimeRef} placeholder="e.g. 7200 (2 hours)" required min="3601" />
          </div>
          <Button type="submit" className="w-full">
            Set Time Period
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default VotingTimePeriod;