import type { VercelRequest, VercelResponse } from '@vercel/node';

/* ── State → Atlas internal ID ────────────────────────────────────── */
const STATE_IDS: Record<string, string> = {
  AZ: '4', CA: '1', CO: '7', DC: '37', DE: '16', FL: '6', GA: '24',
  ID: '36', IL: '17', IN: '12', KS: '29', KY: '13', MA: '30', MD: '18',
  ME: '31', MI: '19', MN: '8', MO: '20', MS: '32', MT: '21', NC: '22',
  NE: '25', NH: '33', NJ: '9', NV: '5', OH: '23', OR: '38', PA: '14',
  RI: '34', SC: '26', TN: '10', TX: '11', UT: '39', VA: '27', VT: '35',
  WA: '3', WI: '15', WV: '28',
};

/* ── Types ────────────────────────────────────────────────────────── */
interface FeeItem {
  category: string;
  description: string;
  amount: number;
}

interface AtlasResponse {
  total: number;
  lendersTitlePolicy: number;
  closingEscrowFee: number;
  cplFee: number;
  searchExamFee: number;
  recordingFee: number;
  mortgageTax: number;
  closingEscrowFeeWithCplSearch: number;
  stateLocalRecording: number;
  allFees: FeeItem[];
}

/* ── Helpers ──────────────────────────────────────────────────────── */

function extractNonce(html: string): string | null {
  const m = html.match(/_ajax_nonce:\s*'([a-f0-9]+)'/);
  return m ? m[1] : null;
}

/** Parse the <select id="rc-county"> to build a state→county map */
function parseCountyOptions(html: string, targetCounty: string): string | null {
  const selectMatch = html.match(/<select[^>]*id=["']rc-county["'][^>]*>([\s\S]*?)<\/select>/i);
  if (!selectMatch) return null;

  const optionRegex = /<option[^>]*value=["'](\d+)["'][^>]*>(.*?)<\/option>/gi;
  let match: RegExpExecArray | null;
  const normalTarget = targetCounty.trim().toLowerCase();

  while ((match = optionRegex.exec(selectMatch[1])) !== null) {
    const value = match[1];
    const label = match[2].trim().toLowerCase();
    if (label === normalTarget || label.replace(/ county$/i, '') === normalTarget) {
      return value;
    }
  }
  return null;
}

function parseCurrency(text: string): number {
  const cleaned = text.replace(/[$,\s]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseFeeTablesFromHtml(html: string): FeeItem[] {
  const fees: FeeItem[] = [];
  const tableRegex = /<table[^>]*class=["'][^"']*rc-table[^"']*["'][^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch: RegExpExecArray | null;

  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const tableHtml = tableMatch[1];

    // Try to extract a category from a preceding heading or caption
    const captionMatch = tableHtml.match(/<caption[^>]*>(.*?)<\/caption>/i);
    const category = captionMatch ? captionMatch[1].replace(/<[^>]+>/g, '').trim() : 'General';

    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch: RegExpExecArray | null;

    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      const cells: string[] = [];
      let cellMatch: RegExpExecArray | null;

      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
      }

      if (cells.length >= 2) {
        const description = cells[0];
        const amount = parseCurrency(cells[cells.length - 1]);
        if (description && amount > 0) {
          fees.push({ category, description, amount });
        }
      }
    }
  }

  return fees;
}

function buildResponse(fees: FeeItem[]): AtlasResponse {
  let lendersTitlePolicy = 0;
  let closingEscrowFee = 0;
  let cplFee = 0;
  let searchExamFee = 0;
  let recordingFee = 0;
  let mortgageTax = 0;

  for (const fee of fees) {
    const desc = fee.description.toLowerCase();
    if (desc.includes('lender') && desc.includes('title') && desc.includes('polic')) {
      lendersTitlePolicy += fee.amount;
    } else if (desc.includes('closing') || desc.includes('escrow') || desc.includes('settlement')) {
      closingEscrowFee += fee.amount;
    } else if (desc.includes('cpl')) {
      cplFee += fee.amount;
    } else if (desc.includes('search') || desc.includes('exam')) {
      searchExamFee += fee.amount;
    } else if (desc.includes('recording')) {
      recordingFee += fee.amount;
    } else if (desc.includes('mortgage tax') || desc.includes('transfer tax')) {
      mortgageTax += fee.amount;
    }
  }

  // Apply defaults if not found
  if (cplFee === 0) cplFee = 50;
  if (searchExamFee === 0) searchExamFee = 150;

  const total = fees.reduce((sum, f) => sum + f.amount, 0);

  return {
    total,
    lendersTitlePolicy,
    closingEscrowFee,
    cplFee,
    searchExamFee,
    recordingFee,
    mortgageTax,
    closingEscrowFeeWithCplSearch: closingEscrowFee + cplFee + searchExamFee,
    stateLocalRecording: recordingFee + mortgageTax,
    allFees: fees,
  };
}

/* ── Main handler ─────────────────────────────────────────────────── */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const {
    state,
    county,
    loanAmount,
    transactionType,
    salesPrice,
    city,
    address,
  } = req.query as Record<string, string | undefined>;

  if (!state || !county || !loanAmount) {
    return res.status(400).json({ error: 'Required: state, county, loanAmount' });
  }

  const stateUpper = state.toUpperCase();
  const stateId = STATE_IDS[stateUpper];
  if (!stateId) {
    return res.status(400).json({ error: `Unsupported state: ${state}`, supportedStates: Object.keys(STATE_IDS) });
  }

  const txType = transactionType === 'purchase' ? '1' : '0';

  try {
    /* ── Step 1 & 2: Fetch the calculator page for nonce + county IDs ── */
    const pageResp = await fetch('https://www.atlastitleco.com/rate-calculator/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!pageResp.ok) {
      return res.status(502).json({ error: `Failed to load Atlas calculator page: ${pageResp.status}` });
    }

    const pageHtml = await pageResp.text();
    const nonce = extractNonce(pageHtml);
    if (!nonce) {
      return res.status(502).json({ error: 'Could not extract nonce from Atlas calculator' });
    }

    /* ── Step 2b: Resolve county name → county ID ────────────────────── */
    const countyId = parseCountyOptions(pageHtml, county);
    if (!countyId) {
      return res.status(400).json({
        error: `County "${county}" not found for state ${stateUpper}. Check spelling or try a different county.`,
      });
    }

    /* ── Step 3: POST the quote request ──────────────────────────────── */
    const formData = new URLSearchParams({
      action: 'submitquotes',
      'quotes[loan]': loanAmount,
      'quotes[transaction]': txType,
      'quotes[state]': stateId,
      'quotes[county]': countyId,
      'quotes[sales]': salesPrice || '0',
      'quotes[policyType]': '0',
      'quotes[escrowType]': '0',
      'quotes[services]': '0',
      'quotes[city]': city || '',
      'quotes[address]': address || '',
      _ajax_nonce: nonce,
    });

    const quoteResp = await fetch('https://www.atlastitleco.com/wp-admin/admin-ajax.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: 'https://www.atlastitleco.com/rate-calculator/',
        Origin: 'https://www.atlastitleco.com',
      },
      body: formData.toString(),
    });

    if (!quoteResp.ok) {
      return res.status(502).json({ error: `Atlas quote request failed: ${quoteResp.status}` });
    }

    const quoteHtml = await quoteResp.text();

    /* ── Step 4 & 5: Parse the response HTML ─────────────────────────── */
    const fees = parseFeeTablesFromHtml(quoteHtml);

    if (fees.length === 0) {
      // The response might be JSON with HTML embedded
      try {
        const jsonResp = JSON.parse(quoteHtml);
        if (jsonResp.data) {
          const innerFees = parseFeeTablesFromHtml(jsonResp.data);
          if (innerFees.length > 0) {
            return res.status(200).json(buildResponse(innerFees));
          }
        }
        // Return raw response for debugging if no fees found
        return res.status(200).json({
          ...buildResponse([]),
          _raw: typeof jsonResp.data === 'string' ? jsonResp.data.substring(0, 2000) : quoteHtml.substring(0, 2000),
          _note: 'No fee tables found in response. Raw excerpt included for debugging.',
        });
      } catch {
        return res.status(200).json({
          ...buildResponse([]),
          _raw: quoteHtml.substring(0, 2000),
          _note: 'No fee tables found in response. Raw excerpt included for debugging.',
        });
      }
    }

    return res.status(200).json(buildResponse(fees));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: `Atlas title proxy error: ${message}` });
  }
}
