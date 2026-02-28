import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Plus } from 'lucide-react';

// Standard chart of accounts — always available as suggestions
const STANDARD_ACCOUNTS = [
    'Cash',
    'Accounts Receivable',
    'Notes Receivable',
    'Inventory',
    'Prepaid Insurance',
    'Prepaid Rent',
    'Prepaid Expenses',
    'Accumulated Depreciation',
    'Accounts Payable',
    'Notes Payable',
    'Salaries Payable',
    'Interest Payable',
    'Taxes Payable',
    'Unearned Revenue',
    'Capital Stock',
    'Owner\'s Equity',
    'Retained Earnings',
    'Dividends',
    'Service Revenue',
    'Sales Revenue',
    'Rent Expense',
    'Salaries Expense',
    'Insurance Expense',
    'Supplies Expense',
    'Depreciation Expense',
    'Interest Expense',
    'Advertising Expense',
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
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 288 });
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
            if (
                containerRef.current && !containerRef.current.contains(e.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
                setSearch('');
                onBlur?.();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onBlur]);

    // Update dropdown position when open
    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 4,
                left: rect.left,
                width: Math.max(288, rect.width),
            });
        }
    }, [isOpen]);

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

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
                    className="max-h-80 overflow-y-auto bg-surface border border-guide rounded-paper shadow-xl z-[9999]"
                >

                    {showCreateOption && (
                        <button
                            onClick={() => handleSelect(search.trim())}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-ivory transition-colors border-b border-guide"
                        >
                            <Plus className="w-3.5 h-3.5 text-accounting-red flex-shrink-0" />
                            <span className="font-serif text-[14px] text-ink">
                                Create "<strong>{search.trim()}</strong>"
                            </span>
                        </button>
                    )}

                    {workbookAccounts.length > 0 && (
                        <div>
                            <div className="px-4 py-1.5 bg-ivory/40 border-b border-guide">
                                <span className="font-sans text-[10px] uppercase tracking-widest text-text-secondary font-semibold">
                                    Your Accounts
                                </span>
                            </div>
                            {workbookAccounts.map(a => (
                                <button
                                    key={`wb-${a.name}`}
                                    onClick={() => handleSelect(a.name)}
                                    className={`w-full text-left px-4 py-2 hover:bg-ivory/70 transition-colors ${value.toLowerCase() === a.name.toLowerCase() ? 'bg-ivory font-medium' : ''
                                        }`}
                                >
                                    <span className="font-serif text-[14px] text-ink">{a.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {standardAccounts.length > 0 && (
                        <div>
                            <div className="px-4 py-1.5 bg-ivory/40 border-y border-guide">
                                <span className="font-sans text-[10px] uppercase tracking-widest text-text-secondary font-semibold">
                                    Standard Accounts
                                </span>
                            </div>
                            {standardAccounts.map(a => (
                                <button
                                    key={`std-${a.name}`}
                                    onClick={() => handleSelect(a.name)}
                                    className={`w-full text-left px-4 py-2 hover:bg-ivory/70 transition-colors ${value.toLowerCase() === a.name.toLowerCase() ? 'bg-ivory font-medium' : ''
                                        }`}
                                >
                                    <span className="font-serif text-[14px] text-ink">{a.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {filtered.length === 0 && !showCreateOption && (
                        <div className="px-4 py-6 text-center">
                            <span className="font-serif text-[14px] text-muted">No accounts found</span>
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};
