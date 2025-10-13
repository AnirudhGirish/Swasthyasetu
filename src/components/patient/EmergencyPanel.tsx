'use client'

type Service = {
  name: string
  number: string
  emoji: string
  description: string
  color: string
}

const services: Service[] = [
    { 
    name: 'National Helpline', 
    number: '112', 
    emoji: '📞', 
    description: 'Central Helpline for all Emergency',
    color: 'from-sky-500 to-sky-600'
  },
  { 
    name: 'Ambulance', 
    number: '108', 
    emoji: '🚑', 
    description: 'Medical Emergency',
    color: 'from-red-500 to-red-300'
  },
  { 
    name: 'Police', 
    number: '100', 
    emoji: '🚓', 
    description: 'Security Emergency',
    color: 'from-blue-500 to-red-600'
  },
  { 
    name: 'Fire Brigade', 
    number: '101', 
    emoji: '🚒', 
    description: 'Fire Emergency',
    color: 'from-yellow-500 to-red-400'
  },
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
    <div className="bg-white rounded-3xl border-2 border-red-400 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-600 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-black">
            <svg className="w-7 h-7 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Emergency Services</h2>
            <p className="text-white text-sm">24/7 immediate assistance - Tap to call</p>
          </div>
        </div>
      </div>

      {/* Emergency Services Grid */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {services.map((service) => (
            <button
              key={service.name}
              onClick={() => handleCall(service)}
              className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-gray-100 hover:border-red-200 overflow-hidden"
            >
              {/* Background Animation */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              {/* Content */}
              <div className="relative z-10 text-center space-y-4">
                <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl">{service.emoji}</span>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${service.color} text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {service.number}
                  </div>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-red-300 transition-colors duration-300"></div>
            </button>
          ))}
        </div>

        {/* Important Notice */}
        <div className="mt-8 bg-red-100/80 backdrop-blur-sm rounded-2xl p-6 border border-red-300">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-red-900 mb-2">Emergency Guidelines</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Keep your phone line free for callback if needed</li>
                <li>• Stay calm and provide clear location information</li>
                <li>• Follow operator instructions carefully</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}