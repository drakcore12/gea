const GOOGLE_PLACE_ID = 'ChIJRe3_2HIrRI4RrBVCtwBbwqk';

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

function safeGooglePhotoUri(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const allowed =
      hostname === 'googleusercontent.com' ||
      hostname.endsWith('.googleusercontent.com');

    if (url.protocol !== 'https:' || !allowed) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeReview(review: any) {
  const author = review?.authorAttribution || {};

  return {
    rating: Number(review?.rating) || 0,
    text: review?.text?.text || review?.originalText?.text || '',
    relativeTime: review?.relativePublishTimeDescription || '',
    publishTime: review?.publishTime || null,
    author: {
      name: String(author?.displayName || 'Usuario de Google').trim(),
      photoUri: safeGooglePhotoUri(author?.photoUri),
    },
  };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': status === 200
        ? 'public, max-age=900, s-maxage=21600'
        : 'no-store',
    },
  });
}

export default async (request: Request) => {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const apiKey = resolveApiKey();
  if (!apiKey) {
    return json({
      configured: false,
      reason: 'missing_api_key',
    }, 503);
  }

  try {
    const fields = [
      'displayName',
      'rating',
      'userRatingCount',
      'reviews',
      'formattedAddress',
      'location',
      'googleMapsUri',
      'googleMapsLinks',
    ].join(',');

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${GOOGLE_PLACE_ID}?languageCode=es&regionCode=CO`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fields,
        },
      },
    );

    if (!response.ok) {
      return json({
        configured: true,
        reason: 'google_places_failed',
        upstreamStatus: response.status,
      }, 502);
    }

    const place = await response.json();
    const reviews = Array.isArray(place?.reviews)
      ? place.reviews.slice(0, 5).map(normalizeReview)
      : [];

    return json({
      configured: true,
      placeId: GOOGLE_PLACE_ID,
      name: place?.displayName?.text || 'Soluciones GEA',
      rating: Number(place?.rating) || null,
      reviewCount: Number(place?.userRatingCount) || 0,
      address: place?.formattedAddress || 'Cra. 141 #62-86, Medellín, Antioquia',
      location: place?.location && Number.isFinite(place.location.latitude) && Number.isFinite(place.location.longitude)
        ? {
            latitude: place.location.latitude,
            longitude: place.location.longitude,
          }
        : null,
      googleProfileUrl:
        place?.googleMapsLinks?.placeUri ||
        place?.googleMapsUri ||
        'https://share.google/o8vbV41rlIalXuJp7',
      writeReviewUrl:
        place?.googleMapsLinks?.writeAReviewUri ||
        `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`,
      directionsUrl:
        place?.googleMapsLinks?.directionsUri ||
        `https://www.google.com/maps/dir/?api=1&destination_place_id=${GOOGLE_PLACE_ID}`,
      reviews,
    });
  } catch {
    return json({
      configured: true,
      reason: 'unexpected_error',
    }, 502);
  }
};

export const config = {
  path: '/api/google-reviews',
};
