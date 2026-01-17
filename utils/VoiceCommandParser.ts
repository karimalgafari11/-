
export interface VoiceAction {
    type: 'create_invoice' | 'create_voucher' | 'unknown';
    data: {
        partyName?: string; // العميل أو المورد أو المستفيد
        amount?: number;
        description?: string;
        items?: Array<{ name: string; quantity: number }>;
    };
    rawText: string;
}

export class VoiceCommandParser {

    static parse(text: string): VoiceAction {
        const cleanText = text.trim().toLowerCase();

        // 1. Detect Intent: Create Invoice
        if (cleanText.match(/(فاتورة|بيع|مبيعات)/)) {
            return this.parseInvoiceCommand(text);
        }

        // 2. Detect Intent: Create Voucher (Payment/Receipt)
        if (cleanText.match(/(سند|صرف|قبض|دفعة)/)) {
            return this.parseVoucherCommand(text);
        }

        return {
            type: 'unknown',
            data: {},
            rawText: text
        };
    }

    private static parseInvoiceCommand(text: string): VoiceAction {
        const partyMatch = text.match(/(?:للعميل|عميل|باسم)\s+([\u0600-\u06FF\w\s]+?)(?:\s|$)/);
        // Simple logic: catch text after "للعميل"

        return {
            type: 'create_invoice',
            data: {
                partyName: partyMatch ? partyMatch[1].trim() : undefined,
                description: 'فاتورة تم إنشاؤها بالصوت'
            },
            rawText: text
        };
    }

    private static parseVoucherCommand(text: string): VoiceAction {
        // Extract Amount (numbers)
        const amountMatch = text.match(/(\d+)/);

        // Extract Payee/Description - heuristic
        // Example: "سند صرف 500 ريال كهرباء" -> Amount: 500, Desc: كهرباء
        let description = '';
        const words = text.split(' ');
        const amountIndex = words.findIndex(w => w.match(/\d+/));

        if (amountIndex !== -1 && amountIndex < words.length - 1) {
            // Take everything after amount generally (basic heuristic)
            // Skip common words like 'ريال'
            description = words.slice(amountIndex + 1).filter(w => !['ريال', 'درهم', 'جنيه'].includes(w)).join(' ');
        }

        return {
            type: 'create_voucher',
            data: {
                amount: amountMatch ? parseInt(amountMatch[0]) : 0,
                description: description || 'سند صوتي',
            },
            rawText: text
        };
    }
}
