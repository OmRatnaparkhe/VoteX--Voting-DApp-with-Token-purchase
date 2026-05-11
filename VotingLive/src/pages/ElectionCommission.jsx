import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3Context } from "../context/useWeb3Context";
import useIsCommissioner from "../hooks/useIsCommissioner";
import { toast } from "react-hot-toast";
import { ethers } from "ethers";
import { triggerVotingStatusUpdate } from "../utils/votingStatusUpdater";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  ShieldAlert,
  Timer,
  Trophy,
  AlertTriangle,
  Activity,
  Calendar,
} from "lucide-react";

/* ─────────────────────────────────────────
   STATUS HELPERS
───────────────────────────────────────── */
const STATUS_MAP = {
  0: { label: "Not Started", variant: "secondary" },
  1: { label: "Live", variant: "default" },
  2: { label: "Ended", variant: "destructive" },
};

const formatUnixDate = (unixTs) => {
  if (!unixTs || unixTs === 0) return "Not set";
  return new Date(unixTs * 1000).toLocaleString();
};

/* ─────────────────────────────────────────
   VOTING STATUS CARD  (read-only for all)
───────────────────────────────────────── */
const StatusCard = ({ status }) => {
  const info = STATUS_MAP[status] ?? { label: "Unknown", variant: "outline" };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Election Status</CardTitle>
        <Activity size={18} className="text-slate-400" />
      </CardHeader>
      <CardContent>
        <Badge variant={info.variant} className="text-sm px-3 py-1">
          {info.label}
        </Badge>
      </CardContent>
    </Card>
  );
};

/* ─────────────────────────────────────────
   VOTING PERIOD CARD  (read-only for all)
───────────────────────────────────────── */
const PeriodInfoCard = ({ startTime, endTime }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-base font-semibold">Voting Period</CardTitle>
      <Calendar size={18} className="text-slate-400" />
    </CardHeader>
    <CardContent className="space-y-2 text-sm">
      <div>
        <span className="text-slate-500">Starts:</span>{" "}
        <span className="font-medium">{formatUnixDate(startTime)}</span>
      </div>
      <div>
        <span className="text-slate-500">Ends:</span>{" "}
        <span className="font-medium">{formatUnixDate(endTime)}</span>
      </div>
    </CardContent>
  </Card>
);

/* ─────────────────────────────────────────
   WINNER CARD  (read-only for all)
───────────────────────────────────────── */
const WinnerCard = ({ winner }) => (
  <Card className={winner && winner !== ethers.ZeroAddress ? "border-yellow-400 bg-yellow-50" : ""}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-base font-semibold">Election Winner</CardTitle>
      <Trophy size={18} className="text-yellow-500" />
    </CardHeader>
    <CardContent>
      {winner && winner !== ethers.ZeroAddress ? (
        <p className="font-mono text-sm break-all text-slate-800">{winner}</p>
      ) : (
        <p className="text-slate-400 text-sm italic">Not announced yet</p>
      )}
    </CardContent>
  </Card>
);

/* ─────────────────────────────────────────
   SET VOTING PERIOD  (commissioner only)
───────────────────────────────────────── */
const SetVotingPeriodCard = ({ contractInstance, onSuccess }) => {
  const [startDelay, setStartDelay] = useState("");
  const [duration, setDuration] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const startDelaySecs = parseInt(startDelay);
    const durationSecs = parseInt(duration);

    if (isNaN(startDelaySecs) || isNaN(durationSecs)) {
      toast.error("Please enter valid numbers");
      return;
    }
    if (durationSecs <= 3600) {
      toast.error("Duration must be greater than 3600 seconds (1 hour)");
      return;
    }

    // The contract takes absolute unix timestamps
    const now = Math.floor(Date.now() / 1000);
    const startTime = now + startDelaySecs;
    const endTime = startTime + durationSecs;

    try {
      setIsLoading(true);
      console.log('🚀 Setting Voting Period:', {
        startTime,
        endTime,
        startFormatted: new Date(startTime * 1000).toLocaleString(),
        endFormatted: new Date(endTime * 1000).toLocaleString(),
        currentTime: Math.floor(Date.now() / 1000)
      });
      
      const tx = await contractInstance.setVotingPeriod(startTime, endTime);
      await tx.wait();
      
      // Store timestamps in localStorage for retrieval
      localStorage.setItem('votingStartTime', startTime.toString());
      localStorage.setItem('votingEndTime', endTime.toString());
      
      console.log('✅ Voting Period Set Successfully');
      
      // Force a delay to allow contract state to update
      setTimeout(() => {
        onSuccess();
        triggerVotingStatusUpdate(); // Trigger global update
        toast.success("Voting period set successfully!");
      }, 1000);
      
      setStartDelay("");
      setDuration("");
    } catch (error) {
      toast.error("Failed to set voting period");
      console.error("❌ Set Voting Period Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Timer size={18} className="text-blue-600" />
          <CardTitle className="text-xl">Set Voting Period</CardTitle>
        </div>
        <CardDescription>
          Define when voting starts and how long it lasts. Times are calculated from
          now in seconds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startDelay">Start Delay (seconds from now)</Label>
            <Input
              id="startDelay"
              type="number"
              min="0"
              value={startDelay}
              onChange={(e) => setStartDelay(e.target.value)}
              placeholder="e.g. 0 to start immediately"
              required
            />
            <p className="text-xs text-slate-400">0 = voting starts right now</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Voting Duration (seconds)</Label>
            <Input
              id="duration"
              type="number"
              min="3601"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 86400 (24 hours)"
              required
            />
            <p className="text-xs text-slate-400">Minimum 3601 seconds (~1 hour)</p>
          </div>
          {startDelay !== "" && duration !== "" && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
              <p>
                🟢 <strong>Start:</strong>{" "}
                {formatUnixDate(Math.floor(Date.now() / 1000) + parseInt(startDelay || 0))}
              </p>
              <p>
                🔴 <strong>End:</strong>{" "}
                {formatUnixDate(
                  Math.floor(Date.now() / 1000) +
                    parseInt(startDelay || 0) +
                    parseInt(duration || 0)
                )}
              </p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Setting Period..." : "Set Voting Period"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

/* ─────────────────────────────────────────
   ANNOUNCE WINNER  (commissioner only)
───────────────────────────────────────── */
const AnnounceWinnerCard = ({ contractInstance, onSuccess, status }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);

  // Check for candidates when component mounts
  useEffect(() => {
    const checkCandidates = async () => {
      try {
        const candidateList = await contractInstance.getCandidateList();
        setCandidates(candidateList);
      } catch (error) {
        console.error('Error checking candidates:', error);
      }
    };
    if (contractInstance) {
      checkCandidates();
    }
  }, [contractInstance]);

  const handleAnnounce = async () => {
    // Validation checks
    if (status !== 2 && status !== null) {
      toast.error("Voting must be ended before announcing winner. Use emergency stop if needed.");
      return;
    }
    
    if (candidates.length === 0) {
      toast.error("No candidates registered. Cannot announce winner.");
      return;
    }

    try {
      setIsLoading(true);
      const tx = await contractInstance.announceVotingResult();
      await tx.wait();
      toast.success("Winner announced! Results are now public.");
      onSuccess();
      triggerVotingStatusUpdate(); // Trigger global update
    } catch (error) {
      // Better error handling
      if (error.message.includes("Voting is still going on")) {
        toast.error("Voting is still active. Use emergency stop first, then announce winner.");
      } else if (error.message.includes("No candidates")) {
        toast.error("No candidates available for winner announcement.");
      } else {
        toast.error("Failed to announce winner. Check voting status and try again.");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonState = () => {
    if (isLoading) return { text: "Announcing...", disabled: true };
    if (status !== 2 && status !== null) return { text: "Voting Must End First", disabled: true };
    if (candidates.length === 0) return { text: "No Candidates Registered", disabled: true };
    return { text: "Announce Winner", disabled: false };
  };

  const buttonState = getButtonState();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-yellow-500" />
          <CardTitle className="text-xl">Announce Winner</CardTitle>
        </div>
        <CardDescription>
          Tally votes and publish the result. This can only be done after the
          voting period has ended. Once announced, it is visible to everyone.
        </CardDescription>
        <div className="text-xs space-y-1 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Candidates:</span>
            <span className={`font-medium ${candidates.length === 0 ? "text-red-600" : "text-green-600"}`}>
              {candidates.length} registered
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Status:</span>
            <span className={`font-medium ${status === 2 ? "text-green-600" : "text-orange-600"}`}>
              {status === 2 ? "Ready to announce" : "Waiting for voting to end"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleAnnounce} 
          disabled={buttonState.disabled} 
          className="w-full"
          variant={candidates.length === 0 || status !== 2 ? "outline" : "default"}
        >
          {buttonState.text}
        </Button>
      </CardContent>
    </Card>
  );
};

/* ─────────────────────────────────────────
   RESET VOTING  (commissioner only)
───────────────────────────────────────── */
const ResetVotingCard = ({ contractInstance, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleReset = async () => {
    if (!confirmed) {
      setConfirmed(true);
      toast("Click again to confirm voting reset", { icon: "🔄" });
      setTimeout(() => setConfirmed(false), 5000);
      return;
    }
    try {
      setIsLoading(true);
      // Set voting period to future time to reset status
      const now = Math.floor(Date.now() / 1000);
      const futureTime = now + 3600; // 1 hour from now
      const tx = await contractInstance.setVotingPeriod(futureTime, futureTime + 7200);
      await tx.wait();
      
      // Update localStorage
      localStorage.setItem('votingStartTime', futureTime.toString());
      localStorage.setItem('votingEndTime', (futureTime + 7200).toString());
      
      toast.success("Voting reset successfully. You can now set a new voting period.");
      setConfirmed(false);
      setEmergencyStopped(false); // Clear emergency stop flag
      localStorage.removeItem('emergencyStopped'); // Clear persisted flag
      onSuccess();
      triggerVotingStatusUpdate(); // Trigger global update
    } catch (error) {
      toast.error("Failed to reset voting. Try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Timer size={18} className="text-orange-600" />
          <CardTitle className="text-xl text-orange-700">Reset Voting</CardTitle>
        </div>
        <CardDescription>
          Reset the voting system after an emergency stop. This allows you to set a new voting period.
          Use this when the system is stuck in "Ended" status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleReset}
          disabled={isLoading}
          className="w-full"
          variant={confirmed ? "default" : "outline"}
        >
          {isLoading
            ? "Resetting..."
            : confirmed
            ? "🔄 Click again to confirm"
            : "Reset Voting System"}
        </Button>
      </CardContent>
    </Card>
  );
};

/* ─────────────────────────────────────────
   EMERGENCY STOP  (commissioner only)
───────────────────────────────────────── */
const EmergencyStopCard = ({ contractInstance, onSuccess, status, onEmergencyStop }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleStop = async () => {
    if (!confirmed) {
      setConfirmed(true);
      toast("Click again to confirm emergency stop", { icon: "⚠️" });
      setTimeout(() => setConfirmed(false), 5000);
      return;
    }
    try {
      setIsLoading(true);
      
      console.log('🚨 Emergency Stop Debug:', {
        currentStatus: status,
        contractInstance: !!contractInstance
      });
      
      const tx = await contractInstance.emergencyStopVoting();
      console.log('🚨 Emergency Stop Transaction:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('🚨 Emergency Stop Receipt:', {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });
      
      // Force immediate status update
      setTimeout(async () => {
        try {
          const newStatus = await contractInstance.getVotingStatus();
          console.log('🚨 Post-Stop Status:', {
            oldStatus: status,
            newStatus: Number(newStatus),
            statusText: Number(newStatus) === 2 ? 'Ended' : 'Other'
          });
        } catch (error) {
          console.error('Error checking post-stop status:', error);
        }
      }, 2000);
      
      toast.success("Emergency stop activated. Voting has been halted.");
      setConfirmed(false);
      localStorage.setItem('emergencyStopped', 'true'); // Persist emergency stop
      if (onEmergencyStop) onEmergencyStop(); // Notify parent to update state
      onSuccess();
      triggerVotingStatusUpdate(); // Trigger global update
    } catch (error) {
      console.error('🚨 Emergency Stop Error:', {
        message: error.message,
        code: error.code,
        data: error.data,
        reason: error.reason
      });
      
      if (error.message.includes("Voting already ended")) {
        toast.error("Voting has already ended. No need for emergency stop.");
      } else if (error.message.includes("Not started")) {
        toast.error("Voting hasn't started yet. Cannot emergency stop.");
      } else if (error.code === 4001) {
        toast.error("Transaction rejected by user.");
      } else {
        toast.error(`Emergency stop failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonState = () => {
    if (isLoading) return { text: "Stopping...", disabled: true };
    if (status === 2) return { text: "Already Ended", disabled: false }; // Enable for testing
    if (status === null) return { text: "Not Started", disabled: false }; // Enable for testing
    return { text: confirmed ? "⚠️ Click again to confirm" : "Emergency Stop", disabled: false };
  };

  const buttonState = getButtonState();

  return (
    <Card className="border-red-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-red-600" />
          <CardTitle className="text-xl text-red-700">Emergency Stop</CardTitle>
        </div>
        <CardDescription>
          Immediately halts the voting process. <strong>This action cannot be undone.</strong>{" "}
          A double-click confirmation is required.
        </CardDescription>
        <div className="text-xs space-y-1 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Current Status:</span>
            <span className={`font-medium ${
              status === 2 ? "text-green-600" : 
              status === 1 ? "text-orange-600" : 
              status === 0 ? "text-blue-600" : 
              "text-slate-500"
            }`}>
              {status === 2 ? "Ended" : 
               status === 1 ? "Live" : 
               status === 0 ? "Not Started" : 
               "Unknown"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleStop}
          disabled={buttonState.disabled}
          className="w-full"
          variant={confirmed ? "destructive" : "outline"}
        >
          {buttonState.text}
        </Button>
      </CardContent>
    </Card>
  );
};

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
const ElectionCommission = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance, selectedAccount } = web3State;
  const navigateTo = useNavigate();
  const isCommissioner = useIsCommissioner();
  const [status, setStatus] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [winner, setWinner] = useState(null);
  const [emergencyStopped, setEmergencyStopped] = useState(
    localStorage.getItem('emergencyStopped') === 'true'
  );

  const token = localStorage.getItem("token");
  if (!token) navigateTo("/");

  const fetchElectionData = useCallback(async () => {
    if (!contractInstance) return;
    try {
      const [s, w] = await Promise.all([
        contractInstance.getVotingStatus(),
        contractInstance.winner(),
      ]);
      const contractStatus = Number(s);
      setWinner(w);

      // Since contract doesn't expose startTime/endTime getters,
      // try to get them from events or localStorage as fallback
      try {
        // Try to get from localStorage first (set when voting period is set)
        const storedStartTime = localStorage.getItem('votingStartTime');
        const storedEndTime = localStorage.getItem('votingEndTime');
        
        if (storedStartTime && storedEndTime) {
          const start = Number(storedStartTime);
          const end = Number(storedEndTime);
          const now = Math.floor(Date.now() / 1000);
          setStartTime(start);
          setEndTime(end);
          
          // Client-side status calculation as fallback
          let calculatedStatus = contractStatus;
          
          // If emergency stop was triggered, force status to "Ended"
          if (emergencyStopped) {
            calculatedStatus = 2; // Ended
          } else if (storedStartTime && storedEndTime) {
            if (now < start) {
              calculatedStatus = 0; // Not Started
            } else if (now >= start && now <= end) {
              calculatedStatus = 1; // Live
            } else {
              calculatedStatus = 2; // Ended
            }
          }
          
          console.log('🔍 Voting Status Debug:', {
            contractStatus,
            calculatedStatus,
            emergencyStopped,
            statusText: calculatedStatus === 0 ? 'Not Started' : calculatedStatus === 1 ? 'Live' : 'Ended',
            currentTime: now,
            storedStartTime: start,
            storedEndTime: end,
            startFormatted: new Date(start * 1000).toLocaleString(),
            endFormatted: new Date(end * 1000).toLocaleString(),
            shouldLive: now >= start && now <= end,
            usingClientSide: calculatedStatus !== contractStatus
          });
          
          // Use calculated status
          setStatus(calculatedStatus);
        } else {
          setStatus(contractStatus);
          console.log('🔍 Voting Status Debug:', {
            contractStatus,
            statusText: contractStatus === 0 ? 'Not Started' : contractStatus === 1 ? 'Live' : 'Ended',
            currentTime: Math.floor(Date.now() / 1000),
            noStoredTimes: true
          });
        }
      } catch (error) {
        setStatus(contractStatus);
        console.log('No stored voting times found, using contract status');
      }
    } catch (error) {
      console.error("Error fetching election data:", error);
    }
  }, [contractInstance]);

  useEffect(() => {
    fetchElectionData();
  }, [fetchElectionData]);

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Election Commission
        </h1>
        <p className="text-slate-500 mt-1">
          {isCommissioner
            ? "Manage the election lifecycle. Your actions affect all participants."
            : "Live election information visible to all participants."}
        </p>
      </div>

      {/* ── Public Info Section (visible to EVERYONE) ── */}
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-4 h-px bg-slate-300" />
          Live Election Status
          <span className="flex-1 h-px bg-slate-100" />
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatusCard status={status} />
          <PeriodInfoCard startTime={startTime} endTime={endTime} />
          <WinnerCard winner={winner} />
        </div>
      </section>

      {/* ── Commissioner-only Admin Section ── */}
      {isCommissioner ? (
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-4 h-px bg-slate-300" />
            Commissioner Controls
            <span className="flex-1 h-px bg-slate-100" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SetVotingPeriodCard contractInstance={contractInstance} onSuccess={fetchElectionData} />
            <div className="space-y-6">
              <AnnounceWinnerCard contractInstance={contractInstance} onSuccess={fetchElectionData} status={status} />
              <ResetVotingCard contractInstance={contractInstance} onSuccess={fetchElectionData} />
              <EmergencyStopCard
                contractInstance={contractInstance}
                onSuccess={fetchElectionData}
                status={status}
                onEmergencyStop={() => {
                  setEmergencyStopped(true);
                  setStatus(2);
                }}
              />
            </div>
          </div>
        </section>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
          <AlertTriangle size={28} className="mx-auto text-slate-300 mb-2" />
          <p className="text-slate-500 text-sm">
            Administrative controls are only accessible to the Election Commissioner.
          </p>
        </div>
      )}
    </div>
  );
};

export default ElectionCommission;