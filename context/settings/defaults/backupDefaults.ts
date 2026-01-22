/**
 * Backup Defaults - القيم الافتراضية للنسخ الاحتياطي
 */

import { BackupSettings } from '../../../types/settings-extended';

export const getDefaultBackupSettings = (): BackupSettings => ({
    autoBackup: false,
    frequency: 'weekly' as const,
    time: '02:00',
    keepCount: 5,
    location: 'local' as const,
    encryptBackups: false,
    includeSettings: true,
    includeMedia: false,
    backups: []
});
