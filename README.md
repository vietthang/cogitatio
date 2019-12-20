# Cogitatio

[![Build Status](https://travis-ci.com/vietthang/cogitatio.svg?branch=master)](https://travis-ci.com/vietthang/cogitatio)

## About

Cogitatio: (Latin: thinking, meditation, reflection), is a collection of libraries to provide type-safe development in typescript. Currently the focus is on node.js/nest.js.

## Why

Javascript & Typescript are awesome. I love the combination of static type definition of Typescript and ability to go dynamic when needed with Javascript. With Typescript, the code is safe whenever you define type correctly, but when receive data from IO (read from file, http request...), Typescript can not protect you from invalid type. Also Typescript developers explicitly state that they will not support those use cases. Therefore, these features need to be handle in userland.

Some other libraries also tries to tackle these issues (eg: [class-validator](https://github.com/typestack/class-validator), [io-ts](https://github.com/gcanti/io-ts)...) but those projects all have some issues:

- TODO

Other than that, this repo also contains other modules that commonly used for my backend developement (Nest.js specified) also, they may be placed on other repo, but I merge them all into on repo to manage easier. :)

## Goals

- Adopting new language features when possible to improve type-safety & run time performance.
- Be as type-safe as possible, if not, prefer to error in runtime as soon as possible, try to never hide an error.
- Keep the dependencies minimal, especially production dependencies. Because I use docker to deployment a lot.
- Keep the packages as independent as possible.
- TODO

## Non-Goals

- The libraries should be generic & framework independent as possible, but it will be focused on my personal preference stack below, other stacks may be added in the future:

  - [Node.js](https://nodejs.org/en/) v12+
  - [Typescript](https://www.typescriptlang.org/) v3.7+
  - [ttypescript](https://github.com/cevek/ttypescript) - for rtti feature only
  - [Nest.js](https://nestjs.com/) v6+
  - [Postgres](https://www.postgresql.org/) v10+ - for database
  - [Typeorm](https://typeorm.io/#/)

## Packages

- [core](./packages/core) - Collection of decorators and function to define runtime type in the very type-safety way.
- [extra](./packages/extra) - Collection of frequently used schemas to used with core package.
- [joi](./packages/joi) - Deprecated. Use joi as validation library to validate data defined in core package.
- [tc39-temporal](./packages/tc39-temporal) - Forked from tc39-temporal polyfill. It is a much better time interface than default Date type.
- [rtti](./packages/rtti) - Provide transformer used by [ttypescript](https://github.com/cevek/ttypescript) to generate RTTI.
- [jwt](./packages/jwt) - Type-safe JWT verifier & signer.
- [typeorm](./packages/typeorm) - TODO. Collection of function to work with [Typeorm](https://typeorm.io/#/).
- [nestjs-common](./packages/nestjs-common) - Collection of ultilities middlewares & functions to used with [Nest.js](https://nestjs.com/).
- [nestjs-logger](./packages/nestjs-logger) - Advanced logging intergrations with [Nest.js](https://nestjs.com/).
- [nestjs-rc](./packages/nestjs-rc) - Type-safe config loader integrations with [rc](https://github.com/dominictarr/rc#readme).
- [nestjs-validation](./packages/nestjs-validation) - Integrations with "core" package to provide validation pipe.

## Future package ideas

- [nestjs-queue](./#) - Type-safe queue and processor.
- [nestjs-object-storage](./#) - Unified object storage interface for multiple adapters (file, db, aws, gcp...).
- [nestjs-image](./#) - Provide functions to convert, optimize, generate thumbnail for images.
- [nestjs-email-sender](./#) - Unified email sender interface for multiple adapters (smtp, aws, outlook...).
- [nestjs-sms-sender](./#) - Unified sms sender interface for multiple adapters (aws...).
- [nestjs-notification](./#) - Unified notification interface for multiple adapters (firebase, aws...).
- [nestjs-user](./#) - Provide functions to handle generic user.
- [nestjs-runtime-config](./#) - Provide functions to get/set entity config in runtime.
