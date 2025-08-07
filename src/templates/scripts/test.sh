#!/bin/bash

# Test script for $CONTRACT_NAME

echo "Running tests..."
cargo test

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${RESET}"
else
    echo -e "${RED}❌ Tests failed!${RESET}"
    exit 1
fi