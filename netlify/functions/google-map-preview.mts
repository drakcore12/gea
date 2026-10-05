const ADDRESS = 'Cra. 141 #62-86, Medellín, Antioquia';

function svgFallback() {
  const body = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="Ubicación de Soluciones GEA">
      <rect width="1280" height="720" fill="#eef3f8"/>
      <path d="M0 135h1280M0 300h1280M0 520h1280M220 0v720M520 0v720M870 0v720M1080 0v720" stroke="#d3dde8" stroke-width="18"/>
      <path d="M-80 620 560 100M520 760 1180 120" stroke="#ffffff" stroke-width="42"/>
      <circle cx="650" cy="360" r="64" fill="#011949"/>
      <path d="M650 278c-50 0-90 40-90 90 0 68 90 154 90 154s90-86 90-154c0-50-40-90-90-90Zm0 126a36 36 0 1 1 0-72 36 36 0 0 1 0 72Z" fill="#fe8601"/>
      <rect x="290" y="560" width="700" height="92" rx="24" fill="#ffffff" opacity=".96"/>
      <text x="640" y="602" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#011949">Soluciones GEA</text>
      <text x="640" y="636" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#42566f">Cra. 141 #62-86 · Medellín, Antioquia</text>
    </svg>`;
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}

export default async (request: Request) => {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const rawApiKey =
    Netlify.env.get('GOOGLE_API_KEY') ||
    Netlify.env.get('GOOGLE_PLACES_API_KEY');
  const apiKey = rawApiKey?.replace(/\\_/g, '_').trim();

  if (!apiKey) return svgFallback();

  try {
    const params = new URLSearchParams({
      center: ADDRESS,
      zoom: '16',
      size: '640x360',
      scale: '2',
      maptype: 'roadmap',
      key: apiKey,
    });
    params.append('markers', `color:0x011949|label:G|${ADDRESS}`);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`,
      { headers: { accept: 'image/avif,image/webp,image/png,image/*,*/*;q=0.8' } },
    );

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.toLowerCase().startsWith('image/')) {
      return svgFallback();
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=86400, s-maxage=604800',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch {
    return svgFallback();
  }
};

export const config = {
  path: '/api/google-map-preview',
};
