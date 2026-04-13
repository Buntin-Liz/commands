#!/bin/zsh
set -u

PIDFILE="$HOME/.local/run/ssh-socks-bc2.pid"
LOGDIR="$HOME/.local/run"
SSH_BIN="/usr/bin/ssh"

mkdir -p "$LOGDIR"

cleanup() {
	if [[ -f "$PIDFILE" ]] && [[ "$(<"$PIDFILE")" = "$$" ]]; then
		rm -f "$PIDFILE"
	fi
}

trap cleanup EXIT INT TERM HUP

if [[ -f "$PIDFILE" ]]; then
	OLD_PID="$(<"$PIDFILE")"

	if [[ "$OLD_PID" =~ '^[0-9]+$' ]] && kill -0 "$OLD_PID" 2>/dev/null; then
		echo "Already running with PID $OLD_PID"
		exit 0
	fi

	rm -f "$PIDFILE"
fi

echo "$$" >"$PIDFILE"

exec "$SSH_BIN" \
	-N \
	-D 127.0.0.1:45454 \
	-o ExitOnForwardFailure=yes \
	-o ServerAliveInterval=30 \
	-o ServerAliveCountMax=3 \
	bc2
