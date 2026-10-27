PED SAN combined admin panel

This is a combined version of the user's provided panel plus user/subscription management.

Before publishing:
1. Keep your Firebase Web App config from your original file.
2. Replace ADMIN_UID = "PUT_REAL_ADMIN_UID_HERE" with the actual manager UID confirmed in Firebase Authentication.
3. Set RTDB rules to authorize admin-only writes to /users, /messages, and /settings/button1_enabled. Do not publish broad public write permissions.
4. Confirm the app's data schema and current rules before deploying.
5. Username-only login and physical-device uniqueness are NOT secure merely because the UI checks a username. Secure one-device enforcement and same-phone recovery after reinstall require app-side device identity plus trusted server-side validation. The admin panel's reset-device action only clears stored fields; it does not prove device identity.
6. Ensure app's login screen reads /users/{username}, checks disabled and expiresAt, and reads /settings/button1_enabled before enabling button1.
