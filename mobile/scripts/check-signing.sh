#!/usr/bin/env bash
# Verify Play upload signing is configured and matches the expected upload key.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ANDROID="$ROOT/mobile/android"
KEYSTORE_PROPS="$ANDROID/keystore.properties"
KEYSTORE="$ROOT/mobile/loopgallery-release.keystore"
EXPECTED_SHA1="3E:4E:B5:FB:14:E7:F9:EB:FA:E6:93:04:E9:B7:4D:E7:0C:6E:BB:BF"
DEBUG_SHA1="D7:B6:5F:48:30:23:CE:99:7B:4C:1B:44:54:EC:CB:FF:8C:D6:D7:4F"
DOC="$ROOT/mobile/ANDROID_BUILD.md"

normalize_sha() {
  echo "${1//:/}" | tr '[:lower:]' '[:upper:]'
}

EXPECTED_NORM="$(normalize_sha "$EXPECTED_SHA1")"

echo "LoopGallery Android signing check"
echo "================================="
echo "Docs: mobile/ANDROID_BUILD.md"
echo ""

if [[ ! -f "$KEYSTORE" ]]; then
  echo "FAIL: missing $KEYSTORE"
  echo "      Copy from another machine — see $DOC"
  exit 1
fi
echo "OK:   upload keystore file exists"

if [[ ! -f "$KEYSTORE_PROPS" ]]; then
  echo "FAIL: missing $KEYSTORE_PROPS"
  echo "      cp mobile/android/keystore.properties.example mobile/android/keystore.properties"
  exit 1
fi
echo "OK:   keystore.properties exists"

store_file="$(grep -E '^storeFile=' "$KEYSTORE_PROPS" | cut -d= -f2-)"
store_pass="$(grep -E '^storePassword=' "$KEYSTORE_PROPS" | cut -d= -f2-)"
key_alias="$(grep -E '^keyAlias=' "$KEYSTORE_PROPS" | cut -d= -f2-)"

if [[ -z "$store_file" || -z "$store_pass" || -z "$key_alias" ]]; then
  echo "FAIL: keystore.properties is missing storeFile, storePassword, or keyAlias"
  exit 1
fi

resolved="$ANDROID/$store_file"
if [[ ! -f "$resolved" ]]; then
  resolved="$ROOT/mobile/$store_file"
fi
if [[ ! -f "$resolved" ]]; then
  resolved="$(cd "$ANDROID" && cd "$(dirname "$store_file")" 2>/dev/null && pwd)/$(basename "$store_file")"
fi
if [[ ! -f "$resolved" ]]; then
  echo "FAIL: keystore path from storeFile not found: $store_file"
  exit 1
fi

sha1="$(keytool -list -v -keystore "$resolved" -alias "$key_alias" -storepass "$store_pass" 2>/dev/null | awk -F': ' '/SHA1:/{print $2; exit}')"
if [[ -z "$sha1" ]]; then
  echo "FAIL: could not read keystore (wrong password or alias?)"
  exit 1
fi

echo "OK:   keystore opens with configured alias ($key_alias)"
echo "      SHA-1: $sha1"

if [[ "$(normalize_sha "$sha1")" == "$EXPECTED_NORM" ]]; then
  echo ""
  echo "PASS: upload key matches Play Console (safe for npm run mobile:release)"
elif [[ "$(normalize_sha "$sha1")" == "$(normalize_sha "$DEBUG_SHA1")" ]]; then
  echo ""
  echo "FAIL: this is the DEBUG keystore — use loopgallery-release.keystore for Play uploads"
  exit 1
else
  echo ""
  echo "WARN: SHA-1 does not match the known LoopGallery upload key"
  echo "      Expected: $EXPECTED_SHA1"
  exit 1
fi

if [[ -f "$ROOT/mobile/dist/LoopGallery-release.aab" ]]; then
  aab_sha="$(keytool -printcert -jarfile "$ROOT/mobile/dist/LoopGallery-release.aab" 2>/dev/null | awk -F': ' '/SHA1:/{print $2; exit}')"
  if [[ -n "$aab_sha" ]]; then
    echo ""
    echo "Latest AAB (mobile/dist/LoopGallery-release.aab):"
    echo "      SHA-1: $aab_sha"
    if [[ "$(normalize_sha "$aab_sha")" == "$EXPECTED_NORM" ]]; then
      echo "      OK for Play upload"
    else
      echo "      WRONG for Play — rebuild with npm run mobile:release"
      exit 1
    fi
  fi
fi
