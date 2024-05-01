function validateEmail(email) {
    // Regular expression pattern for validating email addresses
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Check if the email matches the pattern
    return pattern.test(email);
}

function ValidTimestamp(timestamp) {
    // Regular expression to match the "YYYY-MM-DD HH:mm:ss" format
    const timestampRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  
    // Check if the timestamp matches the expected format
    if (!timestampRegex.test(timestamp)) {
      return false; // Invalid format
    }
  
    // Create a new Date object using the timestamp
    const date = new Date(timestamp);
  
    // Check if the Date object is valid
    return !isNaN(date.getTime()); // Returns true if valid, false otherwise
  }
  
  function ValidateLink(link) {
    // Regular expression to match URL format
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;
  
    // Check if the link matches the expected format
    return urlRegex.test(link);
  }

  function calculateDuration(startTimestamp, endTimestamp) {
    // Convert the timestamps into Date objects
    const startDate = new Date(startTimestamp);
    const endDate = new Date(endTimestamp);
  
    // Calculate the difference in milliseconds
    const durationMs = endDate - startDate;
  
    // Calculate hours, minutes, seconds, and milliseconds
    const hours = Math.floor(durationMs / 3600000); // 1 hour = 3600000 milliseconds
    const minutes = Math.floor((durationMs % 3600000) / 60000); // 1 minute = 60000 milliseconds
    const seconds = Math.floor((durationMs % 60000) / 1000); // 1 second = 1000 milliseconds
    const milliseconds = durationMs % 1000;
  
    // Format the duration string
    const formattedDuration = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}:${padZero(milliseconds, 3)}`;
    return formattedDuration;
  }
  
  // Function to pad zeros to the left of a number
  function padZero(number, width = 2) {
    return String(number).padStart(width, '0');
  }
  
 
  

  
module.exports = [validateEmail,ValidTimestamp,ValidateLink,calculateDuration];