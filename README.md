# EOC Datahub

Frontend for EOC Datahub system used in Odysseus LARP. Basically the one and only place for news, comms, personnel and fleet data, voting, captain's log, and starmap. Oh, and hackers can hack it.

![Screenshot 2024-07-16 at 8 57 35](https://github.com/user-attachments/assets/6c1a50a0-5ac5-45aa-9580-f83d0421f7e8)

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
