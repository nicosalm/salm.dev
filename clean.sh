#!/bin/bash

if [ -d "dist" ]; then
    rm -rf dist
    echo "removed dist directory"
fi

find . -name "*.tmp" -type f -delete
find . -name "*.bak" -type f -delete
find . -name ".DS_Store" -type f -delete
find . -name "*~" -type f -delete
find . -name "*.swp" -type f -delete

echo "-- cleanup done! --"
