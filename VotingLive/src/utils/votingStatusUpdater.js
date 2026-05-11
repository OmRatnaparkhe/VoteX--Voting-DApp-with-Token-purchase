/**
 * Global Voting Status Updater
 * Triggers voting status updates across all components
 */

export const triggerVotingStatusUpdate = () => {
  console.log('📢 Broadcasting voting status update to all components');
  window.dispatchEvent(new CustomEvent('votingStatusUpdate'));
};

export const triggerVotingDataUpdate = () => {
  console.log('📢 Broadcasting voting data update to all components');
  window.dispatchEvent(new CustomEvent('votingDataUpdate'));
};
