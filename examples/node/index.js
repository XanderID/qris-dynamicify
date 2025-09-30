/** ESM usage
import { fromFile } from "qris-dynamicify";
import path from "path";
*/

// CommonJS usage
const { fromFile } = require("qris-dynamicify");
const path = require("path");

// This is a placeholder for a real QRIS image file.
// To run this example, you need a file named 'static-qris.png' with a valid QRIS code.
const filePath = path.resolve(__dirname, "static-qris.png");

console.log(`Attempting to read QRIS from: ${filePath}`);

fromFile(filePath)
  .then((dynamicQris) => {
    console.log("Successfully parsed QRIS from file.");
    const metadata = dynamicQris.getMetadata();
    console.log("Original Metadata:", metadata);

    dynamicQris.setPrice(15000).setTax("10%");

    const newMetadata = dynamicQris.getMetadata();
    console.log("Updated Metadata:", newMetadata);

    console.log("Dynamic QRIS string:", dynamicQris.toString());

    // Save the new dynamic QRIS to a file
    const outputPath = path.resolve(__dirname, "dynamic-qris.png");
    return dynamicQris.writeToFile(outputPath);
  })
  .then((outputPath) => {
    console.log(`Dynamic QRIS image saved to: ${outputPath}`);
  })
  .catch((error) => {
    console.error("Error processing QRIS file:", error);
  });
