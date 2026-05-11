import { useEffect, useState } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

const VotingStatus = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [votingStatus, setVotingStatus] = useState(null);

  const statusMap = {
    0: "Not Started",
    1: "In Progress",
    2: "Ended",
  };

  useEffect(() => {
    const fetchVotingStatus = async () => {
      try {
        const status = await contractInstance.getVotingStatus();
        setVotingStatus(statusMap[status] ?? "Unknown status");
      } catch (error) {
        toast.error("Error: Fetching Voting status");
        console.error(error);
      }
    };

    if (contractInstance) {
      fetchVotingStatus();
    }
  }, [contractInstance]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Voting Status</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center space-x-4">
        <span className="text-sm text-slate-500">Current Phase:</span>
        {votingStatus ? (
          <Badge
            variant={
              votingStatus === "In Progress"
                ? "default"
                : votingStatus === "Ended"
                ? "destructive"
                : "secondary"
            }
            className="text-sm px-3 py-1"
          >
            {votingStatus}
          </Badge>
        ) : (
          <span className="text-sm font-medium">Loading...</span>
        )}
      </CardContent>
    </Card>
  );
};

export default VotingStatus;