export function Field({ name, label, type = "text", required = true, value, maxLength = 200, minLength, autoComplete }: { name: string; label: string; type?: string; required?: boolean; value?: string | null; maxLength?: number; minLength?: number; autoComplete?: string }) {
  return <label className="field"><span>{label}{required ? " *" : ""}</span><input name={name} type={type} required={required} defaultValue={value || ""} maxLength={maxLength} minLength={minLength} autoComplete={autoComplete} /></label>;
}
export function Select({ name, label, options, value, empty }: { name: string; label: string; options: Record<string, string>; value?: string; empty?: string }) {
  return <label className="field"><span>{label}</span><select name={name} defaultValue={value}>{empty !== undefined && <option value="">{empty}</option>}{Object.entries(options).map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>;
}
export function Textarea({ name, label, minLength = 1, maxLength = 10000 }: { name: string; label: string; minLength?: number; maxLength?: number }) {
  return <label className="field"><span>{label} *</span><textarea name={name} required minLength={minLength} maxLength={maxLength} rows={6} /></label>;
}
