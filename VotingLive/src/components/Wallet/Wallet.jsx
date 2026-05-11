import { useEffect } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

const Wallet = () => {
  const { web3State, handleWallet } = useWeb3Context();
  const navigateTo = useNavigate();
  const { selectedAccount } = web3State;

  useEffect(() => {
    if (selectedAccount) {
      navigateTo("/role-selection");
    }
  }, [selectedAccount, navigateTo]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-0 ring-1 ring-slate-200">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-8 w-8 text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome to VoteX
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Connect your Web3 wallet to participate in the decentralized election.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-10 flex justify-center">
          <Button size="lg" onClick={handleWallet} className="w-full sm:w-auto px-8">
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;