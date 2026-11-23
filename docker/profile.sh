#!/usr/bin/env bash
# Register Samsung certificates (made with Tizen Studio's Certificate Manager) as a signing
# profile inside the container. Run from the repo root via:
#   docker/run.sh docker/profile.sh <ProfileName> <certificate folder> <password file>
# e.g. docker/run.sh docker/profile.sh <profile> .local/certificates/<profile> .local/certificate-password.txt
# Author and distributor certificate must share the password in <password file>, because
# CleanFrame's package script answers both prompts with it. Without a desktop keyring the Tizen
# CLI cannot store passwords; entrypoint.sh blanks the password fields before every command.
set -euo pipefail
NAME=${1:?profile name}; DIR=${2:?certificate folder}; PWFILE=${3:?password file}
for f in "$DIR/author.p12" "$DIR/distributor.p12" "$PWFILE"; do
  [ -f "$f" ] || { echo "Missing: $f"; exit 1; }
done
DIR=$(cd "$DIR" && pwd)
PW=$(head -n1 "$PWFILE" | tr -d '\r\n')
# Check the password against both certificates before touching the profile.
for c in author distributor; do
  "$TIZEN_HOME/jdk/bin/keytool" -list -storetype PKCS12 -keystore "$DIR/$c.p12" -storepass "$PW" >/dev/null 2>&1 \
    || { echo "Password does not open $c.p12"; exit 1; }
done
tizen security-profiles add -n "$NAME" -a "$DIR/author.p12" -p "$PW" -d "$DIR/distributor.p12" -dp "$PW" >/dev/null
unset PW
tizen security-profiles list
