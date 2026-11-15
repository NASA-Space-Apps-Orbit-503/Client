/** Saves text content as a file in the browser. Client-only. */
export function downloadTextFile(content: string, filename: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.append(link)
  link.click()
  link.remove()
  // Give the browser time to start the download before releasing the blob
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
