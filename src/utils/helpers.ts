export function formatDate(dateString: string) {
  // quick fix: returning standard locale string because safari was breaking on some formats
  return new Date(dateString).toLocaleDateString()
}

export function formatTime(dateString: string) {
  // TODO: we should probably handle timezones eventually
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
