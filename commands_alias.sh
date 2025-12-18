# sshls
# https://github.com/badcompany-tokyo/sshls
alias sshls='deno run -RE https://raw.githubusercontent.com/badcompany-tokyo/sshls/refs/heads/main/src/main.ts'

# tree
alias tree='tree -a -I "\.DS_Store|\.git|node_modules|vendor\/bundle" -N'

# rmdsstore
# remove all .DS_Store files.
alias rmdsstore='find . -name ".DS_Store" -exec rm -rf {} \;'

# ls greps
alias lsfiles='find . -type f -exec ls -lh {} +'

alias lsdirs='find . -type d -exec ls -ldh {} +'

# ---- auto terminal logging (macOS script) ----

commands_auto_script_logging() {
  [[ -o interactive ]] || return 0
  [[ -n "${SCRIPT-}" ]] && return 0
  [[ -n "${COMMANDS_SCRIPT_LOGGING-}" ]] && return 0
  [[ "$(uname -s 2>/dev/null)" == "Darwin" ]] || return 0

  local script_bin
  script_bin="$(command -v script 2>/dev/null || true)"
  [[ -n "$script_bin" ]] || return 0

  export COMMANDS_SCRIPT_LOGGING=1

  local term_tag
  if [[ "${TERM_PROGRAM-}" == "ghostty" ]]; then
    term_tag="ghostty"
  else
    term_tag="${TERM_PROGRAM:-${TERM:-unknown}}"
  fi

  local ts
  ts="$(date +%Y%m%d_%H%M%S)"

  local tty_name="${TTY##*/}"
  if [[ -z "$tty_name" || "$tty_name" == "$TTY" ]]; then
    tty_name="$(/usr/bin/tty 2>/dev/null)"
    tty_name="${tty_name##*/}"
  fi
  [[ -z "$tty_name" ]] && tty_name="notty"

  local logfile="/tmp/commands-auto-script-logging_${ts}_${tty_name}_${term_tag}.log"

  local n=0
  while [[ -e "$logfile" ]]; do
    ((n++))
    logfile="/tmp/commands-auto-script-logging_${ts}_${tty_name}_${term_tag}-${n}.log"
  done

  exec "$script_bin" -q -t 0 -r "$logfile"
}

# commands_auto_script_logging

# ---- /auto terminal logging ----
