import { useRef, useState } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

const CastVote = () => {
  const voterIdRef = useRef(null);
  const candidateIdRef = useRef(null);
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [isVoting, setIsVoting] = useState(false);

  const castVote = async (e) => {
    e.preventDefault();
    try {
      setIsVoting(true);
      const voterId = parseInt(voterIdRef.current.value);
      const candidateId = parseInt(candidateIdRef.current.value);
      
      const tx = await contractInstance.castVote(voterId, candidateId);
      await tx.wait();
      
      toast.success("Vote cast successfully!");
      voterIdRef.current.value = "";
      candidateIdRef.current.value = "";
    } catch (error) {
      toast.error("Error: Casting Vote");
      console.error(error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="w-full flex justify-center py-4">
      <Card className="w-full max-w-md shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl text-blue-600">Cast Your Vote</CardTitle>
        <CardDescription>
          Enter your Voter ID and the Candidate ID you wish to vote for. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={castVote} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voterId">Voter ID</Label>
            <Input 
              id="voterId" 
              type="number" 
              ref={voterIdRef} 
              placeholder="e.g. 1" 
              required 
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="candidateId">Candidate ID</Label>
            <Input 
              id="candidateId" 
              type="number" 
              ref={candidateIdRef} 
              placeholder="e.g. 1" 
              required 
              min="1"
            />
          </div>
          <Button type="submit" disabled={isVoting} className="w-full">
            {isVoting ? "Voting..." : "Submit Vote"}
          </Button>
        </form>
      </CardContent>
    </Card>
    </div>
  );
};

export default CastVote;