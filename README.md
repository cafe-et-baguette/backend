# Cafe et Baguette Backend

## Description

[Nest](https://github.com/nestjs/nest) framework with TypeScript.

## Installation

```bash
$ yarn install
```

## Running the app

First, create a `.env` file (or copy `.env.sample` to `.env`)

```bash
MONGO_URI=mongodb://localhost/nest
FRONTEND_URL=http://localhost:3000
SECRET_KEY=your_secret_key_here
JWT_EXPIRES_IN=1d
```

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
