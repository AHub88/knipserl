/**
 * Einmaliges Setup: generiert ein VAPID-Keypair für Web-Push.
 * Ausgabe ins Terminal — Keys in .env einsetzen:
 *   VAPID_PUBLIC_KEY=...
 *   VAPID_PRIVATE_KEY=...
 *   VAPID_SUBJECT=mailto:info@deinedomain.de
 */
const webpush = require("web-push");
const keys = webpush.generateVAPIDKeys();
console.log("VAPID_PUBLIC_KEY=" + keys.publicKey);
console.log("VAPID_PRIVATE_KEY=" + keys.privateKey);
console.log("VAPID_SUBJECT=mailto:info@knipserl.de");
