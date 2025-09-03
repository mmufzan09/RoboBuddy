// // controllers/arduino.js
// import { SerialPort } from "serialport";
// import { ReadlineParser } from "@serialport/parser-readline";

// let port = null;
// let parser = null;
// let isConnected = false;

// // ✅ Connect to Arduino
// export const connectArduino = (comPort = "COM3", baudRate = 9600) => {
//   if (isConnected) {
//     console.log("⚠️ Arduino already connected.");
//     return;
//   }

//   try {
//     port = new SerialPort({
//       path: comPort,
//       baudRate,
//     });

//     parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

//     port.on("open", () => {
//       isConnected = true;
//       console.log(`✅ Arduino connected on ${comPort}`);
//     });

//     port.on("error", (err) => {
//       console.error("❌ Arduino Error:", err.message);
//       isConnected = false;
//     });

//     parser.on("data", (data) => {
//       console.log("📥 From Arduino:", data);
//     });
//   } catch (error) {
//     console.error("⚠️ Failed to connect Arduino:", error.message);
//   }
// };

// // ✅ Send message to Arduino
// export const sendToArduino = (message) => {
//   if (port && isConnected) {
//     port.write(message + "\n", (err) => {
//       if (err) {
//         console.error("❌ Error writing to Arduino:", err.message);
//       } else {
//         console.log("📤 Sent to Arduino:", message);
//       }
//     });
//   } else {
//     console.log("⚠️ Cannot send, Arduino not connected!");
//   }
// };
