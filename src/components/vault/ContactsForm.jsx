import { useEffect, useState } from 'react'

import { PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from '@/constants/design'

const EMPTY_CONTACT = {
  id: null,
  name: '',
  relationship: '',
  phone: '',
  isICE: false,
}

export default function ContactsForm({ contacts, onSave }) {
  const [draft, setDraft] = useState(EMPTY_CONTACT)

  useEffect(() => {
    setDraft(EMPTY_CONTACT)
  }, [contacts])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    setDraft((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextContacts = draft.id
      ? contacts.map((contact) =>
          contact.id === draft.id
            ? {
                ...contact,
                name: draft.name,
                relationship: draft.relationship,
                phone: draft.phone,
                isICE: draft.isICE,
              }
            : contact
        )
      : [
          ...contacts,
          {
            name: draft.name,
            relationship: draft.relationship,
            phone: draft.phone,
            isICE: draft.isICE,
          },
        ]

    onSave(nextContacts)
    setDraft(EMPTY_CONTACT)
  }

  const handleEdit = (contact) => {
    setDraft({
      id: contact.id,
      name: contact.name || '',
      relationship: contact.relationship || '',
      phone: contact.phone || '',
      isICE: Boolean(contact.isICE),
    })
  }

  const handleRemove = (id) => {
    onSave(contacts.filter((contact) => contact.id !== id))
    setDraft((current) => (current.id === id ? EMPTY_CONTACT : current))
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white/75">
            No emergency contacts saved yet.
          </div>
        ) : null}

        {contacts.map((contact) => (
          <div key={contact.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-lg font-bold text-white">{contact.name || 'Unnamed contact'}</p>
            <p className="mt-1 text-sm text-white/75">{contact.relationship || 'Relationship not set'}</p>
            <p className="mt-1 font-mono text-sm text-slate-300">{contact.phone || 'No phone number'}</p>
            {contact.isICE ? (
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-vita-amber">ICE</p>
            ) : null}

            <div className="mt-4 grid gap-4">
              <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={() => handleEdit(contact)}>
                Edit contact
              </button>
              <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={() => handleRemove(contact.id)}>
                Remove contact
              </button>
            </div>
          </div>
        ))}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          name="name"
          value={draft.name}
          onChange={handleChange}
          placeholder="Contact name"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white"
        />
        <input
          name="relationship"
          value={draft.relationship}
          onChange={handleChange}
          placeholder="Relationship"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white"
        />
        <input
          name="phone"
          value={draft.phone}
          onChange={handleChange}
          placeholder="Phone number"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white"
        />
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white">
          <input name="isICE" type="checkbox" checked={draft.isICE} onChange={handleChange} />
          Mark as ICE contact
        </label>

        <button type="submit" className={PRIMARY_BUTTON_CLASS}>
          {draft.id ? 'Update contact' : 'Add contact'}
        </button>
      </form>
    </div>
  )
}
