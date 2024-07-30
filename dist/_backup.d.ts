/**
 * Backup copy directories
 *
 * @param source - backup from directory
 * @param destination - backup to directory
 * @returns `Promise<void>`
 */
export declare const _backup_copy: (source: string, destination: string) => Promise<void>;
/**
 * Run backup
 *
 * @returns `Promise<void>`
 */
export declare const _run_backup: () => Promise<void>;
