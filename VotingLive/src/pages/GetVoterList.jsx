import { useEffect, useState } from "react";
import { useWeb3Context } from "../context/useWeb3Context";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { API_URL } from "../config/constants";

const GetVoterList = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [voterList, setVoterList] = useState([]);
  const token = localStorage.getItem("token");
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!token) {
      navigateTo("/");
    }
  }, [navigateTo, token]);

  useEffect(() => {
    const fetchVoterList = async () => {
      try {
        if (contractInstance) {
           const list = await contractInstance.getVoterList();
           setVoterList(list);
        }
      } catch (error) {
        toast.error("Error: Getting Voting List");
        console.error(error);
      }
    };
    fetchVoterList();
  }, [contractInstance]);

  return (
    <div className="max-w-4xl mx-auto py-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Registered Voters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Address</TableHead>
                  <TableHead className="text-left">Name</TableHead>
                  <TableHead className="text-left">Photo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voterList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No voters registered.
                    </TableCell>
                  </TableRow>
                ) : (
                  voterList.map((voter, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm text-left">
                        {voter.voterAddress}
                      </TableCell>
                      <TableCell className="text-left font-medium">{voter.name}</TableCell>
                      <TableCell className="text-left">
                        <img
                          src={`${API_URL}/getVoterImage/${voter.voterAddress}`}
                          alt={`${voter.name}'s photo`}
                          className="w-12 h-12 rounded-full object-cover inline-block border bg-slate-100"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = "https://placehold.co/150x150/png?text=No+Photo";
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GetVoterList;
