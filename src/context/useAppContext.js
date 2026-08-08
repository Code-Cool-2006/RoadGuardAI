import { useContext } from 'react';
import { AppContext } from './appContextInstance';

export function useAppContext() {
  return useContext(AppContext);
}
