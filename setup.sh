#!/bin/bash
npm install
echo "Running setup script..."
python -m venv venv
source venv/bin/activate
pip install flask openai

