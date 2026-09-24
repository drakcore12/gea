const GOOGLE_PROFILE_URL = 'https://share.google/o8vbV41rlIalXuJp7';
const GOOGLE_PLACE_ID = 'ChIJRe3_2HIrRI4RrBVCtwBbwqk';

function json(data: unknown, status = 200) {
  const success = status >= 200 && status < 300;
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
      'netlify-cdn-cache-control': success
        ? 'public, durable, max-age=30, stale-while-revalidate=30'
        : 'no-store',
    },
  });
}

function resolvePlaceId() {
  return Netlify.env.get('GOOGLE_PLACE_ID')?.trim() || GOOGLE_PLACE_ID;
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

function normalizePlacesReview(review: any) {
  const author = review?.authorAttribution || {};

  return {
    id: null,
    rating: Number(review?.rating) || 0,
    text: review?.text?.text || review?.originalText?.text || '',
    relativeTime: review?.relativePublishTimeDescription || '',
    publishTime: review?.publishTime || null,
    updateTime: review?.publishTime || null,
    author: {
      name: author?.displayName || 'Usuario de Google',
      photoUri: safeGooglePhotoUri(author?.photoUri),
    },
  };
}

const STAR_RATINGS: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

function reviewDateLabel(value: unknown) {
  if (typeof value !== 'string' || !value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function normalizeBusinessProfileReview(review: any) {
  const reviewer = review?.reviewer || {};
  const publishTime = review?.createTime || null;
  const updateTime = review?.updateTime || publishTime;
  const rawRating = review?.starRating;
  const rating = typeof rawRating === 'number'
    ? rawRating
    : STAR_RATINGS[String(rawRating || '').toUpperCase()] || 0;

  return {
    id: typeof review?.reviewId === 'string' ? review.reviewId : null,
    rating,
    text: typeof review?.comment === 'string' ? review.comment : '',
    relativeTime: reviewDateLabel(updateTime || publishTime),
    publishTime,
    updateTime,
    author: {
      name: reviewer?.displayName || 'Usuario de Google',
      photoUri: safeGooglePhotoUri(reviewer?.profilePhotoUrl),
    },
  };
}

function normalizedResourceId(value: string | undefined, prefix: string) {
  if (!value) return '';
  return value.trim().replace(new RegExp(`^${prefix}/`), '');
}

function businessProfileConfig() {
  const clientId = Netlify.env.get('GBP_CLIENT_ID')?.trim();
  const clientSecret = Netlify.env.get('GBP_CLIENT_SECRET')?.trim();
  const refreshToken = Netlify.env.get('GBP_REFRESH_TOKEN')?.trim();
  const accountId = normalizedResourceId(Netlify.env.get('GBP_ACCOUNT_ID'), 'accounts');
  const locationId = normalizedResourceId(Netlify.env.get('GBP_LOCATION_ID'), 'locations');

  if (!clientId || !clientSecret || !refreshToken || !accountId || !locationId) {
    return null;
  }

  return { clientId, clientSecret, refreshToken, accountId, locationId };
}

async function getBusinessProfileAccessToken(config: ReturnType<typeof businessProfileConfig>) {
  if (!config) return null;

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: config.refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new Error('Google Business Profile OAuth refresh failed');
  }

  const payload = await response.json();
  return typeof payload?.access_token === 'string' ? payload.access_token : null;
}

async function fetchAllBusinessProfileReviews() {
  const config = businessProfileConfig();
  if (!config) return null;

  const accessToken = await getBusinessProfileAccessToken(config);
  if (!accessToken) return null;

  const reviews: any[] = [];
  let nextPageToken = '';
  let averageRating: number | null = null;
  let totalReviewCount: number | null = null;
  let pageCount = 0;

  do {
    const url = new URL(
      `https://mybusiness.googleapis.com/v4/accounts/${encodeURIComponent(config.accountId)}/locations/${encodeURIComponent(config.locationId)}/reviews`,
    );
    url.searchParams.set('pageSize', '50');
    if (nextPageToken) url.searchParams.set('pageToken', nextPageToken);

    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${accessToken}`,
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Business Profile reviews request failed with ${response.status}`);
    }

    const payload = await response.json();
    if (Number.isFinite(Number(payload?.averageRating))) {
      averageRating = Number(payload.averageRating);
    }
    if (Number.isInteger(Number(payload?.totalReviewCount))) {
      totalReviewCount = Number(payload.totalReviewCount);
    }

    if (Array.isArray(payload?.reviews)) {
      reviews.push(...payload.reviews.map(normalizeBusinessProfileReview));
    }

    nextPageToken = typeof payload?.nextPageToken === 'string'
      ? payload.nextPageToken
      : '';
    pageCount += 1;
  } while (nextPageToken && pageCount < 100);

  reviews.sort((a, b) => {
    const aTime = Date.parse(a.updateTime || a.publishTime || '') || 0;
    const bTime = Date.parse(b.updateTime || b.publishTime || '') || 0;
    return bTime - aTime;
  });

  const computedRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : null;

  return {
    source: 'business-profile',
    realtime: true,
    rating: averageRating ?? computedRating,
    reviewCount: totalReviewCount ?? reviews.length,
    reviews,
  };
}

async function fetchPlacesData(apiKey: string | undefined, placeId: string) {
  if (!apiKey || !placeId) return null;

  const fields = [
    'displayName',
    'rating',
    'userRatingCount',
    'reviews',
    'googleMapsUri',
    'formattedAddress',
    'location',
    'googleMapsLinks',
    'photos',
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
    throw new Error('Google Places request failed');
  }

  return response.json();
}

export default async (request: Request) => {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const placeId = resolvePlaceId();
  const rawApiKey =
    Netlify.env.get('GOOGLE_API_KEY') ||
    Netlify.env.get('GOOGLE_PLACES_API_KEY');
  const apiKey = rawApiKey?.replace(/\\_/g, '_').trim();

  try {
    const [businessProfileResult, place] = await Promise.all([
      fetchAllBusinessProfileReviews().catch(() => null),
      fetchPlacesData(apiKey, placeId).catch(() => null),
    ]);

    if (!businessProfileResult && !place) {
      return json({
        configured: false,
        googleProfileUrl: GOOGLE_PROFILE_URL,
        error: 'Google reviews integration is not configured',
      }, 503);
    }

    const placesReviews = Array.isArray(place?.reviews)
      ? place.reviews.slice(0, 3).map(normalizePlacesReview)
      : [];

    const reviews = businessProfileResult?.reviews || placesReviews;
    const rating = businessProfileResult?.rating ?? Number(place?.rating) || null;
    const reviewCount =
      businessProfileResult?.reviewCount ??
      Number(place?.userRatingCount) ||
      reviews.length;

    const photos = Array.isArray(place?.photos)
      ? place.photos.slice(0, 10).map((photo: any) => ({
          src: typeof photo?.name === 'string' && photo.name.startsWith(`places/${placeId}/photos/`)
            ? `/api/google-photo?name=${encodeURIComponent(photo.name)}`
            : null,
          width: Number(photo?.widthPx) || null,
          height: Number(photo?.heightPx) || null,
          attribution: Array.isArray(photo?.authorAttributions)
            ? photo.authorAttributions
                .map((author: any) => String(author?.displayName || '').trim())
                .filter(Boolean)
                .slice(0, 2)
            : [],
        })).filter((photo: any) => photo.src)
      : [];

    const isBusinessProfile = businessProfileResult?.source === 'business-profile';

    return json({
      configured: true,
      source: isBusinessProfile ? 'business-profile' : 'places',
      realtime: Boolean(isBusinessProfile),
      placeId,
      name: place?.displayName?.text || 'Soluciones GEA',
      rating,
      reviewCount,
      googleProfileUrl:
        place?.googleMapsLinks?.placeUri ||
        place?.googleMapsUri ||
        GOOGLE_PROFILE_URL,
      writeReviewUrl:
        place?.googleMapsLinks?.writeAReviewUri ||
        `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`,
      reviewsUrl:
        place?.googleMapsLinks?.reviewsUri ||
        place?.googleMapsUri ||
        GOOGLE_PROFILE_URL,
      directionsUrl: place?.googleMapsLinks?.directionsUri || null,
      address: place?.formattedAddress || 'Medellín, Antioquia',
      location:
        place?.location &&
        Number.isFinite(place.location.latitude) &&
        Number.isFinite(place.location.longitude)
          ? {
              latitude: place.location.latitude,
              longitude: place.location.longitude,
            }
          : null,
      orderingNotice: isBusinessProfile
        ? 'Todas las opiniones disponibles del Perfil de Negocio de Google, ordenadas de la más reciente a la más antigua.'
        : 'Mostramos hasta 3 opiniones seleccionadas por relevancia por Google Maps mientras se habilita Business Profile API.',
      refreshSeconds: isBusinessProfile ? 30 : null,
      photos,
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
