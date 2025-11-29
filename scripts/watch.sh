#!/bin/bash

./scripts/build.sh
find src -type f | entr -r sh -c "./scripts/build.sh && (cd dist && python3 -m http.server 4321)"
