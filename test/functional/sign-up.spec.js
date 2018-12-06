'use strict';

const {
  test, trait, before, after,
} = use('Test/Suite')('Sign Up');
const Mail = use('Mail');
const Database = use('Database');
const User = use('App/Models/User');
const Token = use('App/Models/Token');

trait('Test/ApiClient');

before(async () => {
  User.addHook('afterCreate', async (instance) => {
    await instance.confirmEmail();
  });
});

after(async () => {
  await Database
    .table('tokens')
    .delete();
  await Database
    .table('users')
    .delete();
});

test('sign up user', async ({ assert, client }) => {
  Mail.fake();

  const user = {
    email: 'example@g.com',
    phone: '12345678',
    first_name: 'Pedos',
    lastname: 'Zedros',
    birth_day: '1800-01-12',
  };

  const request = { ...user, password: '12345678' };

  const response = await client
    .post('api/signup')
    .send(request)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: user,
  });

  const recentEmail = Mail.pullRecent();
  const userDB = await User.findBy('email', user.email);

  assert.equal(recentEmail.message.to[0].address, user.email);
  assert.isTrue(!!userDB);

  const token = await Token.query()
    .where('user_id', userDB.id)
    .where('type', Token.CONFIRMATION_TOKEN)
    .first();

  assert.isTrue(!!token);

  Mail.restore();
});

test('confirmation token revoked', async ({ client }) => {
  const token = await Token.first();
  token.is_revoked = true;
  await token.save();

  const response = await client
    .post(`api/confirmation/${token.token}`)
    .end();

  response.assertStatus(403);
});
