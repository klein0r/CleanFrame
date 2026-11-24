# 2022 Frame (LS03B, 1720.7): building, signing and native Home from Docker

Device results and open checks are summarised in [frame-2022.md](frame-2022.md).

This is an owner report for a **GQ55LS03BAUXZG** (2022 Frame, 55", German unit),
firmware **T-PTMDEUC-1720.7**, Tizen **6.5.0**, ARMv7l, build
`T-PTMDEUC-REL-202602250226`, the TV described in
[the 2022 device report](frame-2022.md). It records how the launcher is built,
signed and installed, and how native Home is applied, from a single Docker
container instead of a local Tizen Studio install, and the one transport change
that Docker requires.

Private values (TV DUID, the SDK-generated app identity, certificates, device and
host IP addresses, and the native original-value snapshot) are kept out of the
repository, per `CONTRIBUTING.md`. They live under the Git-ignored `.local/`.
Placeholders below are written as `<APP_ID>`, `<TV_IP>` and so on.

## Why Docker

The build host is an Apple-silicon Mac with no Tizen Studio installed. Everything
except creating the Samsung certificate runs in one container:

- Tizen Studio **6.1** CLI (`sdb`, `tizen`) with the *Samsung Certificate
  Extension* (`cert-add-on`) and *TV Extension Tools*.
- Node.js **24** and Python **3** for the launcher build (`npm ci`,
  `npm run check`, `npm run package`, `npm run tv:*`).

Tizen Studio for Linux ships only as x86_64, so the image is `linux/amd64` and
runs under Docker Desktop's emulation on Apple silicon. `sdb`, packaging and the
`npm` scripts are fast enough; builds are a little slower under emulation.

See [`../docker/`](../docker) for the `Dockerfile`, the `run.sh` wrapper, the
`entrypoint.sh` password workaround, `profile.sh` (register a certificate as a
signing profile) and `stage.py` (the native-home transport).

```sh
docker build --platform linux/amd64 -t cleanframe-tizen:6.1 docker/
docker/run.sh npm ci
docker/run.sh npm run check
```

## The certificate (made once, outside the build host)

The Samsung *Certificate Manager* needs the graphical Tizen Studio and a browser
login, so the certificate is created once in a throwaway Windows VM (here: Windows
11 under Proxmox, snapshot rolled back afterwards) and the result copied to the
build host. The author and distributor certificates **must share one password**,
because the signing step forwards a single password to both prompts. The
distributor certificate carries the TV's DUID. Back up the author certificate
separately: in-place launcher updates require the same author certificate.

Copy the certificate folder to `.local/certificates/<profile>/` (`author.p12`,
`distributor.p12`) and put the shared password in `.local/certificate-password.txt`
(mode `600`). Register it as a signing profile inside the container:

```sh
docker/run.sh docker/profile.sh <profile> .local/certificates/<profile> .local/certificate-password.txt
```

### Password workaround

Without a desktop keyring the Tizen CLI cannot save certificate passwords. After
each prompt it rewrites `profiles.xml` with references to `.pwd` files it never
creates, which breaks the next signing run with `Invalid password`.
`docker/entrypoint.sh` blanks the password fields before every container command,
so the CLI always prompts and CleanFrame's `scripts/package.py` answers from the
`password_file`. Create `.local/signing.json`:

```json
{
  "sdk_path": "/home/node/tizen-studio",
  "profile": "<profile>",
  "package_id": "<PACKAGE_ID>",
  "app_id": "<APP_ID>",
  "password_file": "/work/.local/certificate-password.txt"
}
```

`<PACKAGE_ID>` is a ten-character SDK-style id you choose; `<APP_ID>` is
`<PACKAGE_ID>.CleanFrame`. Keep this identity stable: every future update must use
the same app id and author certificate, or the TV installs a second app.

## Build, sign, install, launch

```sh
docker/run.sh npm run package           # builds and signs dist/CleanFrame.wgt
docker/run.sh npm run tv:install        # vd_appinstall, confirms it in the app list
docker/run.sh npm run tv:launch
```

The TV address goes in `.local/device.json` (`{"host": "<TV_IP>"}`). Enable
Developer Mode on the TV (Apps, `12345`), enter the build host's IP, and
fully power-cycle the TV: the developer port 26101 opened only after pulling
mains power, not after a remote-button restart. Verify the signer certificates in
the widget are your own (not the Tizen test signer) before trusting an install.

## Native Home

This firmware ships **.NET Core 3.1.3** only (no 6.0), so the maintained helper
(.NET 6, firmware-guarded to the LS03D reference TV) does not run here. An
owner-built copy of `scripts/native-home` is needed; its results on this TV are
in [the 2022 device report](frame-2022.md#native-home-on-this-firmware). The adapted copy stays private under
`.local/native-home/`; it is **not** committed. Three edits to `Control.cs` and one
to `Control.csproj`:

| File | Upstream | This TV |
| --- | --- | --- |
| `Control.csproj` `TargetFramework` | `net6.0` | `netcoreapp3.1` + `<RollForward>Major</RollForward>` |
| `Control.cs` firmware guard | `Version=T-PTMDUABC-0090-2130.0;` | `Version=T-PTMDEUC-1720.7;` |
| `Control.cs` `Target` | `nClrkHome1.FrameHome` | `<APP_ID>` |
| `Control.cs` launcher directory | `/opt/usr/apps/nClrkHome1` | `/opt/usr/apps/<PACKAGE_ID>` |

Build the helper with a newer SDK targeting the old runtime (the host SDK can be
newer than the TV runtime). From the private source folder:

```sh
docker run --rm -v "$PWD:/src" -w /src -e DOTNET_CLI_HOME=/tmp \
  mcr.microsoft.com/dotnet/sdk:8.0 \
  dotnet build Control.csproj -c Release -o out
```

The result (`CleanFrameHomeControl.dll`, `.runtimeconfig.json`, `.deps.json`) stays
in `.local/native-home/out/`.

### Transport change for Docker

The upstream `scripts/native-home/run.py` runs the helper as SDK user 901 through
the `0 appinstall tpk <name-with-backtick>` injection and streams its output back
over a reverse TCP connection. A container cannot be dialed back at its NATed
address, so `docker/stage.py` keeps that mechanism, the reviewed `<mode>.sh`
scripts and the built `Control.dll` byte-for-byte, and changes only where the TV
reconnects: it dials the build host's LAN address (the `developerIP` the TV
stores) on a fixed port that `docker/run.sh` publishes into the container
(`-p 47960:47960`). Docker Desktop masquerades the TV's source IP to its internal
gateway, so the peer-IP check that upstream uses cannot apply and is dropped; the
listener is open only for the few seconds of the injection, on a trusted LAN.

### Verified on this TV

Read-only `inspect` and `query` confirmed, before any write:

- SDK user `uid=901`, `armv7l` (32-bit) — both `Control.cs` guards hold.
- Firmware `Version=T-PTMDEUC-1720.7;` — guard matches exactly.
- .NET runtimes present: up to `Microsoft.NETCore.App/3.1.3` only.
- The native libraries `libapp-context-manager-common.so`,
  `libcapi-appfw-app-operation-tv.so.0`, `libvconf.so.0` are present.
- Baseline: the Home operation and `db/appfw/home_appid`, `startup_appid`,
  `booting_appid_backup`, `first_screen/type` were all a normal, non-empty Samsung
  Home app id (`com.samsung.tv.csfs`); autostart `1`;
  `util_is_appbooting_supported_webapp_byappid` returned `1` for the launcher.

The captured baseline looked like this on this TV:

```json
{"Home":"com.samsung.tv.csfs","Strings":{"db/appfw/home_appid":"com.samsung.tv.csfs","db/appfw/startup_appid":"com.samsung.tv.csfs","db/appfw/booting_appid_backup":"com.samsung.tv.csfs","db/first_screen/type":"com.samsung.tv.csfs"},"Autostart":1,"Uid":901,"BootSupported":1}
```

**Do not reuse these values.** This is one TV's baseline. Run your own `query`
and keep your own snapshot: another region, Home screen or firmware has different
values, and a `restore` with the wrong baseline can break the Home assignment.

Because the originals are real, non-empty values, `restore` is exact. The verified
sequence `query → apply → restore → apply` ran clean:

```sh
docker/run.sh python3 docker/stage.py query      # capture; save as .local/native-home/original.json
docker/run.sh python3 docker/stage.py apply
docker/run.sh python3 docker/stage.py restore
docker/run.sh python3 docker/stage.py apply
```

- **apply** set the native Home operation and `home_appid` to the launcher and left
  autostart on. `home_appid` and `startup_appid` both ended on the launcher after
  the first apply; `booting_appid_backup` and `first_screen/type` stayed Samsung,
  so Samsung Home remains the backup. The physical Home button then opens
  CleanFrame, from apps and from Samsung Home — confirmed on the TV.
- **restore** returned all four keys, the native operation and autostart to the
  captured originals; the Home button opens Samsung Home again — confirmed, so
  recovery needs no factory reset here.

## Cautions, specific to this firmware

- The original-value snapshot (`.local/native-home/original.json`) is the only
  rollback evidence; keep it private and do not overwrite it with an applied state.
- The helper is firmware-locked. A firmware update makes `restore` refuse to run
  and can itself break the assignment. **Disable automatic software updates** and
  re-run `query` to re-verify before trusting restore after any firmware change.
- `apply` and `restore` share the same SDB transport; there is no independently
  verified fallback if that transport is unavailable.
- One owner's result on one TV. It does not widen the maintained helper's
  reference guard.

## Still to confirm on this TV

- Cold power-on landing directly in CleanFrame, and behaviour after Art Mode or
  streaming.
- Samsung Home escape from within CleanFrame, and that saved preferences survive an
  in-place app update.
