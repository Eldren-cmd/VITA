export default function QuickAccessCard({ open, onClose, profile, contacts }) {
  if (!open) {
    return null
  }

  const iceContact = (contacts || []).find((contact) => contact.isICE) || contacts?.[0] || null
  const allergies = Array.isArray(profile?.allergies) ? profile.allergies : []
  const conditions = Array.isArray(profile?.conditions) ? profile.conditions : []

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-[2rem] bg-white p-6 text-slate-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">Medical ID</p>
        <div className="mt-4 space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Name</p>
            <p className="mt-2 text-3xl font-bold">{profile?.name || 'Not set'}</p>
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Blood type</p>
            <p className="mt-2 font-mono text-[80px] leading-none">{profile?.bloodType || '--'}</p>
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Allergies and conditions</p>
            <p className="mt-2 text-[32px] font-bold leading-tight">
              {[...allergies, ...conditions].join(' | ') || 'None recorded'}
            </p>
          </div>

          {iceContact ? (
            <a
              href={`tel:${iceContact.phone || ''}`}
              className="block w-full rounded-2xl bg-vita-green px-5 py-4 text-center text-xl font-bold text-white"
            >
              Call ICE: {iceContact.name || 'Contact'}
            </a>
          ) : null}

          <p className="text-sm text-slate-500">Tap anywhere outside this card to close.</p>
        </div>
      </div>
    </div>
  )
}
