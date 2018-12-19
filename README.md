### How to run
- run `npm i`
- setup environment: copy `.env.example` to `.env`
- install dependencies `npm i`
- up databases and redis `docker-compose up`
#### database 
- create database `docker-compose up`
- run migrations `npx adonis migration:run`
- fill db test data `npx adonis seed`

#### run app `npm run start`

#### swagger at `http://127.0.0.1:3333/docs`
#### Kue UI run `npm run kue-ui` at `http://localhost:3000`

### Testing
- setup `.env.testing`
- up services `docker-compose -f docker-compose.testing.yml up`
- run tests `npm run test` or run test by global pattern `node ace test -g "name test"`
