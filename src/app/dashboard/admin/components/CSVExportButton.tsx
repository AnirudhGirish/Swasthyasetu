/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function CSVExportButton() {
  const [downloading, setDownloading] = useState(false)

  const handleExport = async () => {
    setDownloading(true)

    const { data, error } = await supabase
      .from('resources')
      .select('*')

    if (error || !data) {
      alert('Failed to export data.')
      setDownloading(false)
      return
    }

    const csv = convertToCSV(data)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `swasthyasetu_data_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()

    URL.revokeObjectURL(url)
    setDownloading(false)
  }

  return (
    <button
      onClick={handleExport}
      disabled={downloading}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm mt-2"
    >
      {downloading ? 'Exporting...' : 'Export as CSV'}
    </button>
  )
}

function convertToCSV(data: any[]): string {
  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}
