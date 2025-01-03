"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import axios from "axios";
import { isCustomDate } from "@/utils/isCustomDate";

const UploadCSV = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<unknown[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Handle file selection and  format validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const selectedFile = e.target.files?.[0];

    // Step 1: Validate file type
    if (!selectedFile) {
      setError("No file selected.");
      return;
    }

    const fileType = selectedFile.type;
    if (fileType !== "text/csv") {
      setError("The file should be in CSV format. Please upload another file.");
      return;
    }

    // Step 2: Read and validate the CSV headers
    const reader = new FileReader();

    reader.onload = () => {
      const csvData = reader.result as string;

      // Step 3: Parse CSV using PapaParse
      Papa.parse(csvData, {
        complete: (result) => {
          const firstRow = result.data[0] as string[]; // First row is the header (array of strings)

          // Step 4: Check if any field can be interpreted as a number or date
          const invalidFields = firstRow.filter((field: string) => {
            const isNumber = !isNaN(Number(field));
            const isDate = isCustomDate(field);

            return isNumber || isDate;
          });

          if (invalidFields.length > 0) {
            setError(
              "It looks like your file is missing column names at the top (headers). Please add a row at the beginning of the file with column names and try uploading again"
            );
            return;
          }

          // Step 5: If the header is valid (no numbers or dates), process the file
          setFile(selectedFile);
        },
        header: false, // Don't treat the first row as headers, just get the raw data
      });
    };

    reader.onerror = () => {
      setError("Error reading the file.");
    };

    // Step 6: Read the file content as text
    reader.readAsText(selectedFile);
  };

  // Parse CSV
  const handleParseCSV = () => {
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    setIsUploading(true);
    setError("");

    Papa.parse(file, {
      complete: (result: { data: React.SetStateAction<unknown[]> }) => {
        setParsedData(result.data);
        setIsUploading(false);
      },
      header: true,
      skipEmptyLines: true,
    });
  };

  // Send parsed data to the backend (API route)
  const handleUpload = async () => {
    if (parsedData.length === 0) {
      setError("No data to upload. Please parse the CSV first.");
      return;
    }

    try {
      setIsUploading(true);
      await axios.post("/api/upload-csv", { data: parsedData });
      alert("CSV data uploaded successfully!");
      setIsUploading(false);
    } catch (err) {
      setError("Error uploading data. Please try again." + err);
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h1>CSV Upload and Parsing</h1>

      <input type="file" accept=".csv" onChange={handleFileChange} />

      <button onClick={handleParseCSV} disabled={isUploading}>
        Parse CSV
      </button>

      <button onClick={handleUpload} disabled={isUploading}>
        Upload Parsed Data
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {parsedData.length > 0 && (
        <div>
          <h2>Parsed Data:</h2>
          <pre>{JSON.stringify(parsedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default UploadCSV;
