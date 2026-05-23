import { useState, useEffect } from "react";
import { useWeb3Context } from "@/context/useWeb3Context";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/config/constants";
import { CheckCircle2, User, Users, AlertCircle, Loader2, Timer, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CastVote = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance, selectedAccount } = web3State;
  
  const [candidateList, setCandidateList] = useState([]);
  const [voterInfo, setVoterInfo] = useState(null);
  const [votingStatus, setVotingStatus] = useState(null); // 0: NotStarted, 1: InProgress, 2: Ended
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (contractInstance && selectedAccount) {
          // Fetch Voting Status
          const status = await contractInstance.getVotingStatus();
          setVotingStatus(Number(status));

          // Fetch Candidate List
          const candidates = await contractInstance.getCandidateList();
          setCandidateList(candidates);

          // Fetch Voter List and find current user
          const voters = await contractInstance.getVoterList();
          const currentUserVoter = voters.find(
            (v) => v.voterAddress.toLowerCase() === selectedAccount.toLowerCase()
          );

          if (currentUserVoter) {
            setVoterInfo({
              id: Number(currentUserVoter.voterId),
              name: currentUserVoter.name,
              votedCandidateId: Number(currentUserVoter.voteCandidateId),
              isRegistered: true
            });
          } else {
            setVoterInfo({ isRegistered: false });
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load voting data. Please ensure you are connected to the correct network.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contractInstance, selectedAccount]);

  const handleVote = async () => {
    if (votingStatus !== 1) {
      toast.error("Voting is not currently active");
      return;
    }

    if (!selectedCandidateId) {
      toast.error("Please select a candidate first");
      return;
    }

    if (!voterInfo || !voterInfo.isRegistered) {
      toast.error("You must be registered as a voter to cast a vote");
      return;
    }

    try {
      setIsVoting(true);
      const tx = await contractInstance.castVote(voterInfo.id, selectedCandidateId);
      toast.loading("Processing your vote on the blockchain...", { id: "vote-tx" });
      await tx.wait();
      
      toast.success("Vote cast successfully!", { id: "vote-tx" });
      
      // Update local state to reflect the vote
      setVoterInfo(prev => ({ ...prev, votedCandidateId: selectedCandidateId }));
      
    } catch (error) {
      toast.error(error.reason || "Error: Casting Vote", { id: "vote-tx" });
      console.error(error);
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium">Preparing your ballot...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-red-700 font-medium">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!voterInfo?.isRegistered) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="text-center p-8 space-y-6">
          <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <User className="h-10 w-10 text-amber-600" />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">Not Registered</CardTitle>
            <CardDescription className="text-lg">
              You need to register as a voter before you can cast a vote.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button size="lg" onClick={() => window.location.href = "/register-voter"}>
              Go to Registration
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const hasAlreadyVoted = voterInfo.votedCandidateId !== 0;

  // Status-based content
  if (votingStatus === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="text-center p-8 space-y-6 border-blue-100 bg-blue-50/30">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Timer className="h-10 w-10 text-blue-600" />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">Election Not Started</CardTitle>
            <CardDescription className="text-lg text-slate-600">
              The Election Commission hasn't opened the polls yet. Please check back later when voting begins.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>Refresh Status</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (votingStatus === 2 && !hasAlreadyVoted) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="text-center p-8 space-y-6 border-slate-200 bg-slate-50">
          <div className="bg-slate-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Lock className="h-10 w-10 text-slate-500" />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">Election Ended</CardTitle>
            <CardDescription className="text-lg text-slate-600">
              The voting period has concluded. Submissions are no longer being accepted for this election.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="secondary" onClick={() => window.location.href = "/candidate-list"}>View Results</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">● LIVE</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Cast Your Vote</h1>
          </div>
          <p className="text-lg text-slate-500">Select your preferred candidate and secure your voice on the blockchain.</p>
        </div>
        
        <Card className="bg-blue-50 border-blue-100 min-w-[240px]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <User size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Voter Profile</p>
              <p className="font-bold text-slate-900">{voterInfo.name}</p>
              <p className="text-xs text-slate-500">ID: #{voterInfo.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {hasAlreadyVoted ? (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-8 text-center space-y-4">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-green-900">Vote Recorded Successfully</h2>
              <p className="text-green-700">
                You have already cast your vote for Candidate ID #{voterInfo.votedCandidateId}. 
                Your choice is permanent and immutable on the blockchain.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <Users size={20} />
            <h2>Choose a Candidate ({candidateList.length})</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidateList.map((candidate) => {
              const cId = Number(candidate.candidateId);
              const isSelected = selectedCandidateId === cId;
              
              return (
                <Card 
                  key={cId}
                  className={`relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg border-2 ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200'
                  }`}
                  onClick={() => setSelectedCandidateId(cId)}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="bg-blue-600 text-white rounded-full p-1">
                        <CheckCircle2 size={16} />
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="p-0">
                    <div className="h-48 w-full bg-slate-100 relative">
                      <img
                        src={`${API_URL}/getCandidateImage/${candidate.candidateAddress}`}
                        alt={candidate.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/400x400/6366f1/ffffff?text=" + encodeURIComponent(candidate.name);
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <Badge className="bg-blue-600 border-none">ID: #{cId}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-5 space-y-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{candidate.name}</h3>
                      <p className="text-sm font-semibold text-blue-600">{candidate.party}</p>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500 pt-2 border-t">
                      <span>Age: {Number(candidate.age)}</span>
                      <span>Votes: {Number(candidate.votes)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {candidateList.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <p className="text-slate-500">No candidates have registered for this election yet.</p>
            </div>
          )}

          <div className="flex justify-center pt-8">
            <Button 
              size="lg" 
              className="px-12 py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
              disabled={!selectedCandidateId || isVoting}
              onClick={handleVote}
            >
              {isVoting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" /> Casting Vote...
                </span>
              ) : (
                "Confirm & Cast Vote"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CastVote;