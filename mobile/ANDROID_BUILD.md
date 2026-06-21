# Android builds (APK & Play AAB)

The Capacitor shell loads **`https://loopgallery.a-u.us`** in a WebView. Most app changes ship via the website deploy — you only need a new native build when Android packaging, plugins, or signing inputs change.

## Quick reference

| Goal | Command | Output | Signing cert |
|------|---------|--------|--------------|
| **Play closed testing / production** | `npm run mobile:release` | `mobile/dist/LoopGallery-release.aab` | Upload key (`3E:4E:B5:…`) |
| **Sideload on your phone** | `npm run mobile:apk` | `mobile/dist/LoopGallery-debug.apk` | Debug key (`D7:B6:5F:…`) — **never upload to Play** |

Check signing before a Play upload:

```bash
npm run mobile:check-signing
```

## New machine setup (required for correct AAB)

`git pull` gives you scripts and source code. It does **not** include signing files (gitignored). Copy these from a machine that already builds Play releases:

| File | Purpose |
|------|---------|
| `mobile/loopgallery-release.keystore` | Play **upload** key — must match the first closed-test upload |
| `mobile/android/keystore.properties` | Passwords + path to the keystore above |
| `mobile/android/app/google-services.json` | Optional — native Google Sign-In (Custom Tab OAuth works without it) |

Store the keystore and passwords in 1Password (or similar). Do **not** commit them.

One-time on the new machine:

```bash
git pull
npm install
npm run mobile:install
npm run mobile:check-signing   # should report upload key OK
```

You also need **JDK 21**, **Android SDK**, and **Node** (nvm is fine). The release script uses system Temurin 21 when `mobile/.jdk` is not present.

Portable copy from an existing machine:

```bash
zip -j loopgallery-signing.zip \
  mobile/loopgallery-release.keystore \
  mobile/android/keystore.properties
```

Unzip into the repo root on the other machine, then verify with `npm run mobile:check-signing`.

## Play upload key vs debug key

Play Console expects every update signed with the **same upload key** as the first release.

| Certificate | SHA-1 (LoopGallery) | Used for |
|-------------|---------------------|----------|
| **Upload key** | `3E:4E:B5:FB:14:E7:F9:EB:FA:E6:93:04:E9:B7:4D:E7:0C:6E:BB:BF` | `npm run mobile:release` → `.aab` uploads |
| **Debug key** | `D7:B6:5F:48:30:23:CE:99:7B:4C:1B:44:54:EC:CB:FF:8C:D6:D7:4F` | `npm run mobile:apk` → local testing only |

If Play says *“signed with the wrong key”*, you uploaded a debug build or an AAB from a machine missing `keystore.properties`. Rebuild with `npm run mobile:release` and confirm SHA-1 before upload:

```bash
keytool -printcert -jarfile mobile/dist/LoopGallery-release.aab | grep SHA1
```

## `google-services.json` (Firebase)

**Not required for Play to accept an AAB.** It only enables native Google account picker via `@capacitor-firebase/authentication`.

Without it, sign-in still works through Custom Tab OAuth (`/auth/mobile` → live site).

To add native sign-in:

1. Firebase Console → **loopgallery-9a4d7** → Project settings → Android app `us.a_u.loopgallery.app`
2. Download `google-services.json` → `mobile/android/app/google-services.json`
3. `npm run mobile:release`

See also `mobile/.env.example` and `npm run mobile:native-auth`.

## Upload to Play (closed testing)

1. `npm run mobile:release`
2. [Play Console](https://play.google.com/console) → **LoopGallery** → **Testing** → **Closed testing** → **Create new release**
3. Upload `mobile/dist/LoopGallery-release.aab`
4. Release notes → **Review release**

Template `keystore.properties`: `mobile/android/keystore.properties.example`  
Find a matching keystore on disk: `npm run mobile:find-keystore -- ~/fore ~/Downloads`

## Version bumps

Edit `versionCode` / `versionName` in `mobile/android/app/build.gradle` before each Play upload (`versionCode` must increase every time).
