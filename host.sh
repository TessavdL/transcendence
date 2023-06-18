#!/bin/bash

if [ -z "$1" ]; then
  host=$(hostname)
else
  host="$1"
fi
echo $host

front_end_env_file="./front_end/app/.env"
back_end_env_file="./back_end/app/.env"

# Check if VITE_HOST exists in the .env file
if grep -q "^VITE_HOST=" "$front_end_env_file"; then
  # Update the value of VITE_HOST
  sed -i '' "s/^VITE_HOST=.*/VITE_HOST=\"$host\"/" "$front_end_env_file"
else
  # Add a new line for VITE_HOST
  if [ "$(tail -c 1 "$front_end_env_file")" != "" ]; then
    echo >> "$front_end_env_file"
  fi
  echo "VITE_HOST=\"$host\"" >> "$front_end_env_file"
fi

# Check if HOST exists in the .env file
if grep -q "^HOST=" "$back_end_env_file"; then
  # Update the value of HOST
  sed -i '' "s/^HOST=.*/HOST=\"$host\"/" "$back_end_env_file"
else
  # Add a new line for HOST
  if [ "$(tail -c 1 "$back_end_env_file")" != "" ]; then
    echo >> "$back_end_env_file"
  fi
  echo "HOST=\"$host\"" >> "$back_end_env_file"
fi

# Store the file path in a variable
json_file="./front_end/app/cypress.env.json"

# Check if VITE_HOST exists in the cypress.env.json file
if grep -q "\"VITE_HOST\":" "$json_file"; then
  # Update the value of VITE_HOST
  sed -i '' "s/\"VITE_HOST\": \".*\"/\"VITE_HOST\": \"$host\"/" "$json_file"
else
  # Add a new line for VITE_HOST
  if [ "$(tail -c 1 "$json_file")" != "" ]; then
    echo >> "$json_file"
  fi
  echo "\"VITE_HOST\": \"$host\"," >> "$json_file"
fi