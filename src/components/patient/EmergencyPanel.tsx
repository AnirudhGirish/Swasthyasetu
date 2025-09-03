'use client'

type Service = {
  name: string
  number: string
  emoji: string
}

const services: Service[] = [
  { name: 'Ambulance', number: '102', emoji: '🚑' },
  { name: 'Police', number: '100', emoji: '🚓' },
  { name: 'Fire', number: '101', emoji: '🚒' },
]

export default function EmergencyPanel() {
  const handleCall = (service: Service) => {
    const telLink = `tel:${service.number}`
    if (typeof window !== 'undefined') {
      window.open(telLink)
    } else {
      alert(`${service.name} Number: ${service.number}`)
    }
  }

  return (
    <div className="bg-white rounded-lg border shadow p-4 w-full">
      <h2 className="text-lg font-semibold mb-4">Emergency Services</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {services.map((s) => (
          <button
            key={s.name}
            onClick={() => handleCall(s)}
            className="flex items-center justify-center gap-2 p-4 rounded border hover:bg-gray-50 transition text-sm font-medium shadow-sm"
          >
            <span className="text-2xl">{s.emoji}</span>
            <div>
              <div>{s.name}</div>
              <div className="text-xs text-gray-500">Dial {s.number}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
