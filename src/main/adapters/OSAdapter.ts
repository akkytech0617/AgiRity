import { homedir } from 'node:os';
import type { IOSAdapter } from './interfaces';

/**
 * OS adapter wrapping Node.js os module
 */
export class OSAdapter implements IOSAdapter {
  homedir(): string {
    return homedir();
  }
}
