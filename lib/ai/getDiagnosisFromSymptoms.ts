export async function getDiagnosisFromSymptoms(symptoms: string) {
  const res = await fetch('/api/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms }),
  })

  const json = await res.json()

  if (!res.ok || !json.success) {
    console.error('❌ Diagnosis API error:', json.error)
    return null
  }

  return json.diagnosis
}
