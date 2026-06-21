#!/usr/bin/env bash
# Scan for Android keystores and print SHA-1 fingerprints.
# Set EXPECTED_SHA1 to flag the Play Console upload key (colon-separated).
#
#   EXPECTED_SHA1='3E:4E:B5:FB:14:E7:F9:EB:FA:E6:93:04:E9:B7:4D:E7:0C:6E:BB:BF' \
#     bash mobile/scripts/find-upload-keystore.sh ~/fore ~/Downloads
#
# With no paths, scans ~/fore and the repo mobile/ folder.
set -euo pipefail

EXPECTED_SHA1="${EXPECTED_SHA1:-3E:4E:B5:FB:14:E7:F9:EB:FA:E6:93:04:E9:B7:4D:E7:0C:6E:BB:BF}"
EXPECTED_NORM="$(echo "${EXPECTED_SHA1//:/}" | tr '[:lower:]' '[:upper:]')"

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
JAVA_HOME="${JAVA_HOME:-$ROOT/mobile/.jdk/jdk-21.0.7+6/Contents/Home}"
if [[ -x "$JAVA_HOME/bin/keytool" ]]; then
  KEYTOOL="$JAVA_HOME/bin/keytool"
elif command -v keytool >/dev/null 2>&1; then
  KEYTOOL="$(command -v keytool)"
else
  echo "ERROR: keytool not found. Set JAVA_HOME or install JDK 17+."
  exit 1
fi

PASSWORDS=(android '' loopgallery upload release loop-gallery password 123456)
ALIASES=(androiddebugkey loopgallery upload key0 release mykey)

if [[ $# -gt 0 ]]; then
  SCAN_ROOTS=("$@")
else
  SCAN_ROOTS=("$HOME/fore" "$ROOT/mobile")
fi

normalize_sha() {
  echo "${1//:/}" | tr '[:lower:]' '[:upper:]'
}

match_expected() {
  [[ "$(normalize_sha "$1")" == "$EXPECTED_NORM" ]]
}

echo "Play upload key SHA-1 (expected): $EXPECTED_SHA1"
echo "Scan roots: ${SCAN_ROOTS[*]}"
echo ""

FOUND_MATCH=0
FOUND_ANY=0

while IFS= read -r -d '' keystore; do
  [[ -f "$keystore" ]] || continue
  FOUND_ANY=1
  echo "── $keystore"

  opened=0
  for pass in "${PASSWORDS[@]}"; do
    mapfile -t entries < <("$KEYTOOL" -list -keystore "$keystore" -storepass "$pass" 2>/dev/null | awk -F, '/PrivateKeyEntry|SecretKeyEntry/ {gsub(/^ +| +$/,"",$1); print $1}')
    [[ ${#entries[@]} -gt 0 ]] || continue
    opened=1

    for alias in "${entries[@]}"; do
      [[ -n "$alias" ]] || continue
      info=$("$KEYTOOL" -list -v -keystore "$keystore" -alias "$alias" -storepass "$pass" 2>/dev/null || true)
      sha1=$(echo "$info" | awk -F': ' '/SHA1:/{print $2; exit}')
      sha256=$(echo "$info" | awk -F': ' '/SHA256:/{print $2; exit}')
      [[ -n "$sha1" ]] || continue

      label=""
      if match_expected "$sha1"; then
        label="  *** MATCH — use this upload keystore ***"
        FOUND_MATCH=1
      fi

      echo "  alias: $alias  password: ${pass:-<empty>}"
      echo "  SHA-1:  $sha1$label"
      [[ -n "$sha256" ]] && echo "  SHA-256: $sha256"
    done
    break
  done

  if [[ "$opened" -eq 0 ]]; then
    echo "  (could not open — unknown password; try manually with keytool -list -v)"
  fi
  echo ""
done < <(find "${SCAN_ROOTS[@]}" -type f \( -name '*.keystore' -o -name '*.jks' \) ! -path '*/node_modules/*' -print0 2>/dev/null)

if [[ "$FOUND_ANY" -eq 0 ]]; then
  echo "No .keystore or .jks files found under scan roots."
  exit 1
fi

if [[ "$FOUND_MATCH" -eq 1 ]]; then
  echo "Next: copy the matching file to mobile/loopgallery-release.keystore,"
  echo "      update mobile/android/keystore.properties, then: npm run mobile:release"
  exit 0
fi

echo "No keystore matched the Play upload key SHA-1."
echo "Search your other machine (Android Studio, Downloads) for *.jks / *.keystore,"
echo "or request an upload key reset in Play Console → App integrity."
exit 2
