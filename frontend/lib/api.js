const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2662/api'
).replace(/\/+$/, '');

export default API_URL;