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
	export COMMANDS_SCRIPT_LOGGING=1

	local logdir="${XDG_STATE_HOME:-$HOME/.local/state}/terminal-logs"
	mkdir -p "$logdir" || return 0

	local term_tag
	if [[ "${TERM_PROGRAM-}" == "ghostty" ]]; then
		term_tag="ghostty"
	else
		term_tag="${TERM_PROGRAM:-${TERM:-unknown}}"
	fi

	local ts="$(date +%Y%m%d-%H%M%S)"

	local tty_name="${TTY##*/}"
	if [[ -z "$tty_name" || "$tty_name" == "$TTY" ]]; then
		tty_name="$(/usr/bin/tty 2>/dev/null)"
		tty_name="${tty_name##*/}"
	fi
	[[ -z "$tty_name" ]] && tty_name="notty"

	local pid="$$"

	local logfile="${logdir}/${term_tag}-${ts}-${tty_name}-${pid}.log"

	local n=0
	while [[ -e "$logfile" ]]; do
		((n++))
		logfile="${logdir}/${term_tag}-${ts}-${tty_name}-${pid}-${n}.log"
	done

	exec /usr/bin/script -q -t 0 "$logfile"
}

commands_auto_script_logging

# ---- /auto terminal logging ----
