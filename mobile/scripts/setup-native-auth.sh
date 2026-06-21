#!/usr/bin/env bash
# One-time setup for native Google Sign-In in the LoopGallery Android APK.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ANDROID_APP="$ROOT/mobile/android/app"
GS_JSON="$ANDROID_APP/google-services.json"
PACKAGE="us.a_u.loopgallery.app"
PROJECT_ID="loopgallery-9a4d7"

echo "LoopGallery — native Google Sign-In setup"
echo "========================================="
echo ""

echo "1) Debug keystore SHA-1 (add in Firebase → Project settings → Android app):"
if keytool -list -v -keystore "$HOME/.android/debug.keystore" -alias androiddebugkey -storepass android 2>/dev/null | rg "SHA1:"; then
  :
else
  echo "   (debug keystore not found — run Android Studio once or: sdkmanager + avd)"
fi
echo ""
echo "   Play Store APK: Play Console → App integrity → App signing → SHA-1"
echo ""

if [[ -f "$GS_JSON" ]]; then
  echo "2) google-services.json: OK ($GS_JSON)"
  if rg -q "$PACKAGE" "$GS_JSON" && rg -q "$PROJECT_ID" "$GS_JSON"; then
    echo "   package + project look correct"
  else
    echo "   WARN: file may be for a different app/project"
  fi
else
  echo "2) google-services.json: MISSING"
  echo ""
  echo "   Firebase Console → $PROJECT_ID → Project settings → Your apps"
  echo "   → Add Android app → package $PACKAGE"
  echo "   → paste SHA-1 above → Download google-services.json"
  echo "   → save to: mobile/android/app/google-services.json"
  echo ""
  echo "   Also enable: Authentication → Sign-in method → Google"
  exit 1
fi

echo ""
echo "3) Sync + build debug APK…"
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/opt/node@20/bin:$PATH"
bash "$ROOT/mobile/scripts/build-apk.sh"
echo ""
echo "Install on device/emulator:"
echo "  adb install -r $ROOT/mobile/dist/LoopGallery-debug.apk"
echo ""
echo "Test: open app → Login → Continue with Google"
echo "  • Native picker = setup OK"
echo "  • Chrome tab = missing SHA-1 or google-services.json — rebuild after fixing"
