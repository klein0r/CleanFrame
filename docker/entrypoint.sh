#!/usr/bin/env bash
# The Tizen CLI cannot store passwords without a desktop keyring. After every password prompt
# it rewrites profiles.xml with references to .pwd files that never get written, which breaks
# the next signing run. Blank the fields before each command so the CLI always prompts and
# CleanFrame's package script answers from password_file.
XML=/home/node/tizen-studio-data/profile/profiles.xml
# profiles.path points here, and "tizen security-profiles add" will not create the file itself.
if [ ! -f "$XML" ]; then
  mkdir -p "$(dirname "$XML")"
  printf '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<profiles active="" version="3.1"/>\n' > "$XML"
fi
sed -i 's/password="[^"]*"/password=""/g' "$XML"
exec "$@"
