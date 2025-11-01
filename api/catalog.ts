export const config = {
  runtime: 'edge',
};

const CATALOG_API_URL = 'https://www.autocatplus.co.uk/mamcat/mamcat.asmx/GetPartsDataFTIPv7';
const USERNAME = 'ASPGWS';
const PASSWORD = 'FH6NGU54';

// Supplier Name to Prefix mapping
const SUPPLIER_PREFIX_MAP: Record<string, string> = {
  'Apec': 'APE',
  'Autocharge': 'ATU',
  'Autoelectro': 'AUT',
  'Banner': 'BAN',
  'Bettaparts (LPR)': 'BET',
  'BGA Group': 'BGA',
  'Blue Print': 'ADL',
  'BM Catalysts': 'BMC',
  'Borg & Beck': 'BOR',
  'Bosch': 'BCS',
  'Brake Engineering': 'BRA',
  'Braymann': 'BRA',
  'BTN': 'BTN',
  'Cambiare': 'CAM',
  'Comline': 'COM',
  'Comma': 'COM',
  'Corteco': 'COR',
  'Delphi': 'DLA',
  'Denso': 'DEN',
  'Electric-Life': 'ALG',
  'ElectroSpark': 'CDC',
  'EuroFlo (Marathon)': 'EUR',
  'Fahren': 'FAH',
  'FAI': 'FAI',
  'Febi': 'FEB',
  'First Line': 'FIR',
  'FPS': 'FER',
  'Fuel Parts (UK)': 'FPT',
  'Gates': 'GAT',
  'GS': 'GS',
  'Hella': 'HGT',
  'INA': 'INA',
  'Intermotor': 'INT',
  'Juratek': 'JUR',
  'Kilen': 'KIL',
  'Klarius': 'KLA',
  'KYB': 'KYB',
  'Laser Tools': 'LAS',
  'Lemark': 'FPT',
  'LUK': 'LUK',
  'Mahle': 'MAH',
  'Mintex': 'MIN',
  'National': 'NAT',
  'NGK': 'NGK',
  'Nissens': 'NIS',
  'NRF': 'NRF',
  'Numax': 'NUM',
  'Pearl': 'PEA',
  'Powertrain': 'POW',
  'QH': 'QHA',
  'Red Power': 'BAN',
  'Ring': 'RIN',
  'Rollco': 'ROL',
  'Rolman World': 'RLM',
  'Sachs (ZF)': 'SAC',
  'SCM Turbo': 'SCM',
  'Shaftec': 'SHA',
  'Somora': 'SOM',
  'Summit': 'SUM',
  'Trupart': 'TRU',
  'Ultraparts': 'ULT',
  'Valeo': 'VAL',
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

interface CatalogPartInfo {
  modelDetails: string;
  yearRange: string;
  partNumber: string;
  position: string;
  imageInfo: string;
  section: string;
  supplier: string;
  description: string;
  exactcc: string;
  cylinders: string;
  cam: string;
  valve: string;
  transdrive: string;
  supplierInfo: string;
  mappedSupplierFields: Record<string, string>;
  userCatalogueNoteFlag: string;
  fuelType: string;
  bodyStyleKey: string;
  mmiKey: string;
  productCode: string;
  v8Key: string;
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

  const url = new URL(req.url);
  const subPg = url.searchParams.get('subPg');
  const stYr = url.searchParams.get('stYr');
  const mmiKey = url.searchParams.get('mmiKey');

  if (!subPg || !stYr || !mmiKey) {
    return new Response(
      JSON.stringify({
        error: 'Missing required parameters: subPg, stYr, and mmiKey are required'
      }),
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
    formData.append('UserName', USERNAME);
    formData.append('PassWord', PASSWORD);
    formData.append('SubPg', subPg);
    formData.append('StYr', stYr);
    formData.append('MMIKey', mmiKey);
    formData.append('IP', '88.208.224.141'); // Default IP from Java code

    // Optional parameters (empty as per Java code defaults)
    formData.append('Manuf', '');
    formData.append('Model', '');
    formData.append('SModel', '');
    formData.append('EngS', '');
    formData.append('FT', '');

    // Make the request to the catalog API
    const response = await fetch(CATALOG_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8,ru-RU;q=0.7',
        'Cache-Control': 'max-age=0',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.autocatplus.co.uk',
        'Priority': 'u=0, i',
        'Referer': 'https://www.autocatplus.co.uk/mamcat/mamcat.asmx?op=GetPartsDataFTIPv7',
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
    });

    if (!response.ok) {
      throw new Error(`Catalog API returned status: ${response.status}`);
    }

    const xmlResponse = await response.text();

    // Parse the XML response
    const catalogParts = parseXmlResponse(xmlResponse);

    // Return the catalog parts as JSON
    return new Response(JSON.stringify(catalogParts), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Catalog lookup error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch catalog parts',
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

function parseXmlResponse(xmlResponse: string): CatalogPartInfo[] {
  try {
    // Clean up the XML response by removing script tags
    const cleanedXml = xmlResponse
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<script[^>]*\/>/g, '')
      .trim();

    const catalogParts: CatalogPartInfo[] = [];
    const seenParts = new Set<string>();

    // Use regex to find AC elements containing part data
    const acRegex = /<AC[^>]*>(.*?)<\/AC>/gis;
    let acMatch;

    while ((acMatch = acRegex.exec(cleanedXml)) !== null) {
      const acContent = acMatch[1];

      // Find Dt1 elements within AC elements
      const dt1Regex = /<Dt1[^>]*>(.*?)<\/Dt1>/is;
      const dt1Match = dt1Regex.exec(acContent);

      if (dt1Match) {
        const dt1Content = dt1Match[1].trim();
        if (dt1Content) {
          const partInfo = parseDelimitedData(dt1Content);
          if (partInfo) {
            // Create a unique key for this part based on partNumber and position
            const partKey = `${partInfo.partNumber}|${partInfo.position}`;
            
            // Only add if we haven't seen this part combination before
            if (!seenParts.has(partKey)) {
              seenParts.add(partKey);
              catalogParts.push(partInfo);
            }
          }
        }
      }
    }

    console.log(`Successfully parsed ${catalogParts.length} catalog parts (deduplicated)`);
    return catalogParts;

  } catch (error) {
    console.error('Failed to parse XML response:', error);
    throw new Error('Failed to parse XML response');
  }
}

function parseDelimitedData(delimitedData: string): CatalogPartInfo | null {
  try {
    console.log('Parsing delimited data:', delimitedData);

    // Split the data by ^ delimiter
    const fields = delimitedData.split('^');

    // Ensure we have at least 41 fields (extend if necessary)
    const extendedFields = new Array(41).fill('');
    fields.forEach((field, index) => {
      if (index < 41) {
        extendedFields[index] = field || '';
      }
    });

    // Extract supplier code (first 3 characters) and get prefix
    const supplierField = extendedFields[7] || '';
    const prefix = SUPPLIER_PREFIX_MAP[supplierField] || '';


    const partInfo: CatalogPartInfo = {
      modelDetails: extendedFields[0] || '',
      yearRange: extendedFields[1] || '',
      partNumber: prefix + extendedFields[2] || '',
      position: extendedFields[3] || '',
      imageInfo: extendedFields[4] || '',
      section: extendedFields[5] || '',
      supplier: extendedFields[7] || '',
      description: extendedFields[8] || '',
      exactcc: extendedFields[9] || '',
      cylinders: extendedFields[10] || '',
      cam: extendedFields[11] || '',
      valve: extendedFields[12] || '',
      transdrive: extendedFields[13] || '',
      supplierInfo: '',
      mappedSupplierFields: {},
      userCatalogueNoteFlag: extendedFields[34] || '',
      fuelType: extendedFields[35] || '',
      bodyStyleKey: extendedFields[36] || '',
      mmiKey: extendedFields[37] || '',
      productCode: extendedFields[38] || '',
      v8Key: extendedFields[40] || '',
    };

    // Build supplier info from fields 14-33
    const supplierInfoParts: string[] = [];
    const mappedFields: Record<string, string> = {};

    for (let i = 14; i <= 33; i++) {
      const fieldValue = extendedFields[i];
      if (fieldValue && fieldValue.trim()) {
        supplierInfoParts.push(fieldValue);
        // Map field using basic field names (simplified version)
        const fieldName = `Field${i - 13}`; // Field1, Field2, etc.
        mappedFields[fieldName] = fieldValue;
      }
    }

    partInfo.supplierInfo = supplierInfoParts.join('; ');
    partInfo.mappedSupplierFields = mappedFields;

    console.log('Successfully parsed part:', partInfo.partNumber);
    return partInfo;

  } catch (error) {
    console.error('Failed to parse delimited data:', delimitedData, error);
    return null;
  }
}
