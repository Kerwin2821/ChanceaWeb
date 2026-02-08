#!/bin/bash

# Ensure nvm is loaded
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Switch to the correct node version defined in .nvmrc
if [ -f ".nvmrc" ]; then
  nvm use
else
  echo ".nvmrc not found, defaulting to current node version"
fi

# Run the project on web
echo "Starting Expo on Web..."
npx expo start --web --clear --port 8082
