import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if we have a test PDF file
const testPdfPath = path.join(__dirname, "test.pdf");
console.log("Looking for test PDF at:", testPdfPath);

if (!fs.existsSync(testPdfPath)) {
  console.log("Test PDF not found. Please place a test.pdf file in the backend directory.");
  process.exit(1);
}

console.log("Test PDF exists, proceeding with upload test...");

// Create form data using FormData from node-fetch or form-data package
import FormData from "form-data";
const formData = new FormData();
formData.append("pdf", fs.createReadStream(testPdfPath));

// Add other fields as JSON
const paperData = {
  title: "Test Paper",
  slug: "test-paper",
  description: "Test paper for PDF processing",
  category: null, // Using "none" option
  scheduleDate: new Date().toISOString(),
  isPublished: true,
};

formData.append("data", JSON.stringify(paperData));

// Send the request
axios.post("http://localhost:5001/api/epaper/papers", formData, {
  headers: {
    ...formData.getHeaders(),
    "x-api-key": "ak_b1726a850cc1adc3ef5f93a31fdcacb8a18aab7a9d747bd9", // Using valid API key from existing client
  },
})
.then(response => {
  console.log("Upload successful:", response.data);
})
.catch(error => {
  console.error("Upload failed:", error.response?.data || error.message);
});