const GOOGLE_PROFILE_URL = 'https://share.google/o8vbV41rlIalXuJp7';
const GOOGLE_PLACE_ID = 'ChIJRe3_2HIrRI4RrBVCtwBbwqk';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
    },
  });
}

function resolvePlaceId() {
  return Netlify.env.get('GOOGLE_PLACE_ID')?.trim() || GOOGLE_PLACE_ID;
}

function normalizeReview(review: any) {
  const author = review?.authorAttribution || {};

  return {
    rating: Number(review?.rating) || 0,
    text: review?.text?.text || review?.originalText?.text || '',
    relativeTime: review?.relativePublishTimeDescription || '',
    publishTime: review?.publishTime || null,
    googleMapsUri: review?.googleMapsUri || null,
    author: {
      name: author?.displayName || 'Usuario de Google',
      uri: author?.uri || null,
      photoUri: author?.photoUri || null,
    },
  };
}

export default async (request: Request) => {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const rawApiKey =
    Netlify.env.get('GOOGLE_API_KEY') ||
    Netlify.env.get('GOOGLE_PLACES_API_KEY');
  const apiKey = rawApiKey?.replace(/\\_/g, '_').trim();
  if (!apiKey) {
    return json({
      configured: false,
      googleProfileUrl: GOOGLE_PROFILE_URL,
    }, 503);
  }

  try {
    const placeId = resolvePlaceId();
    if (!placeId) {
      return json({
        configured: false,
        googleProfileUrl: GOOGLE_PROFILE_URL,
        error: 'Google Place ID not found',
      }, 503);
    }

    const fields = [
      'displayName',
      'rating',
      'userRatingCount',
      'reviews',
      'googleMapsUri',
      'formattedAddress',
      'location',
    ].join(',');

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=es&regionCode=CO`,
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
        googleProfileUrl: GOOGLE_PROFILE_URL,
        error: 'Google Places request failed',
      }, 502);
    }

    const place = await response.json();
    const reviews = Array.isArray(place?.reviews)
      ? place.reviews.slice(0, 3).map(normalizeReview)
      : [];

    return json({
      configured: true,
      placeId,
      name: place?.displayName?.text || 'Soluciones GEA',
      rating: Number(place?.rating) || null,
      reviewCount: Number(place?.userRatingCount) || 0,
      googleProfileUrl: place?.googleMapsUri || GOOGLE_PROFILE_URL,
      address: place?.formattedAddress || 'Medellín, Antioquia',
      location: place?.location && Number.isFinite(place.location.latitude) && Number.isFinite(place.location.longitude)
        ? { latitude: place.location.latitude, longitude: place.location.longitude }
        : null,
      orderingNotice: 'Mostramos hasta 3 opiniones seleccionadas por relevancia por Google Maps.',
      reviews,
    });
  } catch {
    return json({
      configured: true,
      googleProfileUrl: GOOGLE_PROFILE_URL,
      error: 'Unable to load Google reviews',
    }, 502);
  }
};

export const config = {
  path: '/api/google-reviews',
};
