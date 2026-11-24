# 2022 The Frame: LS03B compatibility report

Reported 24 November 2026 for **GQ55LS03BAUXZG** (55-inch, German unit),
Tizen **6.5.0**, ARMv7l / 32-bit, firmware **T-PTMDEUC-1720.7**, build
`T-PTMDEUC-REL-202602250226`.
This is one owner's adapted installation. It does not establish support for every
2022 Samsung TV or change the upstream package minimum or helper guard.

The build, signing, installation and helper commands are in
[the LS03B Docker workflow](ls03b-docker.md). This page records what was observed
on the TV and what remains open.

## Recorded evidence

| Area | Result on the reported TV |
| --- | --- |
| Signed web widget | Built and signed in a `linux/amd64` Docker container (Tizen Studio 6.1 CLI) with the owner's Samsung certificates and a separate SDK-generated app identity. Installed with `npm run tv:install` and launched with `npm run tv:launch`. |
| Debian trixie build image | After the image moved from `node:24-bookworm` to `node:24-trixie`, signing, the SDB connection, in-place installation and launch worked on the TV. Two in-place updates kept the app ID and author certificate. |
| TV settings | `com.samsung.tv.coba.setting` is installed and its launch was reported as successful, but nothing appeared on screen. A single launch of `org.tizen.menu` opened the full settings menu at Picture, confirmed by the owner. CleanFrame now opens `org.tizen.menu` first below Tizen 7. |
| Network access | With the `internet` privilege and one `<access origin>` for `api.open-meteo.com`, the launcher's weather request worked on the TV. The owner confirmed the Paderborn weather line under the date. |
| Developer connection | Port 26101 opened only after the TV was disconnected from mains power, not after a restart with the remote. |
| Native runtime | Only .NET Core 3.1.3 is present. The maintained .NET 6 helper cannot run here. A private copy that targets `netcoreapp3.1` with `RollForward=Major` ran as SDK user 901. |
| Native Home baseline | The Home operation, `db/appfw/home_appid`, `startup_appid`, `booting_appid_backup` and `db/first_screen/type` all named Samsung Home (`com.samsung.tv.csfs`). Autostart was `1`. The boot-eligibility query returned `1` for the launcher. |
| Native Home apply | Set the Home operation and `home_appid` to the launcher. Autostart stayed on. After the first apply, `startup_appid` also named the launcher. `booting_appid_backup` and `first_screen/type` stayed on Samsung Home. |
| Physical Home | The owner confirmed on the TV that Home opens CleanFrame from apps and from Samsung Home. |
| Restore | Restore returned all four keys, the operation and autostart to the captured values. The owner confirmed on the TV that Home opens Samsung Home again. A reapply after that worked. Because the baseline is non-empty, this restore is exact. |

The 2022 result differs from the [2020 LS03T](frame-2020.md). Here the
`db/appfw/*` keys exist and the Home operation alone sends Home to the launcher.
No extra `XF86Home` router package and no first-screen change were needed.
They were not tried on this TV.

## Prepare the web launcher

Use the owner's own Samsung account, author/distributor certificates, signing
profile and app identity. Follow the signing section in
[development](development.md) and the container steps in
[the Docker workflow](ls03b-docker.md). Keep the author certificate and app ID
unchanged for in-place updates. Otherwise the TV installs a second app.

On this host the author and distributor certificates use one password. The
signing step sends one password to both prompts. Without a desktop keyring the
Tizen CLI leaves broken password references in `profiles.xml`.
`docker/entrypoint.sh` clears them before each command.

Check that the signer certificates in the widget are your own, not the Tizen test
signer, before you trust an installation.

## Native Home on this firmware

The maintained helper is firmware-guarded to the reference LS03D (2130.0) and
needs .NET 6. On this TV, a private copy of `scripts/native-home` was adapted in
four places: target framework, exact firmware guard, launcher app ID and launcher
directory. The table is in [the Docker workflow](ls03b-docker.md#native-home). The
adapted copy and its build output stay under the ignored `.local/native-home/`.

The upstream transport was kept: the same SDK-user injection, mode scripts and
built helper. Only the reverse connection changed. In Docker the TV connects back
to a published port on the build host rather than to the container. The
peer-address check is dropped because Docker replaces the source address.

Read-only checks were done before any write:

- `uid=901` and `armv7l`, as the helper guards expect.
- `Version=T-PTMDEUC-1720.7;` matches the adapted guard exactly.
- `libapp-context-manager-common.so`, `libcapi-appfw-app-operation-tv.so.0`
  and `libvconf.so.0` are present.

The verified sequence was `query → apply → restore → apply`. Save the `query`
output privately as the original-value snapshot before the first apply, and never
overwrite it with an applied state. The baseline in the workflow document is an
example only. Capture your own: another region, Home screen or firmware may hold
different values.

### What stays on Samsung Home

After apply, `booting_appid_backup` and `db/first_screen/type` still name Samsung
Home. The apply did not set the first-screen target. Whether power-on opens the
launcher directly was not tested. On the 2020 LS03T, a launcher started as the
first screen also needed a default app-control declaration in its manifest. See
[the second LS03T report](frame-2020.md) and
[PR #45](https://github.com/nthnclrk/CleanFrame/pull/45). This build does not include
that declaration, and the first-screen target was not changed on this TV.

## Cautions

- The helper is locked to this firmware. After a firmware update, `restore`
  refuses to run, and the update can change the assignment itself. Turn off
  automatic software updates and run `query` again before you trust a restore.
- `apply` and `restore` use the same developer transport. No other recovery route
  has been verified. Restore the original values before you uninstall CleanFrame
  or change its identity.
- On the same firmware, another contributor's 43-inch LS03B left native Home
  unverified ([Issue #1](https://github.com/nthnclrk/CleanFrame/issues/1)). This
  report adds one result. It does not make 1720.7 a general allowlist entry.

## Not yet tested on this TV

- Power-on directly into CleanFrame, with or without a first-screen change.
- Behaviour after Art Mode, after streaming apps and after HDMI use.
- Samsung Home escape from CleanFrame after reassignment.
- Saved preferences after an in-place app update.
- HDMI input selection and CEC wake through Settings → Samsung → Inputs.
- Long-running behaviour and native Art Mode interaction.

## Sharing a report

Share the model, firmware, source revision, tests and unresolved results. Keep the
TV DUID, app identity, certificates and passwords, device and host addresses,
signed packages, private fonts and the original-value snapshot out of issues and
pull requests. They belong in the ignored `.local/` folder.
