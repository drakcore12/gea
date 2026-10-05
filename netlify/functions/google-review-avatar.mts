const GOOGLE_PLACE_ID = 'ChIJRe3_2HIrRI4RrBVCtwBbwqk';

const REVIEWERS = new Map([
  ['lala vasquez restrepo', '/assets/img/reviews/avatar-lala-vasquez.svg'],
  ['valentina vasquez restrepo', '/assets/img/reviews/avatar-valentina-vasquez.svg'],
  ['carlos ariel cuartas gomez', '/assets/img/reviews/avatar-carlos-cuartas.svg'],
]);

function normalizeName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function fallback(request: Request, author: string) {
  const path = REVIEWERS.get(normalizeName(author));
  if (!path) return new Response('Not found', { status: 404 });
  return Response.redirect(new URL(path, request.url), 302);
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
    return new Response('Method not allowed', { status: 405 });
  }

  const author = new URL(request.url).searchParams.get('author')?.trim() || '';
  if (!REVIEWERS.has(normalizeName(author))) {
    return new Response('Not found', { status: 404 });
  }

  const rawApiKey =
    Netlify.env.get('GOOGLE_API_KEY') ||
    Netlify.env.get('GOOGLE_PLACES_API_KEY');
  const apiKey = rawApiKey?.replace(/\\_/g, '_').trim();

  if (!apiKey) return fallback(request, author);

  try {
    const placeResponse = await fetch(
      `https://places.googleapis.com/v1/places/${GOOGLE_PLACE_ID}?languageCode=es&regionCode=CO`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'reviews',
        },
      },
    );

    if (!placeResponse.ok) return fallback(request, author);

    const place = await placeResponse.json();
    const targetName = normalizeName(author);
    const review = Array.isArray(place?.reviews)
      ? place.reviews.find((item: any) =>
          normalizeName(String(item?.authorAttribution?.displayName || '')) === targetName)
      : null;

    const photoUri = safeGooglePhotoUri(review?.authorAttribution?.photoUri);
    if (!photoUri) return fallback(request, author);

    const photoResponse = await fetch(photoUri, {
      headers: { accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' },
    });

    const contentType = photoResponse.headers.get('content-type') || '';
    if (!photoResponse.ok || !contentType.toLowerCase().startsWith('image/')) {
      return fallback(request, author);
    }

    return new Response(photoResponse.body, {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=86400, s-maxage=604800',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch {
    return fallback(request, author);
  }
};

export const config = {
  path: '/api/google-review-avatar',
};
