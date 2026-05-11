import { useEffect, useState } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { Timer, Trophy, Info, Clock } from "lucide-react";

/* Format seconds → "Xd Xh Xm Xs" */
const formatCountdown = (seconds) => {
  if (seconds <= 0) return "00:00:00";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m`;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

const ElectionBanner = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [status, setStatus] = useState(null);
  const [winner, setWinner] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [countdown, setCountdown] = useState("");

  // Poll contract for status + timing every 15 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!contractInstance) return;
        const [s, w] = await Promise.all([
          contractInstance.getVotingStatus(),
          contractInstance.winner(),
        ]);
        const contractStatus = Number(s);
        setWinner(w);

        // Try to read endTime from localStorage since contract doesn't expose it
        try {
          const storedStartTime = localStorage.getItem('votingStartTime');
          const storedEndTime = localStorage.getItem('votingEndTime');
          
          if (storedStartTime && storedEndTime) {
            const start = Number(storedStartTime);
            const end = Number(storedEndTime);
            const now = Math.floor(Date.now() / 1000);
            setEndTime(end);
            
            // Client-side status calculation
            let calculatedStatus = contractStatus;
            const emergencyStopped = localStorage.getItem('emergencyStopped') === 'true';
            
            if (emergencyStopped) {
              calculatedStatus = 2; // Ended - Emergency stop takes priority
            } else if (now < start) {
              calculatedStatus = 0; // Not Started
            } else if (now >= start && now <= end) {
              calculatedStatus = 1; // Live
            } else {
              calculatedStatus = 2; // Ended
            }
            
            console.log('🏁 Banner Status Debug:', {
              contractStatus,
              calculatedStatus,
              emergencyStopped,
              usingClientSide: calculatedStatus !== contractStatus
            });
            
            setStatus(calculatedStatus);
          } else {
            setEndTime(null);
            setStatus(contractStatus);
          }
        } catch { /* fallback handled */ }
      } catch (error) {
        console.error("Banner: error fetching status", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    
    // Listen for global voting status updates
    const handleVotingUpdate = () => {
      console.log('🔄 ElectionBanner: Updating voting status');
      fetchData();
    };
    
    window.addEventListener('votingStatusUpdate', handleVotingUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('votingStatusUpdate', handleVotingUpdate);
    };
  }, [contractInstance]);

  // Live countdown ticker (every second)
  useEffect(() => {
    if (status !== 1 || !endTime) return;
    const tick = () => {
      const remaining = endTime - Math.floor(Date.now() / 1000);
      setCountdown(formatCountdown(remaining));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status, endTime]);

  if (status === null) return null;

  const isZeroAddr = !winner || winner === "0x0000000000000000000000000000000000000000";

  /* ── Banner styles per phase ── */
  const phases = {
    0: {
      bg: "bg-slate-700",
      icon: <Info className="w-4 h-4" />,
      label: "Election Upcoming",
      sub: "Voting has not started yet. Stay tuned.",
    },
    1: {
      bg: "bg-emerald-600",
      icon: <Timer className="w-4 h-4 animate-pulse" />,
      label: "Voting is Live",
      sub: endTime ? `Time remaining: ${countdown}` : "Polls are open — cast your vote!",
    },
    2: {
      bg: "bg-indigo-700",
      icon: <Trophy className="w-4 h-4" />,
      label: "Election Ended",
      sub: isZeroAddr
        ? "Results pending announcement."
        : `Winner: ${winner.substring(0, 10)}…${winner.substring(winner.length - 4)}`,
    },
  };

  const phase = phases[status] ?? phases[0];

  return (
    <div
      className={`${phase.bg} text-white px-4 py-2.5 flex items-center justify-between gap-4 shadow-sm`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="bg-white/20 p-1.5 rounded-full flex-shrink-0">{phase.icon}</div>
        <div className="min-w-0">
          <span className="font-bold text-sm tracking-wide">{phase.label}</span>
          <span className="hidden sm:inline text-white/80 text-xs ml-2 truncate">
            — {phase.sub}
          </span>
        </div>
      </div>

      {status === 1 && endTime && (
        <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm font-mono font-bold flex-shrink-0">
          <Clock className="w-3.5 h-3.5" />
          {countdown}
        </div>
      )}
    </div>
  );
};

export default ElectionBanner;
