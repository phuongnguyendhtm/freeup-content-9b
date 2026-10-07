#!/bin/bash
set -u

cd "$(dirname "$0")" || exit 1
printf '%s\n' 'Cai he thong Content cho 9BizClaw tren Mac.'
printf '%s\n' 'Mo 9B, ket thuc cac luot chat dang chay va giu ung dung mo.'

root="${NINEBIZ_INSTALL_ROOT:-${NINEBIZ_CLI_ROOT:-}}"
metadata="$HOME/Library/Application Support/9BizClaw-v3/install-root.json"
if [ -z "$root" ] && [ -f "$metadata" ] && [ -x /usr/bin/plutil ]; then
  root="$(/usr/bin/plutil -extract path raw -o - "$metadata" 2>/dev/null || true)"
fi
if [ -z "$root" ]; then
  for candidate in "$HOME/Library/Application Support/9BizClaw-v3" "/Applications/9BizClaw v3.app/Contents/Resources"; do
    if [ -f "$candidate/vendor/node_modules/openclaw/openclaw.mjs" ]; then root="$candidate"; break; fi
  done
fi

node_bin=''
if [ -n "$root" ] && [ -x "$root/vendor/node/node" ]; then node_bin="$root/vendor/node/node"; fi
if [ -z "$node_bin" ] && command -v node >/dev/null 2>&1; then node_bin="$(command -v node)"; fi
if [ -z "$node_bin" ]; then
  printf '%s\n' 'CHUA CAI XONG: Khong tim thay Node. Gui anh thong bao nay cho nguoi ho tro 9B.'
  read -r -p 'Nhan Enter de dong cua so...' _
  exit 1
fi
if ! "$node_bin" -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 20 ? 0 : 1)' >/dev/null 2>&1; then
  printf '%s\n' 'CHUA CAI XONG: Can Node 20 tro len hoac Node di kem 9B.'
  read -r -p 'Nhan Enter de dong cua so...' _
  exit 1
fi

args=(install-job.cjs run --select-agent --install-deps)
if [ -n "$root" ]; then args+=(--install-root "$root"); fi
state="${OPENCLAW_STATE_DIR:-$HOME/Library/Application Support/9BizClaw-v3/openclaw-state}"
if [ -f "$state/openclaw.json" ]; then args+=(--state-dir "$state"); fi
printf '%s\n' 'Neu da co ban content cu cua cung bo qua tang, nhap CO de nang cap.'
read -r -p 'Cai lan dau: nhan Enter. Lua chon: ' upgrade
if [ "$upgrade" = 'CO' ]; then args+=(--upgrade); fi
"$node_bin" "${args[@]}"
result=$?
if [ "$result" -eq 0 ]; then
  printf '%s\n' 'Da cai va xac minh. Mo chat moi trong 9B, go /thietlapcontent.'
else
  printf '%s\n' 'CHUA CAI XONG. Giu thong bao va duong dan install.log o tren de nguoi ho tro kiem tra.'
fi
read -r -p 'Nhan Enter de dong cua so...' _
exit "$result"
