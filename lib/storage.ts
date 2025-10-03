import localforage from 'localforage';

/**
 * Configuration de localforage pour le stockage persistant
 */
localforage.config({
  name: 'moneto-app',
  storeName: 'moneto_store',
  description: 'Stockage local pour l\'application Moneto',
});

/**
 * Classe utilitaire pour gérer le stockage avec localforage
 */
export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Récupère une valeur depuis le stockage
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      return await localforage.getItem<T>(key);
    } catch (error) {
      console.error(`Erreur lors de la récupération de ${key}:`, error);
      return null;
    }
  }

  /**
   * Sauvegarde une valeur dans le stockage
   */
  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await localforage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de ${key}:`, error);
      return false;
    }
  }

  /**
   * Supprime une valeur du stockage
   */
  async remove(key: string): Promise<boolean> {
    try {
      await localforage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
      return false;
    }
  }

  /**
   * Vide tout le stockage
   */
  async clear(): Promise<boolean> {
    try {
      await localforage.clear();
      return true;
    } catch (error) {
      console.error('Erreur lors du vidage du stockage:', error);
      return false;
    }
  }

  /**
   * Récupère toutes les clés du stockage
   */
  async keys(): Promise<string[]> {
    try {
      return await localforage.keys();
    } catch (error) {
      console.error('Erreur lors de la récupération des clés:', error);
      return [];
    }
  }
}

export const storage = StorageService.getInstance();
