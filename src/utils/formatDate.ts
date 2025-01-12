const formatDate = (timestamp: string | null): string => {
    if (!timestamp) return "Unknown Date";
    return new Date(timestamp).toLocaleString("en-SG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Singapore",
    });
  };
  
  export default formatDate;