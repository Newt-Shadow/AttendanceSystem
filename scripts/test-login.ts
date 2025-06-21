// scripts/test-login.ts
import { login } from "../src/lib/auth";

(async () => {
  try {
    const result = await login("anmol.s.sahoo@gmail.com", "admin123");
    console.log("Login success", result);
  } catch (e) {
    console.error("Manual test login failed:", e);
  }
})();
