# Front end

This is a ZK demo used at DevCon7.

## Setup

Make sure to have the following installed:

- [NodeJs](https://nodejs.org).
- [yarn](https://yarnpkg.com/getting-started/install) or a similar package manager.
- Rust and cargo (Recommended to install using [rustup](https://rustup.rs)).

## Frontend

To setup and install dependencies for the frontend navigate to the `frontend` directory and run:

```bash
yarn install
```

### Development

```bash
yarn dev
```

This will launch a development server with hot module replacement enabled connected to testnet.

### Build

```bash
yarn build
```

This will bundle the project into `frontend/dist` directory.
