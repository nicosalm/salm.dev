#!/bin/bash

LOG_DIR="/Users/nicosalm/dev/salm.dev/src/log"

TODAY=$(date +"%Y-%m-%d")

if [ -f "$LOG_DIR/$TODAY.md" ]; then
  echo "log for today already exists."
  nvim "$LOG_DIR/$TODAY.md"
  exit 0
fi

LOG_NUM=$(find "$LOG_DIR" -name "*.md" | wc -l)
LOG_NUM=$((LOG_NUM + 1))

cat > "$LOG_DIR/$TODAY.md" << EOF
# Study Log for $TODAY

* **Day:** $LOG_NUM
* **Learning stage:**
* **Satisfied?** Yes/No

## What I Learned

-
-
-

## Reflection

## Next Steps

-
EOF

nvim "$LOG_DIR/$TODAY.md" "+normal gg3j$hhhhhhhhhhhhhhhhhhhhhhhh"

echo "created Log #$LOG_NUM for $TODAY."
