import Layout from "../components/Layout/Layout";
import RegisterVoter from "../pages/Voter/RegisterVoter";
import RegisterCandidate from "../pages/Candidate/RegisterCandidate";
import GetVoterList from "../pages/Voter/GetVoterList";
import GetCandidateList from "../pages/Candidate/GetCandidateList";
import CastVote from "../components/Voter/CasteVote";
import { createBrowserRouter } from "react-router-dom";
import Wallet from "../components/Wallet/Wallet";
import ElectionCommission from "../pages/ElectionCommision/ElectionCommision";
import TokenMarketplace from "../pages/TokenMarketplace/TokenMarketplace";
import RoleSelection from "../components/RoleSelection/RoleSelection";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <Wallet />,
    },
    {
        path: "/role-selection",
        element: <RoleSelection />
    },
    {
        element: <Layout />,
        children: [
            { path: "register-voter", element: <RegisterVoter /> },
            { path: "register-candidate", element: <RegisterCandidate /> },
            { path: "voter-list", element: <GetVoterList /> },
            { path: "candidate-list", element: <GetCandidateList /> },
            { path: "cast-vote", element: <CastVote /> },
            { path: "election-commission", element: <ElectionCommission /> },
            { path: "token-marketplace", element: <TokenMarketplace /> },
        ]
    }
]);