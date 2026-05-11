import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import useIsCommissioner from "../../hooks/useIsCommissioner";

const RoleSelection = () => {
  const navigateTo = useNavigate();

  const isCommissioner = useIsCommissioner();

  const handleRoleSelection = (role) => {
    localStorage.setItem("userRole", role);
    if (role === "Voter") {
      navigateTo("/register-voter");
    } else if (role === "Candidate") {
      navigateTo("/register-candidate");
    } else if (role === "Commissioner") {
      navigateTo("/election-commission");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Choose Your Role</h1>
          <p className="text-lg text-slate-500 mt-2">Select how you want to participate in the election.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-500" onClick={() => handleRoleSelection("Voter")}>
            <CardHeader className="text-center pb-4 pt-10">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold">Voter</CardTitle>
              <CardDescription className="text-base mt-2">
                Register to vote, view candidate lists, purchase tokens, and cast your vote securely.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-10 flex justify-center">
              <Button size="lg" className="w-full px-8">Continue as Voter</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-500" onClick={() => handleRoleSelection("Candidate")}>
            <CardHeader className="text-center pb-4 pt-10">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold">Candidate</CardTitle>
              <CardDescription className="text-base mt-2">
                Register as a candidate, represent your party, and participate in the ongoing election.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-10 flex justify-center">
              <Button size="lg" className="w-full px-8 bg-purple-600 hover:bg-purple-700 text-white">Continue as Candidate</Button>
            </CardContent>
          </Card>
        </div>

        {isCommissioner && (
          <div className="mt-8 flex justify-center">
             <Card className="w-full max-w-md hover:shadow-lg transition-shadow cursor-pointer border-2 border-red-200 hover:border-red-500 bg-red-50" onClick={() => handleRoleSelection("Commissioner")}>
               <CardContent className="py-6 flex flex-col items-center">
                 <h2 className="text-xl font-bold text-red-700 mb-2">Commissioner Access</h2>
                 <p className="text-red-600 text-sm text-center mb-4">You are recognized as the Election Commissioner.</p>
                 <Button variant="destructive" className="w-full">Open Commission Dashboard</Button>
               </CardContent>
             </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSelection;
