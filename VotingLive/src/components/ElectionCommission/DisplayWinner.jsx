import { useEffect, useState } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const DisplayWinner = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [winnerCandidate, setWinnerCandidate] = useState("No winner announced yet");

  useEffect(() => {
    const fetchWinner = async () => {
      try {
        const winningCandidate = await contractInstance.winner();
        if (winningCandidate !== "0x0000000000000000000000000000000000000000") {
          setWinnerCandidate(winningCandidate);
        }
      } catch (error) {
        toast.error("Error: Displaying Winner");
        console.error(error);
      }
    };

    if (contractInstance) {
      fetchWinner();
    }
  }, [contractInstance]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Winner</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md bg-slate-50 p-4 border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Winning Candidate Address:</p>
          <p className="font-mono text-sm break-all text-slate-900">
            {winnerCandidate}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DisplayWinner;