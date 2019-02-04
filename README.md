# Odysseus Social Hub

Frontend for Social Hub system used in Odysseus LARP.

## Setting up local dev

- Clone the repository
- Install dependencies with `npm install`
- Have [Odysseus Backend](https://github.com/OdysseusLarp/odysseus-backend) running locally
- If you are running the backend on non-default port (8888), update the proper API URL to `apiUrl` variable in `./src/environments/environment.ts` and to `apigen` script in `package.json`
- Run `npm start` to start the dev server
- Dev server should be up at http://localhost:4200
