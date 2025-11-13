export const config = {
  runtime: 'edge',
};

const CATEGORIES_URL = 'https://www.autocatplus.co.uk/mamcat/mamcat.asmx/GetAllPG';
const CATEGORIES_USERNAME = 'ASPGWS';
const CATEGORIES_PASSWORD = 'FH6NGU54';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

interface Subcategory {
  code: string;
  name: string;
}

interface Category {
  code: string;
  name: string;
  subcategories: Subcategory[];
}

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

  try {
    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('UserName', CATEGORIES_USERNAME);
    formData.append('PassWord', CATEGORIES_PASSWORD);

    // Make the request to the categories service with Vercel Data Cache (expires every 24 hours)
    const response = await fetch(CATEGORIES_URL, {
      method: 'POST',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8,ru-RU;q=0.7',
        'Cache-Control': 'max-age=86400', // Cache for 24 hours
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.autocatplus.co.uk',
        'Priority': 'u=0, i',
        'Referer': 'https://www.autocatplus.co.uk/mamcat/mamcat.asmx?op=GetAllPG',
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
      throw new Error(`Categories service returned status: ${response.status}`);
    }

    const xmlResponse = await response.text();

    // Parse the XML response
    const categories = parseXmlResponse(xmlResponse);

    // Return the categories as JSON
    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Categories lookup error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch categories',
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

function parseXmlResponse(xmlResponse: string): Category[] {
  try {
    // Clean up the XML response by removing script tags
    const cleanedXml = xmlResponse
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<script[^>]*\/>/g, '')
      .trim();

    const categories: Category[] = [];

    // Use regex to find PGType elements
    const pgTypeRegex = /<PGType[^>]*pg="([^"]*)"[^>]*>(.*?)<\/PGType>/gis;
    let pgTypeMatch;

    while ((pgTypeMatch = pgTypeRegex.exec(cleanedXml)) !== null) {
      const pgValue = pgTypeMatch[1];
      const pgTypeContent = pgTypeMatch[2];

      if (!pgValue) continue;

      // Parse category code and name from format "CODE^Name"
      const categoryParts = pgValue.split('^', 2);
      const categoryCode = categoryParts.length > 0 ? categoryParts[0] : '';
      const categoryName = categoryParts.length > 1 ? categoryParts[1] : categoryCode;

      // Parse subcategories
      const subcategories: Subcategory[] = [];
      const spgRegex = /<spg[^>]*>([^<]*)<\/spg>/gi;
      let spgMatch;

      while ((spgMatch = spgRegex.exec(pgTypeContent)) !== null) {
        const spgValue = spgMatch[1];

        // Parse subcategory code and name from format "CODE^Name"
        const subcategoryParts = spgValue.split('^', 2);
        const subcategoryCode = subcategoryParts.length > 0 ? subcategoryParts[0] : '';
        const subcategoryName = subcategoryParts.length > 1 ? subcategoryParts[1] : subcategoryCode;

        subcategories.push({
          code: subcategoryCode,
          name: subcategoryName,
        });
      }

      categories.push({
        code: categoryCode,
        name: categoryName,
        subcategories,
      });
    }

    console.log(`Successfully parsed ${categories.length} categories`);
    return categories;

  } catch (error) {
    console.error('Failed to parse XML response:', error);
    throw new Error('Failed to parse XML response');
  }
}
