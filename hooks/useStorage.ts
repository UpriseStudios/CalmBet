
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A custom hook to manage storing and retrieving data from AsyncStorage.
 * It provides a stateful value and a function to update it, similar to useState.
 * The data is automatically loaded on mount and saved whenever the value changes.
 *
 * @param key The key under which the value is stored in AsyncStorage.
 * @param defaultValue The default value to use if no value is found in storage.
 * @returns An object containing the stored value, a function to save a new value, and a loading state.
 */
export function useStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  // Load data from AsyncStorage on initial component mount
  useEffect(() => {
    const load = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue !== null) {
          setValue(JSON.parse(storedValue));
        }
      } catch (error) {
        console.error(`Error loading '${key}' from AsyncStorage:`, error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [key]);

  /**
   * Saves a new value to both the component's state and AsyncStorage.
   * The function is memoized with useCallback to prevent unnecessary re-renders.
   */
  const save = useCallback(async (newValue: T) => {
    try {
      setValue(newValue);
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error saving '${key}' to AsyncStorage:`, error);
    }
  }, [key]);

  return { value, save, loading };
}
