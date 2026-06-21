#!/usr/bin/env bash
# Build a signed (or unsigned) release AAB for Google Play.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ANDROID="$ROOT/mobile/android"
KEYSTORE_PROPS="$ANDROID/keystore.properties"
GS_JSON="$ANDROID/app/google-services.json"
BUNDLED_JDK="$ROOT/mobile/.jdk/jdk-21.0.7+6/Contents/Home"
SYSTEM_JDK="/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home"
if [[ -n "${JAVA_HOME:-}" && -d "$JAVA_HOME" ]]; then
  JDK_HOME="$JAVA_HOME"
elif [[ -d "$BUNDLED_JDK" ]]; then
  JDK_HOME="$BUNDLED_JDK"
elif [[ -d "$SYSTEM_JDK" ]]; then
  JDK_HOME="$SYSTEM_JDK"
else
  echo "ERROR: JDK 21 not found. Install Temurin 21 or set JAVA_HOME."
  exit 1
fi
ANDROID_SDK="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"

export JAVA_HOME="$JDK_HOME"
export ANDROID_HOME="$ANDROID_SDK"
# Prefer the caller's Node (e.g. nvm). Homebrew node@20 can break on icu4c upgrades.
if [[ -z "${NODE_BIN_DIR:-}" ]]; then
  NODE_BIN_DIR="$(dirname "$(command -v node)")"
fi
export PATH="$NODE_BIN_DIR:$PATH"

if [[ ! -f "$GS_JSON" ]]; then
  echo "WARN: missing $GS_JSON — native Google Sign-In will not work in this build."
  echo "      Custom Tab OAuth still works (app loads https://loopgallery.a-u.us)."
  echo "      Download from Firebase → Android app (us.a_u.loopgallery.app) for native sign-in."
  echo ""
fi

echo "→ Capacitor sync"
npm run mobile:sync --prefix "$ROOT"

if [[ ! -f "$KEYSTORE_PROPS" ]]; then
  echo ""
  echo "Release signing not configured (building UNSIGNED AAB)."
  echo "See mobile/ANDROID_BUILD.md — copy loopgallery-release.keystore + keystore.properties"
  echo "from another machine, then: npm run mobile:check-signing && npm run mobile:release"
  echo ""
fi

if [[ ! -f "$ANDROID/local.properties" ]]; then
  echo "sdk.dir=$ANDROID_SDK" > "$ANDROID/local.properties"
fi

echo "→ Gradle bundleRelease"
cd "$ANDROID"
./gradlew bundleRelease

AAB="$ANDROID/app/build/outputs/bundle/release/app-release.aab"
OUT="$ROOT/mobile/dist/LoopGallery-release.aab"
mkdir -p "$ROOT/mobile/dist"

if [[ ! -f "$AAB" ]]; then
  echo "Expected AAB not found at $AAB"
  exit 1
fi

cp "$AAB" "$OUT"
echo ""
echo "Play Console → Testing → Closed testing → Create new release → Upload:"
echo "  $OUT"
ls -lh "$OUT"
echo ""
echo "Before publishing, add Play App Signing SHA-1 to Firebase (if not already):"
echo "  Play Console → App integrity → App signing key certificate → SHA-1"
echo "  Firebase → Project settings → Android app → Add fingerprint → re-download google-services.json"
