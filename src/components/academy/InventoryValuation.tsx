import { useState, useMemo } from 'react';
import { Package, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/types/accounting';

interface CostLayer {
    id: string;
    units: number;
    unitCost: number;
}

export const InventoryValuation = () => {
    const [layers, setLayers] = useState<CostLayer[]>([
        { id: '1', units: 100, unitCost: 10 },
        { id: '2', units: 50, unitCost: 12 },
    ]);
    const [unitsSold, setUnitsSold] = useState<number>(120);
    const [method, setMethod] = useState<'FIFO' | 'LIFO' | 'AVERAGE'>('FIFO');

    const handleAddLayer = () => {
        setLayers([...layers, { id: crypto.randomUUID(), units: 0, unitCost: 0 }]);
    };

    const updateLayer = (id: string, field: keyof CostLayer, value: number) => {
        setLayers(layers.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const removeLayer = (id: string) => {
        setLayers(layers.filter(l => l.id !== id));
    };

    const totalAvailableUnits = useMemo(() => layers.reduce((sum, l) => sum + l.units, 0), [layers]);
    const totalAvailableCost = useMemo(() => layers.reduce((sum, l) => sum + (l.units * l.unitCost), 0), [layers]);

    const calculation = useMemo(() => {
        let remainingToSell = Math.min(unitsSold, totalAvailableUnits);
        let cogs = 0;
        const workableLayers = [...layers];

        if (method === 'AVERAGE') {
            const avgCost = totalAvailableCost / (totalAvailableUnits || 1);
            cogs = remainingToSell * avgCost;
            return { cogs, endingInventory: totalAvailableCost - cogs, avgCost };
        }

        if (method === 'LIFO') workableLayers.reverse();

        for (const layer of workableLayers) {
            if (remainingToSell <= 0) break;
            const unitsFromLayer = Math.min(layer.units, remainingToSell);
            cogs += unitsFromLayer * layer.unitCost;
            remainingToSell -= unitsFromLayer;
        }

        return { cogs, endingInventory: totalAvailableCost - cogs, avgCost: undefined };
    }, [layers, unitsSold, method, totalAvailableUnits, totalAvailableCost]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-guide pb-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <Package className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-serif text-2xl text-ink">Inventory Cost Flow</h3>
                    <p className="font-sans text-sm text-text-secondary mt-1 leading-relaxed max-w-2xl">
                        Add purchases (layers) to your inventory, then slide the "Units Sold" bar to see how different valuation methods (FIFO, LIFO, Average) impact your Cost of Goods Sold and Ending Inventory remaining on your balance sheet.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-sans uppercase tracking-wide text-xs font-bold text-text-secondary">Cost Layers (Purchases)</h4>
                            <Button variant="ghost" size="sm" onClick={handleAddLayer} className="text-xs">
                                <Plus className="w-4 h-4 mr-1" /> Add Layer
                            </Button>
                        </div>
                        {layers.map((layer, idx) => (
                            <div key={layer.id} className="flex gap-2 items-center bg-ivory p-2 rounded border border-guide">
                                <span className="font-mono text-xs text-text-secondary w-6 text-center">{idx + 1}</span>
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs uppercase text-text-secondary">Units</label>
                                    <Input type="number" value={layer.units} onChange={e => updateLayer(layer.id, 'units', Number(e.target.value))} className="h-8 text-sm bg-white" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs uppercase text-text-secondary">Cost/Unit</label>
                                    <Input type="number" value={layer.unitCost} onChange={e => updateLayer(layer.id, 'unitCost', Number(e.target.value))} className="h-8 text-sm bg-white" />
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeLayer(layer.id)} className="mt-5 text-accounting-red">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-guide">
                        <label className="font-sans uppercase tracking-wide text-xs font-bold text-text-secondary flex justify-between">
                            <span>Units Sold</span>
                            <span className="text-ink font-mono">{unitsSold} / {totalAvailableUnits} available</span>
                        </label>
                        <Input 
                            type="range" 
                            min="0" 
                            max={totalAvailableUnits} 
                            value={unitsSold} 
                            onChange={e => setUnitsSold(Number(e.target.value))} 
                            className="w-full accent-ink decoration-ink"
                        />
                    </div>
                </div>

                {/* Outputs */}
                <div className="space-y-6">
                    <div className="flex p-1 bg-guide/30 rounded-paper">
                        {['FIFO', 'LIFO', 'AVERAGE'].map(m => (
                            <button
                                key={m}
                                onClick={() => setMethod(m as any)}
                                className={`flex-1 py-2 text-sm font-sans uppercase tracking-wide rounded transition-colors ${method === m ? 'bg-ivory text-ink shadow-sm' : 'text-text-secondary hover:text-ink'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    <div className="bg-ivory border border-guide rounded-paper overflow-hidden">
                        <div className="p-4 border-b border-guide bg-surface/50">
                            <h4 className="font-serif font-bold text-ink">Goods Available for Sale</h4>
                            <div className="flex justify-between mt-2 font-mono text-sm text-text-secondary">
                                <span>{totalAvailableUnits} units</span>
                                <span>${formatCurrency(totalAvailableCost)}</span>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-sans text-xs uppercase text-text-secondary tracking-wide">Cost of Goods Sold (Income Statement)</p>
                                    <p className="font-serif text-2xl text-[#b91c1c] font-bold mt-1">${formatCurrency(calculation.cogs)}</p>
                                </div>
                                <ArrowRight className="w-6 h-6 text-guide" />
                            </div>

                            <div className="flex items-center justify-between border-t border-guide pt-6">
                                <div>
                                    <p className="font-sans text-xs uppercase text-text-secondary tracking-wide">Ending Inventory (Balance Sheet)</p>
                                    <p className="font-serif text-2xl text-[#1e40af] font-bold mt-1">${formatCurrency(calculation.endingInventory)}</p>
                                </div>
                                <div className="text-right">
                                    <span className="font-mono text-sm text-text-secondary">{totalAvailableUnits - Math.min(unitsSold, totalAvailableUnits)} units left</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {method === 'AVERAGE' && calculation.avgCost && (
                         <p className="font-mono text-sm text-center text-text-secondary bg-surface p-2 rounded">
                            Weighted Avg: ${formatCurrency(calculation.avgCost)} / unit
                         </p>
                    )}
                </div>
            </div>
        </div>
    );
};
