import { useState, useRef, useEffect } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { uploadVoterImage } from "../../utils/uploadVoterImage";
import { deleteVoterRegistration } from "../../utils/deleteRegistration";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { ShieldCheck, Settings } from "lucide-react";

const RegisterVoter = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance, selectedAccount } = web3State;

  const [file, setFile] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const nameRef = useRef(null);
  const ageRef = useRef(null);
  const genderRef = useRef(null);

  const genderEnum = {
    NotSpecified: 0,
    Male: 1,
    Female: 2,
    Other: 3,
  };

  const token = localStorage.getItem("token");
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!token) {
      navigateTo("/");
    }
  }, [navigateTo, token]);

  useEffect(() => {
    const checkRegistration = async () => {
      try {
        if (contractInstance && selectedAccount) {
          const voters = await contractInstance.getVoterList();
          const registered = voters.some(
            voter => voter.voterAddress.toLowerCase() === selectedAccount.toLowerCase()
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

  const handleVoterRegistration = async (e) => {
    e.preventDefault();
    try {
      const name = nameRef.current.value;
      const age = ageRef.current.value;
      const gender = genderRef.current.value;

      if (!contractInstance) {
        throw new Error("Contract instance not found!");
      }

      const imageUploadStatus = await uploadVoterImage(file);
      if (imageUploadStatus === true) {
        await contractInstance.registerVoter(name, age, gender);
        toast.success("Registration Successful");
        setIsRegistered(true);
      } else {
        throw new Error("Voter Registration Failed!");
      }
    } catch (error) {
      toast.error("Error: Registering Voter");
      console.error(error);
    }
  };

  const handleDeleteRegistration = async () => {
    if (!window.confirm("Are you sure you want to delete your profile? This will remove your photo and data from our server, but your blockchain record is permanent.")) {
      return;
    }

    try {
      setIsDeleting(true);
      const result = await deleteVoterRegistration();
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
        <div className="bg-green-100 p-6 rounded-full">
          <ShieldCheck className="text-green-600 w-16 h-16" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">Registration Complete!</h1>
          <p className="text-slate-600 text-lg">
            Your identity has been verified on the blockchain. You are now authorized to participate in the upcoming election.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Card className="hover:border-blue-300 transition-all cursor-pointer" onClick={() => navigateTo("/candidate-list")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">View Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Research the candidates before casting your valuable vote.</p>
            </CardContent>
          </Card>
          
          <Card className="hover:border-blue-300 transition-all cursor-pointer" onClick={() => navigateTo("/cast-vote")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Cast Your Vote</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Securely transmit your choice to the blockchain when voting opens.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full border-red-100 bg-red-50/30">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-semibold text-red-600 flex items-center justify-center gap-2">
              <Settings size={16} /> Manage Identity
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
          <CardTitle className="text-2xl">Voter Registration</CardTitle>
          <CardDescription>Register your identity to participate in the election.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVoterRegistration} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" type="text" ref={nameRef} required placeholder="Jane Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" ref={ageRef} required placeholder="18" min="18" />
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
              <Label htmlFor="photo">Your Photo</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Register as Voter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterVoter;