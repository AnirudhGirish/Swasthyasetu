export async function getCurrentPosition(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported')
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position, 'position')
        resolve(position)
      },
      (error) => {
        console.warn('Geolocation error:', error?.message || error)
        resolve(null)
      }
    )
  })
}
