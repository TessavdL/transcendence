#!/bin/bash

host=$(hostname)
echo $host

# Check if VITE_HOST exists in the .env file
if grep -q "^VITE_HOST=" ./front_end/app/.env; then
  # Update the value of VITE_HOST
  sed -i '' "s/^VITE_HOST=.*/VITE_HOST=\"$host\"/" ./front_end/app/.env
else
  # Add a new line for VITE_HOST
  if [ "$(tail -c 1 ./front_end/app/.env)" != "" ]; then
    echo >> ./front_end/app/.env
  fi
  echo "VITE_HOST=\"$host\"" >> ./front_end/app/.env
fi

# Check if HOST exists in the .env file
if grep -q "^HOST=" ./back_end/app/.env; then
  # Update the value of VITE_HOST
  sed -i '' "s/^HOST=.*/HOST=\"$host\"/" ./back_end/app/.env
else
  # Add a new line for VITE_HOST
  if [ "$(tail -c 1 ./back_end/app/.env)" != "" ]; then
    echo >> ./back_end/app/.env
  fi
  echo "HOST=\"$host\"" >> ./back_end/app/.env
fi