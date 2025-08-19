import { Check } from 'lucide-react'

export function CheckBox({ checked, onChange }) {
    return (
        <label
            className="flex items-center gap-2 cursor-pointer select-none"
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="hidden"
            />

            <div
                className={`relative w-6 h-6 border rounded-md flex items-center justify-center cursor-pointer 
                    ${checked ? "bg-blue-500 border-blue-500" : "bg-white border-gray-400"}`}
            >
                {checked && <Check className="w-4 h-4 text-white pointer-events-none"/>}
            </div>
        </label>
    )
}