#!/bin/bash
# Pre-tool-use hook: Validate before destructive operations
# Prevents accidental deletion of workshop data or production DB operations

TOOL_NAME="$1"
ARGS="$2"

# Block force pushes to main
if [[ "$TOOL_NAME" == "Bash" && "$ARGS" == *"push --force"* && "$ARGS" == *"main"* ]]; then
  echo "BLOCKED: Force push to main is not allowed. Use a feature branch." >&2
  exit 1
fi

# Block dropping tables in production
if [[ "$TOOL_NAME" == "Bash" && "$ARGS" == *"DROP TABLE"* ]]; then
  echo "BLOCKED: DROP TABLE detected. Use drizzle-kit for schema changes." >&2
  exit 1
fi

exit 0
