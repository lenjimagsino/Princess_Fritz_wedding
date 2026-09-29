# Firebase owner access setup

Owner sign-in uses Firebase Authentication. Do not store an owner password in this repository.

1. In Firebase Console, enable Email/Password under Authentication > Sign-in method and create the owner account there.
2. Under Authentication > Settings > Authorized domains, add `lenjimagsino.github.io` if it is not already listed. Keep `localhost` for local development.
3. Under Realtime Database > Rules, publish the rules from `database.rules.json`.
4. In Realtime Database > Data, add `/owners/<OWNER_UID>` with the boolean value `true`. Find the UID on the owner's row under Authentication > Users. The client cannot write to `/owners`.

Guests can read wishes and submit new ones. Only an authenticated UID listed under `/owners` can edit or delete them. Test the rules in Firebase Console before relying on owner controls in production.