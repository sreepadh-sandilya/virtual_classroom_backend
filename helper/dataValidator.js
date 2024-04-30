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
  
 
  

  
module.exports = [validateEmail,ValidTimestamp,ValidateLink];