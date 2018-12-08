const Database = use('Database');

async function exists (data, field, message, args, get) {
  const value = get(data, field);

  if (!value) {
    return;
  }

  const [table, column] = args;
  const entity = await Database.table(table).where(column, value).first();

  if (!entity) {
    throw message;
  }
}

module.exports = exists;
