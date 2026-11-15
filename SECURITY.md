# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report them privately through GitHub's
[private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
("Security" tab → "Report a vulnerability") on this repository. Include steps to
reproduce and the affected version.

## Supported versions

Only the latest release receives fixes.

## Deployment notes

- Set `JWT_SECRET` to a long random value. The server refuses to start in
  production with the default secret.
- Change the default `admin` password on first sign-in. The API refuses every
  other request until it has been changed.
- Disable guest mode (`ENABLE_GUEST_MODE=false`) if you don't want the read-only
  `guest`/`guest` account to be able to sign in.
- Home Media is designed for a home network. If you expose it to the internet,
  put it behind a TLS-terminating reverse proxy, and set `TRUSTED_PROXIES` to
  that proxy's address so rate limiting applies per client.
