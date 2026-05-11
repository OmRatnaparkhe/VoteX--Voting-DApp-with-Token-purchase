import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWeb3Context } from "../../context/useWeb3Context";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { 
  LogOut, 
  UserCircle, 
  Users, 
  Vote, 
  Store, 
  ShieldCheck, 
  Menu,
  X,
  Wallet,
  Scale
} from "lucide-react";
import { toast } from "react-hot-toast";

const Navigation = () => {
  const { web3State, setWeb3State } = useWeb3Context();
  const { contractInstance, selectedAccount } = web3State;
  const location = useLocation();
  const navigateTo = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [votingStatus, setVotingStatus] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
  }, [location.pathname]);

  useEffect(() => {
    const fetchVotingStatus = async () => {
      try {
        if (contractInstance) {
          // Get stored times for client-side calculation
          const storedStartTime = localStorage.getItem('votingStartTime');
          const storedEndTime = localStorage.getItem('votingEndTime');
          
          let status = Number(await contractInstance.getVotingStatus());
          
          // Client-side status calculation if times are stored
          if (storedStartTime && storedEndTime) {
            const start = Number(storedStartTime);
            const end = Number(storedEndTime);
            const now = Math.floor(Date.now() / 1000);
            const emergencyStopped = localStorage.getItem('emergencyStopped') === 'true';
            
            if (emergencyStopped) {
              status = 2; // Ended - Emergency stop takes priority
            } else if (now < start) {
              status = 0; // Not Started
            } else if (now >= start && now <= end) {
              status = 1; // Live
            } else {
              status = 2; // Ended
            }
          }
          
          setVotingStatus(status);
        }
      } catch (error) {
        console.error("Error fetching voting status:", error);
      }
    };
    
    fetchVotingStatus();
    
    // Listen for global voting status updates
    const handleVotingUpdate = () => {
      console.log('🔄 Navigation: Updating voting status');
      fetchVotingStatus();
    };
    
    window.addEventListener('votingStatusUpdate', handleVotingUpdate);
    
    return () => {
      window.removeEventListener('votingStatusUpdate', handleVotingUpdate);
    };
  }, [contractInstance]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setWeb3State(prevState => ({ ...prevState, selectedAccount: null }));
    toast.success("Logged out successfully");
    navigateTo("/");
  };

  const getStatusBadge = () => {
    switch (votingStatus) {
      case 0: return <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-slate-200">Upcoming</span>;
      case 1: return <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider border border-green-200 animate-pulse">Live Now</span>;
      case 2: return <span className="px-2 py-1 rounded-md bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider border border-red-200">Election Ended</span>;
      default: return null;
    }
  };

  const allLinks = [
    { name: "Register Voter", path: "/register-voter", roles: ["Voter"], icon: <UserCircle size={20} /> },
    { name: "Register Candidate", path: "/register-candidate", roles: ["Candidate"], icon: <UserCircle size={20} /> },
    { name: "Voter List", path: "/voter-list", roles: ["Voter", "Candidate", "Commissioner"], icon: <Users size={20} /> },
    { name: "Candidate List", path: "/candidate-list", roles: ["Voter", "Candidate", "Commissioner"], icon: <ShieldCheck size={20} /> },
    { name: "Cast Vote", path: "/cast-vote", roles: ["Voter"], icon: <Vote size={20} /> },
    { name: "Marketplace", path: "/token-marketplace", roles: ["Voter", "Candidate"], icon: <Store size={20} /> },
    { name: "Election Info", path: "/election-commission", roles: ["Voter", "Candidate"], icon: <Scale size={20} /> },
    { name: "EC Dashboard", path: "/election-commission", roles: ["Commissioner"], icon: <ShieldCheck size={20} /> },
  ];

  const filteredLinks = allLinks.filter(link => userRole && link.roles.includes(userRole));

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-blue-600 text-white rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[50]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-[55] transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section - Shifted Right */}
          <div className="p-6 pl-8 border-b border-slate-50">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-blue-200 shadow-lg">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-slate-900 block">VoteX</span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">{userRole} Panel</span>
              </div>
            </Link>
            <div className="mt-5 pl-1">
              {getStatusBadge()}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {filteredLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${location.pathname === link.path
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
                `}
              >
                {link.icon}
                <span className="text-sm">{link.name}</span>
                {location.pathname === link.path && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </Link>
            ))}
          </nav>

          {/* Footer Section */}
          <div className="p-4 border-t border-slate-100 space-y-4">
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex flex-shrink-0 items-center justify-center text-blue-600">
                  <Wallet size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">Wallet Connected</p>
                  <p className="text-xs font-mono text-slate-700 truncate">
                    {selectedAccount || "Not Connected"}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-[11px] h-8 bg-white border-slate-200"
                onClick={() => navigateTo("/role-selection")}
              >
                Switch Role
              </Button>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navigation;