// Démarre une seule base MongoDB en mémoire pour toute la suite de tests.
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { TestProject } from 'vitest/node';

let memoryServer: MongoMemoryServer | undefined;

export async function setup(project: TestProject): Promise<void> {
  memoryServer = await MongoMemoryServer.create();
  project.provide('mongoUri', memoryServer.getUri());
}

export async function teardown(): Promise<void> {
  await memoryServer?.stop();
}

declare module 'vitest' {
  export interface ProvidedContext {
    mongoUri: string;
  }
}
