// Passwort-Generierung für Fahrer-Accounts.
// Web Crypto API ist sowohl im Browser als auch in Node (≥15) verfügbar — ein
// Helper für beide Welten. Charset ist "verwechslungsarm": kein 0/O/o, kein
// 1/I/l, dafür ein paar Sonderzeichen für Robustheit.

const PASSWORD_CHARSET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!#$%&*+=?";

export function generatePassword(length = 12): string {
  const arr = new Uint8Array(length);
  globalThis.crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PASSWORD_CHARSET[arr[i] % PASSWORD_CHARSET.length];
  }
  return out;
}

export function isPasswordStrongEnough(pw: string): boolean {
  return typeof pw === "string" && pw.length >= 8;
}
