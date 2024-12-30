export const isCustomDate = (field: string): boolean => {
  // Define regex patterns for each supported date format
  const datePatterns = [
    /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
    /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
  ];

  // Helper function to extract date parts based on format
  const extractDateParts = (
    dateString: string,
    format: string
  ): [number, number, number] => {
    const delimiter = dateString.includes("/") ? "/" : "-";
    const parts = dateString.split(delimiter).map(Number);

    switch (format) {
      case "DD/MM/YYYY":
      case "DD-MM-YYYY":
        return [parts[2], parts[1], parts[0]]; // [Year, Month, Day]
      case "MM/DD/YYYY":
      case "MM-DD-YYYY":
        return [parts[2], parts[0], parts[1]]; // [Year, Month, Day]
      case "YYYY/MM/DD":
      case "YYYY-MM-DD":
        return [parts[0], parts[1], parts[2]]; // [Year, Month, Day]
      default:
        throw new Error("Unsupported format");
    }
  };

  // Loop through patterns to find a match and validate
  for (const pattern of datePatterns) {
    if (pattern.test(field)) {
      // Identify the format based on the pattern
      let format = "";
      if (field.includes("/")) {
        format = field.indexOf("/") === 2 ? "DD/MM/YYYY" : "YYYY/MM/DD";
      } else if (field.includes("-")) {
        format = field.indexOf("-") === 2 ? "DD-MM-YYYY" : "YYYY-MM-DD";
      }

      // Extract parts and validate the date
      const [year, month, day] = extractDateParts(field, format);
      const date = new Date(year, month - 1, day); // Month is zero-indexed in JS
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    }
  }

  return false; // No matching pattern found
};
