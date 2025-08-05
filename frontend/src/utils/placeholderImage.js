// Simple placeholder image as a data URL to avoid external dependencies
export const PLACEHOLDER_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDY0MCAzNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2NDAiIGhlaWdodD0iMzYwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0yODAgMTgwTDMyMCAxNDBIMzYwVjIyMEgzMjBMMjgwIDE4MFoiIGZpbGw9IiM2Qjc0ODgiLz4KPHN2ZyB4PSIyNDAiIHk9IjE0MCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSI4MCI+Cjx0ZXh0IHg9IjgwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOUI5Qjk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBWaWRlbzwvdGV4dD4KPHN2Zz4KPC9zdmc+"

// Alternative placeholder for different sizes
export const getPlaceholderImage = (width = 640, height = 360, text = "No Video") => {
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#374151"/>
      <path d="M${width/2 - 40} ${height/2}L${width/2} ${height/2 - 40}H${width/2 + 40}V${height/2 + 40}H${width/2}L${width/2 - 40} ${height/2}Z" fill="#6B7488"/>
      <text x="${width/2}" y="${height/2 + 25}" font-family="Arial, sans-serif" font-size="18" fill="#9B9B99" text-anchor="middle">${text}</text>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

// Placeholder for course thumbnails
export const COURSE_PLACEHOLDER = getPlaceholderImage(300, 200, "Course Image")

// Placeholder for video thumbnails
export const VIDEO_PLACEHOLDER = getPlaceholderImage(640, 360, "No Video")
