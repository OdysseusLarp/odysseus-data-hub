# EOC Datahub

Frontend for EOC Datahub system used in Odysseus LARP. Basically the one and only place for news, comms, personnel and fleet data, voting, captain's log, and starmap. Oh, and hackers can hack it.

![Screenshot 2024-07-18 at 10-26-33 EOC DATAHUB](https://github.com/user-attachments/assets/a2240bd8-a48d-4ee0-a7cd-f09d94ad1d39)

![Screenshot 2024-07-18 at 10-30-07 EOC DATAHUB](https://github.com/user-attachments/assets/affdf407-d66d-47d3-bd6d-de019a1a3354)

## Tech

- Node v18.14.0
- Angular 4

## Setting up local dev

**NOTE!** Does not work in Windows environment as such. With Windows use [Local setup in VSCode dev containers](#local-setup-in-vscode-dev-containers).

- Clone the repository
- Install dependencies with `npm install`
- Have [Odysseus Backend](https://github.com/OdysseusLarp/odysseus-backend) running locally
- If you are running the backend on non-default port (8888), update the proper API URL to `apiUrl` variable in `./src/environments/environment.ts` and to `apigen` script in `package.json`
- Run `npm start` to start the dev server

DataHub should now be available at [http://localhost:4200](http://localhost:4200)

## Local setup in VSCode dev containers

You can also run the backend using [VSCode dev containers](https://code.visualstudio.com/docs/devcontainers/containers). Create/update your .env file like in the local setup instructions.

### Requirements

- [Docker](https://www.docker.com/)
- [VSCode](https://code.visualstudio.com/) with [Dev Containers](https://code.visualstudio.com/docs/devcontainers/tutorial#_install-the-extension) extension
- [Odysseus Backend](https://github.com/OdysseusLarp/odysseus-backend)

### Setup

- **`NOTE!`** Make sure you are running `Odysseus Backend`!
- Open new window in VSCode
- File --> Open Folder... --> `odysseus-data-hub`
- VSCode will ask do you want to `Reopen in Container` --> Click it
  - If you are too slow --> Click the button in left bottom corner (looks like two L:s or disjointed ><) and choose `Reopen in Container` from the menu.
- VSCode will then start up container/service, install npm packages and start the service

### Problems?

- Try to rebuild the container: Click the button in left bottom corner (looks like two L:s or disjointed >< with the container name) and choose `Rebuild Container` from the menu.
- You might run into [this issue](https://github.com/microsoft/vscode-remote-release/issues/7305) on ARM processors, see the issue for potential workarounds.
