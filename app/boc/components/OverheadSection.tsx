"use client";

interface Props {
  machinePayment: string;
  onMachinePaymentChange: (v: string) => void;
  insurance: string;
  onInsuranceChange: (v: string) => void;
  rentSpace: string;
  onRentSpaceChange: (v: string) => void;
  utilities: string;
  onUtilitiesChange: (v: string) => void;
  software: string;
  onSoftwareChange: (v: string) => void;
  other: string;
  onOtherChange: (v: string) => void;
  total: number;
}

const FIELDS: {
  key: string;
  label: string;
  placeholder: string;
}[] = [
  { key: "machinePayment", label: "Machine Payment", placeholder: "e.g. 300" },
  { key: "insurance", label: "Insurance", placeholder: "e.g. 50" },
  { key: "rentSpace", label: "Rent / Studio Space", placeholder: "e.g. 200" },
  { key: "utilities", label: "Utilities", placeholder: "e.g. 75" },
  { key: "software", label: "Software / Subscriptions", placeholder: "e.g. 40" },
  { key: "other", label: "Other", placeholder: "e.g. 25" },
];

export default function OverheadSection({
  machinePayment,
  onMachinePaymentChange,
  insurance,
  onInsuranceChange,
  rentSpace,
  onRentSpaceChange,
  utilities,
  onUtilitiesChange,
  software,
  onSoftwareChange,
  other,
  onOtherChange,
  total,
}: Props) {
  const values: Record<string, string> = {
    machinePayment,
    insurance,
    rentSpace,
    utilities,
    software,
    other,
  };
  const setters: Record<string, (v: string) => void> = {
    machinePayment: onMachinePaymentChange,
    insurance: onInsuranceChange,
    rentSpace: onRentSpaceChange,
    utilities: onUtilitiesChange,
    software: onSoftwareChange,
    other: onOtherChange,
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-plum mb-4">
        Monthly Overhead ($)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-bold text-muted mb-2">
              {field.label}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values[field.key]}
              onChange={(e) => setters[field.key](e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-4 py-2 border border-line rounded-xl"
            />
          </div>
        ))}
      </div>

      {/* Auto total */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm font-bold text-muted">Monthly Total:</span>
        <span className="text-lg font-bold text-plum">
          ${total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
