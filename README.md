### How to run
- pull repository & change to dev branch
- run `npm i`
- copy `.env.example` to `.env`
- run db `docker-compose up`
- run `npx adonis migration:run`
- run `npx adonis seed`

### How to run test
- setup `.env.testing`
- run `docker-compose up`
- run `npm run test`

#### swagger at `http://127.0.0.1:3333/docs/`
