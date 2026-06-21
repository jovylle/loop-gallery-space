#!/usr/bin/env bash
# Build a signed (or unsigned) release AAB for Google Play.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ANDROID="$ROOT/mobile/android"
KEYSTORE_PROPS="$ANDROID/keystore.properties"
GS_JSON="$ANDROID/app/google-services.json"
JDK_HOME="${JAVA_HOME:-$ROOT/mobile/.jdk/jdk-21.0.7+6/Contents/Home}"
ANDROID_SDK="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"

export JAVA_HOME="$JDK_HOME"
export ANDROID_HOME="$ANDROID_SDK"
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/opt/node@20/bin:$PATH"

if [[ ! -f "$GS_JSON" ]]; then
  echo "ERROR: missing $GS_JSON"
  echo "Download from Firebase → Android app (us.a_u.loopgallery.app) and re-run."
  exit 1
fi

echo "→ Capacitor sync"
npm run mobile:sync --prefix "$ROOT"

if [[ ! -f "$KEYSTORE_PROPS" ]]; then
  echo ""
  echo "Release signing not configured (building UNSIGNED AAB)."
  echo "For updates after first Play upload you need the same upload keystore:"
  echo "  1. keytool -genkey -v -keystore $ROOT/mobile/loopgallery-release.keystore \\"
  echo "       -alias loopgallery -keyalg RSA -keysize 2048 -validity 10000"
  echo "  2. cp mobile/android/keystore.properties.example mobile/android/keystore.properties"
  echo "  3. Re-run: npm run mobile:release"
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
echo "Play Console → Production → Create new release → Upload:"
echo "  $OUT"
ls -lh "$OUT"
echo ""
echo "Before publishing, add Play App Signing SHA-1 to Firebase (if not already):"
echo "  Play Console → App integrity → App signing key certificate → SHA-1"
echo "  Firebase → Project settings → Android app → Add fingerprint → re-download google-services.json"
