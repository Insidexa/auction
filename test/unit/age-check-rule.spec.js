'use strict';

const { test } = use('Test/Suite')('Age Check Rule');

const { validate } = use('Validator');

test('validate less age', async ({ assert }) => {
  const wrongAge = '1800-06-06';
  const validation = await validate({ wrongAge }, {
    wrongAge: 'ageCheck:less:18',
  });

  assert.isTrue(validation.fails());
});


test('validate more age', async ({ assert }) => {
  const wrongAge = '2000-06-06';
  const validation = await validate({ wrongAge }, {
    wrongAge: 'ageCheck:more:21',
  });

  assert.isTrue(validation.fails());
});

test('validate equal age', async ({ assert }) => {
  const wrongAge = '1995-06-06';
  const validation = await validate({ wrongAge }, {
    wrongAge: 'ageCheck:equal:50',
  });

  assert.isTrue(validation.fails());
});
