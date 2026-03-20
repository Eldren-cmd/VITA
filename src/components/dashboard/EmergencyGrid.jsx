import EmergencyCard from '@/components/dashboard/EmergencyCard'

export default function EmergencyGrid({ protocols, routePrefix, modeLabel }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {protocols.map((protocol) => (
        <EmergencyCard
          key={protocol.id}
          protocol={protocol}
          routePrefix={routePrefix}
          modeLabel={modeLabel}
        />
      ))}
    </div>
  )
}
