// Helper function to convert total seconds to the duration format
function convertSecondsToDuration(totalSeconds) {
  // Handle invalid inputs
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) {
    return "0s";
  }

  // Ensure we have a positive number
  const seconds = Math.max(0, Math.floor(totalSeconds));
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

module.exports = {
  convertSecondsToDuration,
}