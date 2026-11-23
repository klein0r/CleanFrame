#!/usr/bin/env bash
# Run a command in the CleanFrame Tizen container, e.g.:
#   .local/docker/run.sh npm run check
#   .local/docker/run.sh sdb connect 192.168.1.50
#   .local/docker/run.sh            (interactive shell)
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
IMAGE=cleanframe-tizen:6.1
mkdir -p "$REPO/.local/tizen-data"

args=(--rm --platform linux/amd64
  -v "$REPO:/work"
  # Linux node_modules must not mix with a macOS checkout.
  -v cleanframe-node-modules:/work/node_modules
  # profiles.xml and SDK settings persist here (ignored by Git).
  -v "$REPO/.local/tizen-data:/home/node/tizen-studio-data"
  # sdb keeps its server state per container; reuse it across runs.
  -v cleanframe-sdb:/home/node/.sdb
)
# Certificates from Tizen Studio's Certificate Manager on the Mac, read-only.
[ -d "$HOME/SamsungCertificate" ] && args+=(-v "$HOME/SamsungCertificate:/home/node/SamsungCertificate:ro")
# Native-home reverse-callback port: the TV dials the Mac here, Docker forwards it in.
# Must match PORT in .local/native-home/stage.py. Harmless for all other commands.
args+=(-p 47960:47960)
[ -t 0 ] && args+=(-it)

exec docker run "${args[@]}" "$IMAGE" "${@:-bash}"
