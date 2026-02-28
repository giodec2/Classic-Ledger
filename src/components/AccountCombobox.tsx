import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Search } from 'lucide-react';

// Standard chart of accounts — always available as suggestions
const STANDARD_ACCOUNTS = [
    'Cash',
    'Petty Cash',
    'Bank',
    'Accounts Receivable',
    'Notes Receivable',
    'Inventory',
    'Supplies',
    'Prepaid Insurance',
    'Prepaid Rent',
    'Prepaid Expenses',
    'Equipment',
    'Furniture',
    'Vehicles',
    'Buildings',
    'Land',
    'Accumulated Depreciation',
    'Accounts Payable',
    'Notes Payable',
    'Wages Payable',
    'Salaries Payable',
    'Interest Payable',
    'Taxes Payable',
    'Unearned Revenue',
    'Mortgage Payable',
    'Loans Payable',
    'Capital Stock',
    'Owner\'s Capital',
    'Retained Earnings',
    'Drawings',
    'Dividends',
    'Service Revenue',
    'Sales Revenue',
    'Fees Earned',
    'Interest Income',
    'Rent Income',
    'Commission Revenue',
    'Rent Expense',
    'Wages Expense',
    'Salaries Expense',
    'Utilities Expense',
    'Insurance Expense',
    'Supplies Expense',
    'Depreciation Expense',
    'Interest Expense',
    'Advertising Expense',
    'Repairs Expense',
    'Miscellaneous Expense',
    'Bad Debt Expense',
    'Cost of Goods Sold',
    'Allowance for Doubtful Accounts',
];

interface AccountComboboxProps {
    value: string;
    onChange: (value: string) => void;
    existingAccounts: string[];
    placeholder?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    className?: string;
}

export const AccountCombobox = ({
    value,
    onChange,
    existingAccounts,
    placeholder = 'Select account',
    onFocus,
    onBlur,
    onKeyDown,
    className = '',
}: AccountComboboxProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Merge existing accounts with standard accounts (deduplicated, case-insensitive)
    const allAccounts = (() => {
        const seen = new Set<string>();
        const result: { name: string; source: 'workbook' | 'standard' }[] = [];

        for (const acc of existingAccounts) {
            const key = acc.toLowerCase().trim();
            if (key && !seen.has(key)) {
                seen.add(key);
                result.push({ name: acc, source: 'workbook' });
            }
        }

        for (const acc of STANDARD_ACCOUNTS) {
            const key = acc.toLowerCase().trim();
            if (!seen.has(key)) {
                seen.add(key);
                result.push({ name: acc, source: 'standard' });
            }
        }

        return result;
    })();

    const filterText = isOpen ? search : '';
    const filtered = filterText
        ? allAccounts.filter(a => a.name.toLowerCase().includes(filterText.toLowerCase()))
        : allAccounts;

    const workbookAccounts = filtered.filter(a => a.source === 'workbook');
    const standardAccounts = filtered.filter(a => a.source === 'standard');

    const exactMatch = allAccounts.some(a => a.name.toLowerCase() === search.toLowerCase().trim());
    const showCreateOption = search.trim().length > 0 && !exactMatch;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch('');
                onBlur?.();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onBlur]);

    const handleSelect = (accountName: string) => {
        onChange(accountName);
        setSearch('');
        setIsOpen(false);
        onBlur?.();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        onChange(val);
        if (!isOpen) setIsOpen(true);
    };

    const handleInputFocus = () => {
        setIsOpen(true);
        setSearch(value);
        onFocus?.();
    };

    const handleKeyDownInternal = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearch('');
            inputRef.current?.blur();
        }
        if (e.key === 'Tab') {
            setIsOpen(false);
            setSearch('');
        }
        onKeyDown?.(e);
    };

    return (
        <div ref={containerRef} className="relative">
            <div className="flex items-center">
                <input
                    ref={inputRef}
                    type="text"
                    value={isOpen ? search : value}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDownInternal}
                    placeholder={placeholder}
                    className={`w-full bg-transparent outline-none ${className}`}
                />
                <button
                    type="button"
                    onClick={() => {
                        if (isOpen) {
                            setIsOpen(false);
                            setSearch('');
                        } else {
                            inputRef.current?.focus();
                        }
                    }}
                    className="p-0.5 text-muted hover:text-ink transition-colors flex-shrink-0"
                    tabIndex={-1}
                >
                    <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {isOpen && (
                <div className="absolute left-0 top-full mt-1 w-64 max-h-56 overflow-y-auto bg-surface border border-guide rounded-paper shadow-lg z-50">
                    <div className="px-3 py-1.5 border-b border-guide bg-ivory/50 flex items-center gap-1.5">
                        <Search className="w-3 h-3 text-muted" />
                        <span className="font-sans text-[10px] uppercase tracking-wide text-muted">
                            {filterText ? `Results for "${filterText}"` : 'Type to search or select'}
                        </span>
                    </div>

                    {showCreateOption && (
                        <button
                            onClick={() => handleSelect(search.trim())}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-ivory transition-colors border-b border-guide"
                        >
                            <Plus className="w-3 h-3 text-accounting-red" />
                            <span className="font-serif text-body text-ink">
                                Create "<strong>{search.trim()}</strong>"
                            </span>
                        </button>
                    )}

                    {workbookAccounts.length > 0 && (
                        <div>
                            <div className="px-3 py-1 bg-ivory/30">
                                <span className="font-sans text-[9px] uppercase tracking-widest text-muted font-medium">
                                    Your Accounts
                                </span>
                            </div>
                            {workbookAccounts.map(a => (
                                <button
                                    key={`wb-${a.name}`}
                                    onClick={() => handleSelect(a.name)}
                                    className={`w-full text-left px-3 py-1.5 hover:bg-ivory transition-colors ${value.toLowerCase() === a.name.toLowerCase() ? 'bg-ivory' : ''
                                        }`}
                                >
                                    <span className="font-serif text-body text-ink">{a.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {standardAccounts.length > 0 && (
                        <div>
                            <div className="px-3 py-1 bg-ivory/30 border-t border-guide">
                                <span className="font-sans text-[9px] uppercase tracking-widest text-muted font-medium">
                                    Standard Accounts
                                </span>
                            </div>
                            {standardAccounts.map(a => (
                                <button
                                    key={`std-${a.name}`}
                                    onClick={() => handleSelect(a.name)}
                                    className={`w-full text-left px-3 py-1.5 hover:bg-ivory transition-colors ${value.toLowerCase() === a.name.toLowerCase() ? 'bg-ivory' : ''
                                        }`}
                                >
                                    <span className="font-serif text-body text-ink">{a.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {filtered.length === 0 && !showCreateOption && (
                        <div className="px-3 py-4 text-center">
                            <span className="font-serif text-body text-muted">No accounts found</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
