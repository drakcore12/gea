const GOOGLE_PROFILE_URL = 'https://share.google/o8vbV41rlIalXuJp7';
const FALLBACK_QUERY = 'Soluciones GEA Ingeniería Integral Medellín Colombia';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
    },
  });
}

async function resolvePlaceId(apiKey: string) {
  const configuredPlaceId = Netlify.env.get('GOOGLE_PLACE_ID')?.trim();
  if (configuredPlaceId) return configuredPlaceId;

  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName',
    },
    body: JSON.stringify({
      textQuery: FALLBACK_QUERY,
      languageCode: 'es',
      regionCode: 'CO',
      maxResultCount: 1,
    }),
  });

  if (!response.ok) return null;
  const payload = await response.json();
  return payload?.places?.[0]?.id || null;
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

  const apiKey =
    Netlify.env.get('GOOGLE_API_KEY')?.trim() ||
    Netlify.env.get('GOOGLE_PLACES_API_KEY')?.trim();
  if (!apiKey) {
    return json({
      configured: false,
      googleProfileUrl: GOOGLE_PROFILE_URL,
    }, 503);
  }

  try {
    const placeId = await resolvePlaceId(apiKey);
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
