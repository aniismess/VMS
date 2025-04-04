import * as XLSX from 'xlsx'

export const downloadToExcel = (data: Record<string, any>[], filename: string) => {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, `${filename}.xlsx`)
} 