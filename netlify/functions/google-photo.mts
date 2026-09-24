const GOOGLE_PLACE_ID = 'ChIJRe3_2HIrRI4RrBVCtwBbwqk';

function safeGooglePhotoUri(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const isGoogleUserContent =
      hostname === 'googleusercontent.com' ||
      hostname.endsWith('.googleusercontent.com');

    if (url.protocol !== 'https:' || !isGoogleUserContent) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function textResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
    },
  });
}

export default async (request: Request) => {
  if (request.method !== 'GET') {
    return textResponse('Method not allowed', 405);
  }

  const rawApiKey =
    Netlify.env.get('GOOGLE_API_KEY') ||
    Netlify.env.get('GOOGLE_PLACES_API_KEY');
  const apiKey = rawApiKey?.replace(/\\_/g, '_').trim();
  if (!apiKey) return textResponse('Google API not configured', 503);

  const url = new URL(request.url);
  const photoName = url.searchParams.get('name')?.trim() || '';
  const expectedPrefix = `places/${GOOGLE_PLACE_ID}/photos/`;

  if (!photoName.startsWith(expectedPrefix) || photoName.length > 700) {
    return textResponse('Invalid photo reference', 400);
  }

  try {
    const mediaResponse = await fetch(
      `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=900&skipHttpRedirect=true`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
        },
      },
    );

    if (!mediaResponse.ok) return textResponse('Photo unavailable', 502);

    const payload = await mediaResponse.json();
    const photoUri = safeGooglePhotoUri(payload?.photoUri);
    if (!photoUri) return textResponse('Photo unavailable', 502);

    return new Response(null, {
      status: 302,
      headers: {
        location: photoUri,
        'cache-control': 'private, max-age=300',
      },
    });
  } catch {
    return textResponse('Photo unavailable', 502);
  }
};

export const config = {
  path: '/api/google-photo',
};
