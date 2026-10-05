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

export default async (request: Request) => {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const raw = new URL(request.url).searchParams.get('src') || '';
  const photoUri = safeGooglePhotoUri(raw);
  if (!photoUri) return new Response('Not found', { status: 404 });

  try {
    const response = await fetch(photoUri, {
      signal: AbortSignal.timeout(8000),
      headers: {
        accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.toLowerCase().startsWith('image/')) {
      return new Response('Not found', { status: 404 });
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
    return new Response('Not found', { status: 404 });
  }
};

export const config = {
  path: '/api/google-review-photo',
};
