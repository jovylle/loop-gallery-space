#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ANDROID="$ROOT/mobile/android"
KEYSTORE_PROPS="$ANDROID/keystore.properties"

echo "→ Sync Capacitor"
npm run mobile:sync --prefix "$ROOT"

if [[ ! -f "$KEYSTORE_PROPS" ]]; then
  echo ""
  echo "Release signing not configured."
  echo "1. Create a keystore (one time):"
  echo "   keytool -genkey -v -keystore $ROOT/mobile/loopgallery-release.keystore \\"
  echo "     -alias loopgallery -keyalg RSA -keysize 2048 -validity 10000"
  echo "2. Copy mobile/android/keystore.properties.example → mobile/android/keystore.properties"
  echo "3. Re-run: npm run mobile:release"
  echo ""
  echo "Building UNSIGNED release AAB (Play Console can sign for you on first upload)…"
fi

cd "$ANDROID"
./gradlew bundleRelease

AAB="$ANDROID/app/build/outputs/bundle/release/app-release.aab"
if [[ -f "$AAB" ]]; then
  echo ""
  echo "Upload this file to Google Play Console → Production → Create release:"
  echo "  $AAB"
  ls -lh "$AAB"
else
  echo "Expected AAB not found at $AAB"
  exit 1
fi
