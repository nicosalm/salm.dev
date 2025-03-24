#!/bin/bash

./build.sh
find src -type f | entr -r sh -c "./build.sh && (cd dist && python3 -m http.server 8000)"
