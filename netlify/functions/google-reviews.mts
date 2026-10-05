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

function normalizeNewReview(review: any) {
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
    source: 'relevant',
  };
}

function normalizeLegacyReview(review: any) {
  return {
    rating: Number(review?.rating) || 0,
    text: String(review?.text || ''),
    relativeTime: String(review?.relative_time_description || ''),
    publishTime: Number.isFinite(Number(review?.time))
      ? new Date(Number(review.time) * 1000).toISOString()
      : null,
    author: {
      name: String(review?.author_name || 'Usuario de Google').trim(),
      photoUri: safeGooglePhotoUri(review?.profile_photo_url),
    },
    source: 'newest',
  };
}

function reviewKey(review: any) {
  const name = String(review?.author?.name || '').trim().toLowerCase();
  const text = String(review?.text || '').trim().toLowerCase();
  return `${name}::${text}`;
}

function mergeUnique(...groups: any[][]) {
  const seen = new Set<string>();
  const merged: any[] = [];

  for (const group of groups) {
    for (const review of group) {
      const key = reviewKey(review);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(review);
    }
  }

  return merged;
}

async function fetchNewPlaces(apiKey: string) {
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
      signal: AbortSignal.timeout(8000),
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fields,
      },
    },
  );

  if (!response.ok) return null;
  return response.json();
}

async function fetchLegacyPlaces(
  apiKey: string,
  reviewsSort: 'newest' | 'most_relevant',
  language?: string,
) {
  const params = new URLSearchParams({
    place_id: GOOGLE_PLACE_ID,
    fields: 'name,rating,user_ratings_total,reviews,formatted_address,url,geometry',
    reviews_sort: reviewsSort,
    key: apiKey,
  });

  if (language) params.set('language', language);

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`,
    { signal: AbortSignal.timeout(8000), headers: { accept: 'application/json' } },
  );

  if (!response.ok) return null;
  const payload = await response.json();
  if (payload?.status !== 'OK' || !payload?.result) return null;
  return payload.result;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': status === 200
        ? 'public, max-age=600, s-maxage=3600'
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
    const results = await Promise.allSettled([
      fetchNewPlaces(apiKey),
      fetchLegacyPlaces(apiKey, 'newest', 'es'),
      fetchLegacyPlaces(apiKey, 'most_relevant'),
    ]);

    const [newPlace, legacyNewest, legacyRelevant] = results.map((result) =>
      result.status === 'fulfilled' ? result.value : null);

    if (!newPlace && !legacyNewest && !legacyRelevant) {
      return json({
        configured: true,
        reason: 'google_places_failed',
      }, 502);
    }

    const relevant = Array.isArray(newPlace?.reviews)
      ? newPlace.reviews.map(normalizeNewReview)
      : [];
    const newest = Array.isArray(legacyNewest?.reviews)
      ? legacyNewest.reviews.map(normalizeLegacyReview)
      : [];
    const broadlyRelevant = Array.isArray(legacyRelevant?.reviews)
      ? legacyRelevant.reviews.map(normalizeLegacyReview)
      : [];
    const reviews = mergeUnique(relevant, newest, broadlyRelevant).slice(0, 5);

    const legacyPlace = legacyNewest || legacyRelevant;
    const legacyLocation = legacyPlace?.geometry?.location;
    const latitude = Number(newPlace?.location?.latitude ?? legacyLocation?.lat);
    const longitude = Number(newPlace?.location?.longitude ?? legacyLocation?.lng);

    return json({
      configured: true,
      placeId: GOOGLE_PLACE_ID,
      name:
        newPlace?.displayName?.text ||
        legacyPlace?.name ||
        'Soluciones GEA',
      rating: Number(newPlace?.rating ?? legacyPlace?.rating) || null,
      reviewCount:
        Number(newPlace?.userRatingCount ?? legacyPlace?.user_ratings_total) || 0,
      address:
        newPlace?.formattedAddress ||
        legacyPlace?.formatted_address ||
        'Cra. 141 #62-86, Medellín, Antioquia',
      location: Number.isFinite(latitude) && Number.isFinite(longitude)
        ? { latitude, longitude }
        : null,
      googleProfileUrl:
        newPlace?.googleMapsLinks?.placeUri ||
        newPlace?.googleMapsUri ||
        legacyPlace?.url ||
        'https://share.google/o8vbV41rlIalXuJp7',
      writeReviewUrl:
        newPlace?.googleMapsLinks?.writeAReviewUri ||
        `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`,
      directionsUrl:
        newPlace?.googleMapsLinks?.directionsUri ||
        `https://www.google.com/maps/dir/?api=1&destination_place_id=${GOOGLE_PLACE_ID}`,
      orderingNotice:
        'Reseñas reales de Google combinadas entre relevantes y más recientes, sin duplicados.',
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
