export default function FormField({ label, type, name, value, onChange, min, step }) {
  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <label htmlFor={name} className="text-gray-600 font-medium">
        {label}:
      </label>
      <input
        step={step}
        min={min}
        className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
        onChange={onChange}
        value={value}
        name={name}
        id={name}
        type={type}
      />
    </div>
  );
}
