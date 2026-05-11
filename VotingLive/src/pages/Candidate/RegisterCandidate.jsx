import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3Context } from "../../context/useWeb3Context";
import { uploadCandidateImage } from "../../utils/uploadCandidateImage";
import { deleteCandidateRegistration } from "../../utils/deleteRegistration";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { ShieldCheck, Settings } from "lucide-react";

const RegisterCandidate = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance, selectedAccount } = web3State;
  
  const token = localStorage.getItem("token");
  const navigateTo = useNavigate();

  const [file, setFile] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  const nameRef = useRef(null);
  const genderRef = useRef(null);
  const partyRef = useRef(null);
  const ageRef = useRef(null);

  const genderEnum = {
    NotSpecified: 0,
    Male: 1,
    Female: 2,
    Other: 3,
  };

  useEffect(() => {
    if (!token) {
      navigateTo("/");
    }
  }, [navigateTo, token]);

  useEffect(() => {
    const checkRegistration = async () => {
      try {
        if (contractInstance && selectedAccount) {
          const candidates = await contractInstance.getCandidateList();
          const registered = candidates.some(
            cand => cand.candidateAddress.toLowerCase() === selectedAccount.toLowerCase()
          );
          setIsRegistered(registered);
        }
      } catch (error) {
        console.error("Error checking registration:", error);
      } finally {
        setLoading(false);
      }
    };
    checkRegistration();
  }, [contractInstance, selectedAccount]);

  const handleCandidateRegistration = async (e) => {
    e.preventDefault();
    try {
      const name = nameRef.current.value;
      const age = ageRef.current.value;
      const gender = genderRef.current.value;
      const party = partyRef.current.value;

      if (!contractInstance) {
        throw new Error("Contract instance not found!");
      }

      const imageUploadStatus = await uploadCandidateImage(file);
      if (imageUploadStatus === true) {
        await contractInstance.registerCandidate(name, party, age, gender);
        toast.success("Registration Successful");
        setIsRegistered(true);
      } else {
        throw new Error("Candidate Registration Failed!");
      }
    } catch (error) {
      toast.error("Error: Registering Candidate");
      console.error(error);
    }
  };

  const handleDeleteRegistration = async () => {
    if (!window.confirm("Are you sure you want to delete your candidate profile? This will remove your photo and data from our server, but your blockchain record is permanent.")) {
      return;
    }

    try {
      setIsDeleting(true);
      const result = await deleteCandidateRegistration();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during deletion");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="flex flex-col items-center max-w-4xl mx-auto py-12 space-y-8 text-center">
        <div className="bg-blue-100 p-6 rounded-full text-blue-600">
          <ShieldCheck className="w-16 h-16" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">Candidate Dashboard</h1>
          <p className="text-slate-600 text-lg">
            Your candidate profile is live on the blockchain. You can now monitor the voter list and track election updates.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Card className="hover:border-blue-300 transition-all cursor-pointer" onClick={() => navigateTo("/voter-list")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Voter Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">View the list of registered voters who will participate in this election.</p>
            </CardContent>
          </Card>
          
          <Card className="hover:border-blue-300 transition-all cursor-pointer" onClick={() => navigateTo("/candidate-list")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Competitor List</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">See other registered candidates and current vote counts once voting begins.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full border-red-100 bg-red-50/30">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-semibold text-red-600 flex items-center justify-center gap-2">
              <Settings size={16} /> Manage Candidate Data
            </CardTitle>
          </CardHeader>
          <CardFooter className="pb-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="mx-auto text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleDeleteRegistration}
              disabled={isDeleting}
            >
              {isDeleting ? "Wiping Data..." : "Remove Server Metadata"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto py-8 space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Candidate Registration</CardTitle>
          <CardDescription>Nominate yourself for the decentralized election.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCandidateRegistration} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Candidate Name</Label>
              <Input id="name" type="text" ref={nameRef} required placeholder="Jane Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Candidate Age</Label>
              <Input id="age" type="number" ref={ageRef} required placeholder="25" min="25" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                ref={genderRef}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              >
                <option value={genderEnum.NotSpecified}>Select Gender</option>
                <option value={genderEnum.Male}>Male</option>
                <option value={genderEnum.Female}>Female</option>
                <option value={genderEnum.Other}>Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="party">Candidate Party</Label>
              <Input id="party" type="text" ref={partyRef} required placeholder="Democratic Party" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Candidate Photo</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Submit Nomination
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterCandidate;