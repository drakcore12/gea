const GOOGLE_PLACE_ID = 'ChIJRe3_2HIrRI4RrBVCtwBbwqk';

function json(data: unknown, status = 200, cacheControl = 'public, max-age=900, s-maxage=21600') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cacheControl,
    },
  });
}

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

export default async (request: Request) => {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405, 'no-store');
  }

  const rawApiKey =
    Netlify.env.get('GOOGLE_API_KEY') ||
    Netlify.env.get('GOOGLE_PLACES_API_KEY');
  const apiKey = rawApiKey?.replace(/\\_/g, '_').trim();

  if (!apiKey) {
    return json({ configured: false, reviews: [] }, 503, 'no-store');
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${GOOGLE_PLACE_ID}?languageCode=es&regionCode=CO`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'reviews',
        },
      },
    );

    if (!response.ok) {
      return json({ configured: true, reviews: [], error: 'Google Places request failed' }, 502, 'no-store');
    }

    const place = await response.json();
    const reviews = Array.isArray(place?.reviews)
      ? place.reviews.map((review: any) => ({
          name: String(review?.authorAttribution?.displayName || '').trim(),
          photoUri: safeGooglePhotoUri(review?.authorAttribution?.photoUri),
        })).filter((review: any) => review.name && review.photoUri)
      : [];

    return json({ configured: true, reviews });
  } catch {
    return json({ configured: true, reviews: [], error: 'Unable to load Google review avatars' }, 502, 'no-store');
  }
};

export const config = {
  path: '/api/google-review-avatars',
};
