export const config = {
  runtime: 'edge',
};

const VRM_LOOKUP_URL = 'https://vrm.mamsoft.co.uk/vrmlookup/vrmlookup.asmx/Find';
const DEFAULT_USERNAME = 'ASPGWS';
const DEFAULT_PASSWORD = 'FK6NG8E3';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only allow GET requests for Shopify proxy compatibility
  if (req.method !== 'GET') {
    return new Response('Method not allowed', {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }

  const url = new URL(req.url);
  const vrm = url.searchParams.get('vrm');
  const username = url.searchParams.get('username') || DEFAULT_USERNAME;
  const password = url.searchParams.get('password') || DEFAULT_PASSWORD;

  if (!vrm) {
    return new Response(
      JSON.stringify({ error: 'VRM parameter is required' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }

  try {
    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('Username', username);
    formData.append('Password', password);
    formData.append('Vrm', vrm);

    // Make the request to the VRM lookup service with Vercel Data Cache (expires every 12 hours)
    const response = await fetch(VRM_LOOKUP_URL, {
      method: 'POST',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8,ru-RU;q=0.7',
        'Cache-Control': 'public, s-maxage=43200', // Cache for 12 hours
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://vrm.mamsoft.co.uk',
        'Priority': 'u=0, i',
        'Referer': 'https://vrm.mamsoft.co.uk/vrmlookup/vrmlookup.asmx?op=Find',
        'Sec-CH-UA': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        'Sec-CH-UA-Mobile': '?1',
        'Sec-CH-UA-Platform': '"Android"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
      },
      body: formData.toString(),
      cache: 'default', // Use default caching behavior with Cache-Control header
    });

    if (!response.ok) {
      throw new Error(`VRM lookup service returned status: ${response.status}`);
    }

    const xmlResponse = await response.text();

    // Clean up the XML response by removing script tags, namespaces, and other unwanted elements
    const cleanedXml = xmlResponse
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<script[^>]*\/>/g, '')
      .replace(/\s+xmlns[^=]*="[^"]*"/g, '')
      .replace(/\s+xsi:type="[^"]*"/g, '')
      .replace(/\s+xmlns:xsd="[^"]*"/g, '')
      .replace(/\s+xmlns:xsi="[^"]*"/g, '')
      .trim();

    // Return the cleaned XML response
    return new Response(cleanedXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('VRM lookup error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to lookup vehicle information',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}
