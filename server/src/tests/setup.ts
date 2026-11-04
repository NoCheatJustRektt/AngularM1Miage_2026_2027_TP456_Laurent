// Chaque fichier de test utilise sa propre base, vidée entre deux tests.
import { randomUUID } from 'node:crypto';

import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll, inject } from 'vitest';

import { connectDatabase, disconnectDatabase } from '../core/db.js';

beforeAll(async () => {
  await connectDatabase(inject('mongoUri'), `test-${randomUUID()}`);
});

afterEach(async () => {
  const collections = await mongoose.connection.db?.collections();
  await Promise.all((collections ?? []).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.connection.db?.dropDatabase();
  await disconnectDatabase();
});
