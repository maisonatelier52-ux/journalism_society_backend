// scripts/hash-password.js
import bcrypt from "bcryptjs";

const password = "admin123"; // Change this to your desired password
const saltRounds = 10;

const hash = bcrypt.hashSync(password, saltRounds);
console.log("Hashed password:", hash);
console.log("\nAdd this to your .env file:");
console.log(`ADMIN_PASSWORD_HASH=${hash}`);