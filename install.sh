#!/bin/bash

# Install dependencies
npm install

# Build the app
npm run build

# Install the app
npm install --force -g .
