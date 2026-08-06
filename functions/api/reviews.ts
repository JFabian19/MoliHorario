interface Env {
  TURNSTILE_SECRET_KEY?: string;
  APPS_SCRIPT_API_URL?: string;
  APPS_SCRIPT_SHARED_SECRET?: string;
}

const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyfzmK7NRDUJs-zjVuzK7GY_uI7fnK46LeM3aFyH-sPSBEOOan1Q3jbaG02izrHx260gA/exec';

const AUTHORIZED_TAGS = new Set([
  'Explica claro',
  'Evaluación exigente',
  'Buena disposición',
  'Puntual',
  'Organizado',
  'Mucha carga',
  'Brinda retroalimentación',
  'Clases dinámicas',
  'Recomendado para aprender',
  'Requiere bastante estudio'
]);

function json(data: any, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...extraHeaders,
    },
  });
}

export const onRequestOptions = async () => {
  return json({ ok: true });
};

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  try {
    const url = new URL(context.request.url);
    const professorKey = url.searchParams.get('professor_key');
    const courseCode = url.searchParams.get('course_code');
    const period = url.searchParams.get('period');

    const appsScriptUrl = context.env.APPS_SCRIPT_API_URL || DEFAULT_APPS_SCRIPT_URL;

    const targetUrl = new URL(appsScriptUrl);
    if (professorKey) targetUrl.searchParams.set('professor_key', professorKey);
    if (courseCode) targetUrl.searchParams.set('course_code', courseCode);
    if (period) targetUrl.searchParams.set('period', period);

    const backendRes = await fetch(targetUrl.toString());
    if (!backendRes.ok) {
      return json({ success: false, message: 'Failed to fetch reviews backend' }, 502);
    }

    const data: any = await backendRes.json();
    return json(data, 200, {
      'Cache-Control': 'public, max-age=180, s-maxage=300'
    });
  } catch (error: any) {
    return json({ success: false, message: 'Internal server error', error: error.message }, 500);
  }
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const contentType = context.request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return json({ success: false, message: 'Content-Type must be application/json' }, 400);
    }

    const bodyText = await context.request.text();
    if (bodyText.length > 10240) { // 10 KB size limit
      return json({ success: false, message: 'Payload size limit exceeded' }, 413);
    }

    let payload: any;
    try {
      payload = JSON.parse(bodyText);
    } catch (e) {
      return json({ success: false, message: 'Invalid JSON payload' }, 400);
    }

    // 1. Check Honeypot field (must be empty)
    if (payload.website || payload.hp_field) {
      return json({ success: false, message: 'Spam detected' }, 400);
    }

    // 2. Validate Turnstile token if secret key is present
    const turnstileSecret = context.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret && payload.turnstileToken) {
      const tsFormData = new FormData();
      tsFormData.append('secret', turnstileSecret);
      tsFormData.append('response', payload.turnstileToken);

      const tsRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: tsFormData,
      });

      const tsOutcome: any = await tsRes.json();
      if (!tsOutcome.success) {
        return json({ success: false, message: 'Turnstile CAPTCHA verification failed' }, 403);
      }
    }

    // 3. Schema & Content Validation
    const { professor_key, professor_name, course_code, course_name, period, rating, tags } = payload;

    if (!professor_key || !professor_name || !course_code) {
      return json({ success: false, message: 'Professor key, name, and course code are required' }, 400);
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5 || !Number.isInteger(numRating)) {
      return json({ success: false, message: 'Rating must be an integer between 1 and 5' }, 400);
    }

    // Validate tags (max 3, must belong to authorized list)
    const validTags: string[] = [];
    if (Array.isArray(tags)) {
      for (const tag of tags.slice(0, 3)) {
        if (AUTHORIZED_TAGS.has(String(tag))) {
          validTags.push(String(tag));
        }
      }
    }

    // Forward to Google Apps Script
    const appsScriptUrl = context.env.APPS_SCRIPT_API_URL || DEFAULT_APPS_SCRIPT_URL;
    const sharedSecret = context.env.APPS_SCRIPT_SHARED_SECRET;

    const backendPayload = {
      secret: sharedSecret || '',
      professor_key,
      professor_name,
      course_code,
      course_name: course_name || '',
      period: period || '2026-II',
      rating: numRating,
      tags: validTags,
      comment: ''
    };

    const scriptRes = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload)
    });

    const scriptData: any = await scriptRes.json();
    return json(scriptData);
  } catch (error: any) {
    return json({ success: false, message: 'Server error processing review', error: error.message }, 500);
  }
};
