#!/bin/bash

# Fix volume permissions
sudo chown -R $USER: node_modules

# Install dependencies
npm install
npm run apigen:dev-cont
sed -i 's/odysseus-backend/localhost/g' ./src/app/api/gateway/spec.ts
sed -i 's/https/http/g' ./src/app/api/gateway/spec.ts
npm run start:dev-cont
