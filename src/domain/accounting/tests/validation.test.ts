
import { describe, it, expect } from 'vitest';
import { isEntryBalanced } from '../validation';
import { JournalEntryLine } from '../../../types/domain/accounting';

describe('Domain: Validation Logic', () => {
    it('should return true for balanced entry', () => {
        const lines: JournalEntryLine[] = [
            { id: '1', accountId: 'acc1', debit: 100, credit: 0 },
            { id: '2', accountId: 'acc2', debit: 0, credit: 100 }
        ];
        expect(isEntryBalanced(lines)).toBe(true);
    });

    it('should return false for unbalanced entry', () => {
        const lines: JournalEntryLine[] = [
            { id: '1', accountId: 'acc1', debit: 100, credit: 0 },
            { id: '2', accountId: 'acc2', debit: 0, credit: 50 }
        ];
        expect(isEntryBalanced(lines)).toBe(false);
    });

    it('should handle floating point precision', () => {
        const lines: JournalEntryLine[] = [
            { id: '1', accountId: 'acc1', debit: 0.1 + 0.2, credit: 0 }, // 0.30000000000000004
            { id: '2', accountId: 'acc2', debit: 0, credit: 0.3 }
        ];
        expect(isEntryBalanced(lines)).toBe(true);
    });
});
