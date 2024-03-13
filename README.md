# MisArch - Payment Service
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">Build with <a href="https://github.com/nestjs/nest" target="_blank">Nest.js</a> - A progressive framework for building efficient and scalable server-side applications.</p>
    <p align="center">

## Description

The Payment microservice mainly plans the execution and compensation of payments.
It additionally manages stored payments informations of users.
For the full documentation visit the <a href="https://misarch.github.io/docs/docs/dev-manuals/services/payment" target="_blank">MisArch Docs Page</a>.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# local docker dev setup
$ docker compose -f docker-compose-dev.yaml up -d --build 
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

MisArch is [MIT licensed](LICENSE).
