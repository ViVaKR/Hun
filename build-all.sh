#!/usr/bin/env zsh

SCRIPT_DIR="${0:A:h}"
PROJECT_ROOT="${SCRIPT_DIR}/Yana"
SCRIPTS="${PROJECT_ROOT}/scripts"

"${SCRIPTS}/clean.sh" && "${SCRIPTS}/build.sh"