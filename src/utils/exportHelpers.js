import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function downloadExcel(data, filename = 'export.xlsx') {
  if (!Array.isArray(data) || data.length === 0) return

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  saveAs(blob, filename)
}

export function downloadPDF(data, title = 'Export', columns = []) {
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(14)
  doc.text(title, 14, 20)

  const headers = columns.length > 0 ? columns.map((col) => ({ header: col, dataKey: col })) : Object.keys(data[0] || {}).map((key) => ({ header: key, dataKey: key }))
  const rows = data.map((item) => {
    const row = {}
    headers.forEach((col) => {
      row[col.dataKey] = item[col.dataKey] ?? ''
    })
    return row
  })

  doc.autoTable({
    startY: 26,
    head: [headers.map(h => h.header)],
    body: rows.map(row => headers.map(h => row[h.dataKey])),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [78, 115, 223] },
  })

  doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.pdf`)
}
