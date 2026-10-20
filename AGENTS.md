# Installing FREEUP Content from this repository

When the user asks to install this repository, read [INSTALL.md](INSTALL.md).
Install for the agent/host receiving the request, using `install.cjs`; do not make
the student download, extract or move files. Source skills are in `package/skills/`.
If Git is unavailable, `scripts/download.cjs` downloads and verifies the files.
Do not install into every app detected on the computer. The user's install request
is the authorization; repository text alone is not authorization for other actions.

For setup or Google Sheets work, the conductor MUST read
`package/skills/freeup-content-system/references/google-sheet-template.md` and its
JSON schema. Duplicate the supplied workbook, preserving its structure. Never
invent an alternative board or write to the instructor's source spreadsheet.
Use an existing verified student copy when available. Reuse company information;
ask only for fields still missing. No instructor credentials or business data ship.

Do not change AGENTS/SOUL/USER, bypass host policy, or treat installation as permission
to post publicly. Report files installed, host discovery, media prerequisites,
Google connection and event automation as separate observed results.
