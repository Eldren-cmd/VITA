import { useEffect, useState } from 'react'

import { PRIMARY_BUTTON_CLASS } from '@/constants/design'

function toCommaText(values) {
  return Array.isArray(values) ? values.join(', ') : ''
}

function toArrayValue(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function ProfileForm({ profile, onSave }) {
  const [formState, setFormState] = useState({
    name: '',
    dob: '',
    bloodType: '',
    organDonor: false,
    allergies: '',
    conditions: '',
    medications: '',
  })

  useEffect(() => {
    setFormState({
      name: profile?.name || '',
      dob: profile?.dob || '',
      bloodType: profile?.bloodType || '',
      organDonor: Boolean(profile?.organDonor),
      allergies: toCommaText(profile?.allergies),
      conditions: toCommaText(profile?.conditions),
      medications: toCommaText(profile?.medications),
    })
  }, [profile])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    setFormState((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    onSave({
      name: formState.name || null,
      dob: formState.dob || null,
      bloodType: formState.bloodType || null,
      organDonor: formState.organDonor,
      allergies: toArrayValue(formState.allergies),
      conditions: toArrayValue(formState.conditions),
      medications: toArrayValue(formState.medications),
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <input
          name="name"
          value={formState.name}
          onChange={handleChange}
          placeholder="Full name"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white"
        />
        <input
          name="dob"
          value={formState.dob}
          onChange={handleChange}
          placeholder="Date of birth"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white"
        />
        <input
          name="bloodType"
          value={formState.bloodType}
          onChange={handleChange}
          placeholder="Blood type"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white"
        />
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white">
          <input
            name="organDonor"
            type="checkbox"
            checked={formState.organDonor}
            onChange={handleChange}
          />
          Organ donor
        </label>
        <textarea
          name="allergies"
          value={formState.allergies}
          onChange={handleChange}
          placeholder="Allergies, comma separated"
          className="min-h-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white"
        />
        <textarea
          name="conditions"
          value={formState.conditions}
          onChange={handleChange}
          placeholder="Conditions, comma separated"
          className="min-h-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white"
        />
        <textarea
          name="medications"
          value={formState.medications}
          onChange={handleChange}
          placeholder="Medications, comma separated"
          className="min-h-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white"
        />
      </div>

      <button type="submit" className={PRIMARY_BUTTON_CLASS}>
        Save profile
      </button>
    </form>
  )
}
