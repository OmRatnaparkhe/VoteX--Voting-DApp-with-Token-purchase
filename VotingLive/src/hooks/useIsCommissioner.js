import { useWeb3Context } from "../context/useWeb3Context";

/**
 * Returns true if the currently connected wallet is the Election Commissioner.
 *
 * The commissioner address is set at deploy time via the VITE_COMMISSIONER_ADDRESS
 * environment variable (in .env):
 *   VITE_COMMISSIONER_ADDRESS=0xYourDeployerAddress
 *
 * Comparison is case-insensitive.
 */
const useIsCommissioner = () => {
  const { web3State } = useWeb3Context();
  const { selectedAccount } = web3State;

  const commissionerAddress =
    import.meta.env.VITE_COMMISSIONER_ADDRESS || "";

  if (!selectedAccount || !commissionerAddress) return false;

  return selectedAccount.toLowerCase() === commissionerAddress.toLowerCase();
};

export default useIsCommissioner;
