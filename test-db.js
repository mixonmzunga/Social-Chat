const { db } = require('./src/lib/db');

async function test() {
  try {
    const users = await db.user.findMany();
    console.log('Users:', users);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await db.$disconnect();
  }
}

test();