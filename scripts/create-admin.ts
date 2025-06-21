import { db } from "../src/server/db";
import { hashPassword } from "../src/lib/auth";

(async () => {
  const email = "anmol.s.sahoo@gmail.com";
  const plainPassword = "admin123";

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.error("User not found");
    return;
  }

  const hashed = await hashPassword(plainPassword);

  const updated = await db.user.update({
    where: { email },
    data: { password: hashed },
  });

  console.log("Password updated for:", updated.email);
})();
