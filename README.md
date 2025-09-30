# qris-dynamicify

**qris-dynamicify** is a powerful and lightweight Node.js library for effortlessly transforming static QRIS (Quick Response Code Indonesian Standard) into dynamic QRIS. This tool is designed for developers and businesses in Indonesia who need to generate transaction-specific QR codes with dynamic amounts, streamlining the payment process for modern applications.

The project solves the problem of static, non-specific QRIS codes by allowing you to programmatically inject transaction details like price and taxes, making the payment experience seamless for both merchants and customers.

## Key Features

- **Static to Dynamic Conversion**: Convert any valid static QRIS string or image into a dynamic one.
- **Set Transaction Amount**: Easily set a specific price for the transaction.
- **Add Tax/Service Fee**: Include nominal or percentage-based taxes and fees.
- **QRIS Metadata Extraction**: Parse and retrieve merchant information from any QRIS code.
- **Multiple Input formats**: Accepts QRIS data from a raw string or an image file (`.png`, `.jpg`).
- **Flexible Output**: Generate a dynamic QRIS as a raw string or save it directly as a QR code image.
- **Modern and Type-Safe**: Written in TypeScript for a better development experience.
- **Lightweight**: Minimal dependencies to keep your project lean.

## Installation

You can install `qris-dynamicify` via npm or yarn.

### via npm

```bash
npm install qris-dynamicify
```

### via yarn

```bash
yarn add qris-dynamicify
```

### via browser (CDN)

```html
<script src="https://unpkg.com/qris-dynamicify@1.1.0/dist/browser/qris-dynamicify.js"></script>
```

## Usage Instructions

Here’s how to get started with `qris-dynamicify`. The library supports both ES Module (import) and CommonJS (require) syntax.

### Basic Example: From a Static QRIS String

```javascript
// ES Module (Recommended for modern projects and environments)
import { fromString } from "qris-dynamicify";
import fs from "fs";

/* // CommonJS (Use this if your project relies on require())
const { fromString } = require("qris-dynamicify");
const fs = require("fs"); 
*/

// A static QRIS string (replace with your actual static QRIS)
const staticQris =
  "00020101021126590013ID.CO.GOPAY.WWW021500000000000000000303UKE51450014ID.CO.GOPAY.MERCHANT02151234567890123450303UKE5204581253033605802ID5917MERCHANT NATIONAL6011JAKARTA SEL61051215062070703A01";

async function generateDynamicQris() {
  try {
    const dynamicQris = await fromString(staticQris);

    // Set the price and tax
    dynamicQris.setPrice(50000).setTax("10%"); // 50,000 IDR with 10% tax

    // Get the final dynamic QRIS string
    const dynamicQrisString = dynamicQris.toString();
    console.log("Dynamic QRIS String:", dynamicQrisString);

    // Save the dynamic QRIS as a PNG image
    await dynamicQris.writeToFile("dynamic-qris.png");
    console.log("Successfully generated dynamic-qris.png");
  } catch (error) {
    console.error("Error generating dynamic QRIS:", error);
  }
}

generateDynamicQris();
```

### Example: From a QRIS Image File

```javascript
// ES Module
import { fromFile } from "qris-dynamicify";

/*
// CommonJS
const { fromFile } = require("qris-dynamicify");
*/

async function generateFromImage() {
  try {
    const dynamicQris = await fromFile("path/to/your/static-qris.png");

    // Set a price and a fixed tax amount
    dynamicQris.setPrice(125000).setTax(5000); // 125,000 IDR with 5,000 IDR tax

    // Save the new QR code
    await dynamicQris.writeToFile("new-dynamic-qris.png");
    console.log("Successfully generated new-dynamic-qris.png from image.");
  } catch (error) {
    console.error("Error:", error);
  }
}

generateFromImage();
```

### Example: Browser Usage

Besides Node.js, **qris-dynamicify** also works directly in the browser.  
This is useful if you want to let users upload their static QRIS image and generate a dynamic QRIS instantly on the client side.

For working demos, please check the [examples/browser](https://github.com/XanderID/qris-dynamicify/tree/main/examples/browser) folder in this repository.

## API Documentation

The main entry points are `fromString` and `fromFile`, which return a `DynamicQris` instance.

### `fromString(staticQris: string): Promise<DynamicQris>`

- **Description**: Creates a `DynamicQris` instance from a static QRIS string.
- **Parameters**:
  - `staticQris` (string): The raw static QRIS data.
- **Returns**: A `Promise` that resolves to a `DynamicQris` instance.

### `fromFile(input: string | File | Blob | HTMLImageElement | HTMLCanvasElement): Promise<DynamicQris>`

- **Description**: Creates a `DynamicQris` instance from various sources.
- **Parameters**:
  - `input`:
    - **Node.js**: A file path (`string`) pointing to an image file (`.png`, `.jpg`) or a `Blob`.
    - **Browser**: Can be a `File`, `Blob`, `HTMLImageElement`, or `HTMLCanvasElement`.
- **Returns**: A `Promise` that resolves to a `DynamicQris` instance.

### `DynamicQris` Class

An instance of this class is returned by the factory functions.

#### `setPrice(price: number): this`

- **Description**: Sets the transaction amount.
- **Parameters**:
  - `price` (number): The transaction amount in your currency (e.g., IDR).
- **Returns**: The `DynamicQris` instance for method chaining.

#### `setTax(tax: number | string): this`

- **Description**: Sets the tax or service fee.
- **Parameters**:
  - `tax` (number | string): The tax amount. Can be a fixed number (e.g., `1000`) or a percentage string (e.g., `'10%'`).
- **Returns**: The `DynamicQris` instance for method chaining.

#### `getMetadata(): QrisMetadata`

- **Description**: Extracts and returns metadata from the QRIS code.
- **Returns**: An object `QrisMetadata` containing details like merchant name, city, etc.

#### `writeToFile(filePath: string, options?: QRCodeToFileOptions): Promise<string>`

- **Description**: Saves the generated dynamic QRIS to a file.
- **Parameters**:
  - `filePath` (string): The destination file path. Supports `.png`, `.jpg`, and `.txt`.
  - `options` (object, optional): Options for QR code generation (from the `qrcode` library).
- **Returns**: A `Promise` that resolves with the file path.

### `writeToDataURL(options?: QRCodeToDataURLOptions): Promise<string>`

- **Description**: Generates the current QRIS as a **Base64 data URL** (Browser only).  
  Useful for embedding directly into an `<img src="...">` tag, Canvas, or downloading as an image.
- **Parameters**:
  - `options` (object, optional): QR code rendering options from the [`qrcode`](https://github.com/soldair/node-qrcode) library (e.g., `margin`, `width`, `color`, etc.).
- **Returns**: A `Promise` that resolves to a Base64-encoded string representing the QR image.

#### `toString(): string`

- **Description**: Returns the final, raw dynamic QRIS string.
- **Returns**: The dynamic QRIS string.

## Contribution Guide

We welcome contributions! Please follow these steps:

1. **Fork the repository**: Click the 'Fork' button at the top right of this page.
2. **Clone your fork**:

   ```bash
   git clone https://github.com/YOUR_USERNAME/qris-dynamicify.git
   ```

3. **Create a new branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**: Implement your feature or fix the bug.
5. **Commit your changes**:

   ```bash
   git commit -m "feat: Add some amazing feature"
   ```

6. **Push to your branch**:

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**: Open a pull request from your fork to the main repository.

## Roadmap

- [ ] CLI tool for quick conversions from the terminal.
- [x] Browser-compatible version.
- [ ] Add more examples and detailed documentation.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

This project relies on the following open-source libraries:

- [jimp](https://github.com/oliver-moran/jimp)
- [jsqr](https://github.com/cozmo/jsQR)
- [qrcode](https://github.com/soldair/node-qrcode)

## FAQ

**Q: What is the difference between static and dynamic QRIS?**
**A:** A static QRIS contains only the merchant's information. The customer has to manually input the transaction amount. A dynamic QRIS is generated for a single transaction and includes the amount, making the payment process faster and less error-prone.

**Q: Can I use this for any QRIS code from any provider?**
**A:** Yes, this library should work with any valid QRIS code that complies with the Bank Indonesia standard.

## Why this project?

In the rapidly growing digital economy of Indonesia, QRIS has become a ubiquitous payment method. However, many smaller businesses still rely on static QRIS displays, which require manual entry of payment amounts. This can be slow and prone to errors. `qris-dynamicify` was created to bridge this gap, providing developers with a simple, powerful tool to integrate dynamic QRIS generation into their applications. Whether you're building a POS system, an e-commerce platform, or a donation portal, this library helps you create a smoother, more professional payment experience.
