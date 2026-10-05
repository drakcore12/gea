const GOOGLE_PLACE_ID = 'ChIJRe3_2HIrRI4RrBVCtwBbwqk';
const FALLBACK_ADDRESS = 'Cra. 141 #62-86, Medellín, Antioquia';

function resolveApiKey() {
  const candidates = [
    'GOOGLE_API_KEY',
    'GOOGLE_PLACES_API_KEY',
    'GOOGLE_MAPS_API_KEY',
    'GOOGLE_MAPS_KEY',
    'GOOGLE_MAPS_PLATFORM_API_KEY',
  ];

  for (const name of candidates) {
    const value = Netlify.env.get(name);
    if (value?.trim()) return value.replace(/\\_/g, '_').trim();
  }

  return '';
}

function htmlDocument(query: string) {
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ubicación de Soluciones GEA</title>
<style>
html,body,iframe{width:100%;height:100%;margin:0;border:0}
body{overflow:hidden;background:#eef3f8}
iframe{display:block}
</style>
</head>
<body>
<iframe
  title="Ubicación de Soluciones GEA en Google Maps"
  src="${mapUrl}"
  loading="eager"
  referrerpolicy="no-referrer-when-downgrade"
  allowfullscreen
></iframe>
</body>
</html>`;
}

export default async (request: Request) => {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  let query = FALLBACK_ADDRESS;
  const apiKey = resolveApiKey();

  if (apiKey) {
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${GOOGLE_PLACE_ID}?languageCode=es&regionCode=CO`,
        {
          headers: {
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'location,formattedAddress',
          },
        },
      );

      if (response.ok) {
        const place = await response.json();
        const latitude = Number(place?.location?.latitude);
        const longitude = Number(place?.location?.longitude);

        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
          query = `${latitude},${longitude}`;
        } else if (place?.formattedAddress) {
          query = String(place.formattedAddress);
        }
      }
    } catch {
      // Se conserva la dirección verificada como fallback.
    }
  }

  return new Response(htmlDocument(query), {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=900, s-maxage=21600',
      'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; frame-src https://www.google.com https://maps.google.com; img-src https://*.googleusercontent.com data:; connect-src https://www.google.com https://maps.google.com; base-uri 'none'; form-action 'none'",
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
    },
  });
};

export const config = {
  path: '/api/google-map-embed',
};
