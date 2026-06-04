#!/usr/bin/env bash
# Build a sideloadable debug APK (loads https://loopgallery.a-u.us in the WebView).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MOBILE="$ROOT/mobile"
ANDROID="$MOBILE/android"
JDK_HOME="${JAVA_HOME:-$MOBILE/.jdk/jdk-21.0.7+6/Contents/Home}"
ANDROID_SDK="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"

if [[ ! -d "$JDK_HOME" ]]; then
  echo "JDK 21 not found at $JDK_HOME"
  echo "Install Temurin 21, or run once:"
  echo "  mkdir -p $MOBILE/.jdk && cd $MOBILE/.jdk"
  echo "  curl -fsSL -o jdk21.tar.gz https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.7%2B6/OpenJDK21U-jdk_aarch64_mac_hotspot_21.0.7_6.tar.gz"
  echo "  tar -xzf jdk21.tar.gz"
  exit 1
fi

if [[ ! -f "$ANDROID/local.properties" ]]; then
  echo "sdk.dir=$ANDROID_SDK" > "$ANDROID/local.properties"
fi

export JAVA_HOME="$JDK_HOME"
export ANDROID_HOME="$ANDROID_SDK"

echo "→ Capacitor sync"
npm run mobile:sync --prefix "$ROOT"

echo "→ Gradle assembleDebug"
cd "$ANDROID"
./gradlew assembleDebug

APK="$ANDROID/app/build/outputs/apk/debug/app-debug.apk"
OUT="$MOBILE/dist/LoopGallery-debug.apk"
mkdir -p "$MOBILE/dist"
cp "$APK" "$OUT"
echo ""
echo "APK ready:"
echo "  $OUT"
ls -lh "$OUT"
