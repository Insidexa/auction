### How to run
- setup environment: copy `.env.example` to `.env`
- install dependencies `npm i`
- create database `docker-compose up`
- run migrations `npx adonis migration:run`

#### Jobs for check lot status
- run job queue `npm run kue`
- run crontab `npm run scheduler`
- fill db test data `npx adonis seed`

#### swagger at `http://127.0.0.1:3333/docs/`


### Testing
- setup `.env.testing`
- run tests `npm run test`
