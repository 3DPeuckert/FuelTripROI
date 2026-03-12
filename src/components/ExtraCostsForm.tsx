/**
 * Extra / hidden costs input section.
 */

import { ReceiptText } from 'lucide-react'
import { useCalculatorStore } from '../store/calculatorStore'
import { SectionCard } from './ui/SectionCard'
import { InputField } from './ui/InputField'
import { formatCurrency } from '../utils/formatters'

export function ExtraCostsForm() {
  const { extraCosts, updateExtraCosts, currency } = useCalculatorStore()

  const total =
    extraCosts.tollCost +
    extraCosts.parkingCost +
    extraCosts.foodCost +
    extraCosts.restroomCost +
    extraCosts.currencyExchangeFee +
    extraCosts.miscCost

  return (
    <SectionCard title="Extra Costs" icon={ReceiptText} accent="purple">
      <InputField
        label="Toll"
        value={extraCosts.tollCost}
        onChange={(v) => updateExtraCosts({ tollCost: v })}
        unit={currency}
        placeholder="0"
        min={0}
        step={0.5}
      />
      <InputField
        label="Parking"
        value={extraCosts.parkingCost}
        onChange={(v) => updateExtraCosts({ parkingCost: v })}
        unit={currency}
        placeholder="0"
        min={0}
        step={0.5}
      />
      <InputField
        label="Food & Drinks"
        value={extraCosts.foodCost}
        onChange={(v) => updateExtraCosts({ foodCost: v })}
        unit={currency}
        placeholder="0"
        min={0}
        step={0.5}
      />
      <InputField
        label="Restroom"
        value={extraCosts.restroomCost}
        onChange={(v) => updateExtraCosts({ restroomCost: v })}
        unit={currency}
        placeholder="0"
        min={0}
        step={0.1}
      />
      <InputField
        label="Currency Exchange Fee"
        value={extraCosts.currencyExchangeFee}
        onChange={(v) => updateExtraCosts({ currencyExchangeFee: v })}
        unit={currency}
        placeholder="0"
        min={0}
        step={0.1}
        hint="Bank or card conversion fees"
      />
      <InputField
        label="Misc"
        value={extraCosts.miscCost}
        onChange={(v) => updateExtraCosts({ miscCost: v })}
        unit={currency}
        placeholder="0"
        min={0}
        step={0.5}
        hint="Any other costs"
      />
      {total > 0 && (
        <div className="sm:col-span-2 pt-1 border-t border-purple-100">
          <p className="text-sm font-semibold text-purple-700">
            Total extras: {formatCurrency(total, currency)}
          </p>
        </div>
      )}
    </SectionCard>
  )
}
