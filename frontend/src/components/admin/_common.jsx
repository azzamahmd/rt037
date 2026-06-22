export function PanelHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h2 className="font-serif-display text-2xl sm:text-3xl text-[#1A1C18]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-[#757873] mt-1">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function FieldLabel({ children, required }) {
  return (
    <label className="text-xs uppercase tracking-[0.15em] font-semibold text-[#4A4D48]">
      {children} {required && <span className="text-[#C05638]">*</span>}
    </label>
  );
}

export function PanelCard({ children, className = "" }) {
  return (
    <div className={`bg-white border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}
