import { loginUser, registerUser } from "./server/auth";

async function test() {
  try {
    console.log("Trying to register...");
    const token = await registerUser("Admin", "admin@safarix.com", "admin123");
    console.log("Registered successfully. Token:", token);
  } catch (err: any) {
    console.error("Register failed:", err.message);
  }

  try {
    console.log("Trying to login...");
    const token = await loginUser("admin@safarix.com", "admin123");
    console.log("Logged in successfully. Token:", token);
  } catch (err: any) {
    console.error("Login failed:", err.message);
  }
  
  process.exit(0);
}

test();
