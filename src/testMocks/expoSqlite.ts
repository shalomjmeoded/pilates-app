export interface SQLiteDatabase {
  getAllAsync<T>(query: string, ...params: unknown[]): Promise<T[]>;
  runAsync(query: string, ...params: unknown[]): Promise<unknown>;
  execAsync(query: string): Promise<void>;
}

export async function openDatabaseAsync(): Promise<SQLiteDatabase> {
  throw new Error('expo-sqlite is not available in the Jest environment.');
}
