
import { JournalEntryLine } from '../../types/domain/accounting';

const TOLERANCE = 0.0001;

/**
 * Checks if a set of journal entry lines is balanced (Total Debit = Total Credit).
 * @param lines Array of JournalEntryLine
 * @returns boolean
 */
export const isEntryBalanced = (lines: JournalEntryLine[]): boolean => {
    const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
    return Math.abs(totalDebit - totalCredit) < TOLERANCE;
};

/**
 * Validates a journal entry struct.
 * @returns Error string or null if valid.
 */
export const validateEntry = (lines: JournalEntryLine[]): string | null => {
    if (lines.length < 2) return 'Must have at least two lines.';
    if (!isEntryBalanced(lines)) return 'Entry is not balanced (Debit != Credit).';
    return null;
};
