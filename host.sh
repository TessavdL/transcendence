#!/bin/bash

if [ -z "$1" ]; then
  host=$(hostname)
else
  host="$1"
fi
echo $host

front_end_env_file="./front_end/app/.env"
back_end_env_file="./back_end/app/.env"
env_file="./.env";

echo "VITE_HOST=\"$host\"" > $front_end_env_file;
echo "HOST=\"$host\"" > $back_end_env_file;
echo "DATABASE_URL=\"postgresql://postgres:pCDB36kSeDnbnezFSXTl@db:5432/pong?schema=public&connection_timeout=300\"" >> $back_end_env_file;
echo "JWT_SECRET=\"d1ArHqTFPoThzOroCG4XdQLs3m8SQanj\"" >> $back_end_env_file;
echo "TWO_FACTOR_AUTHENTICATION_APP_NAME=\"pong\"" >> $back_end_env_file;
echo "POSTGRES_DB=\"pong\"" > $env_file;
echo "POSTGRES_USER=\"postgres\"" >> $env_file;
echo "POSTGRES_PASSWORD=\"pCDB36kSeDnbnezFSXTl\"" >> $env_file;