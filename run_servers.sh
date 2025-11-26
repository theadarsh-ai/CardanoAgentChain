#!/bin/bash

cd python_backend && python app.py &
PYTHON_PID=$!

sleep 2

npm run dev &
NPM_PID=$!

trap "kill $PYTHON_PID $NPM_PID 2>/dev/null" EXIT

wait
