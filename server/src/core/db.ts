import mongoose from 'mongoose';

// Protection contre l'injection MongoDB : les objets du type { $gt: '' } reçus dans un filtre sont neutralisés.
mongoose.set('sanitizeFilter', true);
mongoose.set('strictQuery', true);

/** Ouvre la connexion Mongoose. `dbName` remplace la base indiquée dans l'URI (utile pour les tests). */
export async function connectDatabase(uri: string, dbName?: string): Promise<void> {
  await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 10_000 });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

/** Vrai si la connexion est ouverte et que la base répond à un ping. */
export async function isDatabaseHealthy(): Promise<boolean> {
  const database = mongoose.connection.db;
  if (mongoose.connection.readyState !== mongoose.ConnectionStates.connected || !database) {
    return false;
  }
  try {
    await database.admin().ping();
    return true;
  } catch {
    return false;
  }
}
