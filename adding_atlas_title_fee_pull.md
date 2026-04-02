Here's the complete one-shot code implementation for pulling Atlas Title Company fees. This replicates exactly what their rate calculator does — a two-step process: (1) GET the page to obtain a fresh WordPress nonce, then (2) POST to their admin-ajax endpoint with the form data.

---

```python
"""
Atlas Title Company - Rate Calculator Fee Scraper
===================================================
Replicates the AJAX call made by https://www.atlastitleco.com/rate-calculator/
 
Method: 
  1. GET the rate-calculator page to extract a fresh WP nonce (changes per session, expires ~24hrs)
  2. POST to /wp-admin/admin-ajax.php with action='submitquotes' and the quote parameters
  3. Parse the HTML response tables for fee line items

Usage:
  fees = get_atlas_title_fees(
      state="TN", county="Maury", loan_amount=500000,
      transaction_type="refinance", service_type="title_and_escrow"
  )
"""

import re
import requests
from bs4 import BeautifulSoup
from dataclasses import dataclass, field
from typing import Optional


# ── Enum Mappings (values used by the Atlas API) ──────────────────────────────

STATE_IDS = {
    "AZ": "4",  "CA": "1",  "CO": "7",  "DC": "37", "DE": "16",
    "FL": "6",  "GA": "24", "ID": "36", "IL": "17", "IN": "12",
    "KS": "29", "KY": "13", "MA": "30", "MD": "18", "ME": "31",
    "MI": "19", "MN": "8",  "MO": "20", "MS": "32", "MT": "21",
    "NC": "22", "NE": "25", "NH": "33", "NJ": "9",  "NV": "5",
    "OH": "23", "OR": "38", "PA": "14", "RI": "34", "SC": "26",
    "TN": "10", "TX": "11", "UT": "39", "VA": "27", "VT": "35",
    "WA": "3",  "WI": "15", "WV": "28",
}

TRANSACTION_TYPES = {
    "refinance": "0",
    "purchase": "1",
    "reverse_mortgage": "2",
    "equity": "3",
}

SERVICE_TYPES = {
    "title_and_escrow": "0",
    "title_only": "1",
}

POLICY_TYPES = {
    "alta_short_form": "0",
    "junior_loan_policy": "1",
}

ESCROW_TYPES = {
    "limited": "0",
    "full": "1",
}

FINANCE_AFFIDAVIT_OPTIONS = {
    "line_b1_initialed": "0",
    "line_b2_initialed": "1",
    "not_submitted": "2",
}

BASE_URL = "https://www.atlastitleco.com"
CALCULATOR_URL = f"{BASE_URL}/rate-calculator/"
AJAX_URL = f"{BASE_URL}/wp-admin/admin-ajax.php"


# ── Data Classes ──────────────────────────────────────────────────────────────

@dataclass
class FeeLineItem:
    category: str       # e.g. "Title Charges", "Settlement/Escrow", "Recording Fees"
    description: str    # e.g. "Lender's Title Insurance*", "CPL"
    amount: str         # e.g. "$565"
    paid_by: str        # e.g. "Borrower", "Seller"

@dataclass
class AtlasTitleQuote:
    state: str
    county: str
    transaction_type: str
    service_type: str
    loan_amount: int
    sales_price: Optional[int]
    total: str
    fees: list = field(default_factory=list)  # list[FeeLineItem]


# ── County ID Extraction ──────────────────────────────────────────────────────

def get_county_ids_for_state(page_html: str, state_id: str) -> dict:
    """
    Parse the rate calculator page HTML to extract county name -> ID mappings.
    Counties are embedded in the <select id="rc-county"> element.
    The options shown depend on which state is selected; however ALL county options
    for ALL states are present in the initial HTML. The JS just shows/hides them.
    For the API call, we only need the county ID (value attribute).
    """
    soup = BeautifulSoup(page_html, "html.parser")
    county_select = soup.find("select", {"id": "rc-county"})
    counties = {}
    if county_select:
        for option in county_select.find_all("option"):
            val = option.get("value", "")
            name = option.get_text(strip=True)
            if val and name and name != "Select a County":
                counties[name] = val
    return counties


# ── Nonce Extraction ──────────────────────────────────────────────────────────

def extract_nonce(page_html: str) -> str:
    """
    Extract the WordPress AJAX nonce from the inline JavaScript on the page.
    The nonce is embedded as: _ajax_nonce: 'XXXXXXXXXX'
    It changes per page load / session and typically expires after ~24 hours.
    """
    match = re.search(r"_ajax_nonce:\s*'([a-f0-9]+)'", page_html)
    if not match:
        raise ValueError("Could not extract _ajax_nonce from the rate calculator page. "
                         "The page structure may have changed.")
    return match.group(1)


# ── Response Parsing ──────────────────────────────────────────────────────────

def parse_fee_response(html: str) -> tuple[list, str]:
    """
    Parse the HTML response from the AJAX endpoint.
    Returns (list of FeeLineItem, total_amount_string).
    
    Response structure:
      - Summary section with input parameters echoed back
      - Multiple <table class="rc-table"> elements:
          Table 0: Title Charges (header row + fee rows)
          Table 1: Settlement/Escrow (header row + fee rows)
          Table 2: Recording Fees (header row + fee rows)
          Table 3: Total row + disclaimers
    """
    soup = BeautifulSoup(html, "html.parser")
    tables = soup.find_all("table", class_="rc-table")

    fees = []
    total = ""

    for table in tables:
        rows = table.find_all("tr")
        if not rows:
            continue

        # First row is the header (category name + "Borrower"/"Seller")
        header_row = rows[0]
        header_cells = header_row.find_all("td")

        # Check if this is the total/footer table
        if header_row.get("class") and "rc-table-footer" in header_row.get("class", []):
            cells = header_row.find_all("td")
            if len(cells) >= 2:
                total = cells[1].get_text(strip=True)
            continue

        # Extract category name and who pays
        category = header_cells[0].get_text(strip=True) if len(header_cells) > 0 else ""
        paid_by = header_cells[1].get_text(strip=True) if len(header_cells) > 1 else ""

        # Skip if this looks like a footer/disclaimer row
        if not category or category.lower().startswith("total"):
            cells = header_cells
            if len(cells) >= 2:
                total = cells[1].get_text(strip=True)
            continue

        # Parse fee rows (skip header row)
        for row in rows[1:]:
            cells = row.find_all("td")
            if len(cells) >= 2:
                desc = cells[0].get_text(strip=True)
                amount = cells[1].get_text(strip=True)
                # Skip disclaimer rows
                if desc and amount and amount.startswith("$"):
                    fees.append(FeeLineItem(
                        category=category,
                        description=desc,
                        amount=amount,
                        paid_by=paid_by,
                    ))

    return fees, total


# ── Main API Function ─────────────────────────────────────────────────────────

def get_atlas_title_fees(
    state: str,
    county: str,
    loan_amount: int,
    transaction_type: str = "refinance",
    service_type: str = "title_and_escrow",
    city: str = "",
    address: str = "",
    sales_price: int = 0,
    policy_type: str = "alta_short_form",
    escrow_type: str = "limited",
    outstanding_principal_balance: str = "",
    original_amount: str = "",
    total_payoff_amount: str = "",
    recording_date: str = "",
    prior_policy_amount: str = "",
    finance_affidavit: str = "line_b1_initialed",
    old_original_loan_amount: str = "",
    fsbo_transaction: str = "",
    primary_residence: str = "",
) -> AtlasTitleQuote:
    """
    Fetch title company fee quotes from Atlas Title's rate calculator.

    Args:
        state: Two-letter state code (e.g., "TN", "CA", "FL")
        county: County name (e.g., "Maury", "Davidson")
        loan_amount: Loan amount in dollars (no commas, e.g., 500000)
        transaction_type: One of "refinance", "purchase", "reverse_mortgage", "equity"
        service_type: One of "title_and_escrow", "title_only"
        city: Optional city name
        address: Optional street address
        sales_price: Required for "purchase" transactions
        policy_type: One of "alta_short_form", "junior_loan_policy"
        escrow_type: One of "limited", "full"
        outstanding_principal_balance: For refinance (optional)
        original_amount: Original amount of 1st prior loan (optional)
        total_payoff_amount: Total payoff of 1st prior loan (optional)
        recording_date: Recording date of 1st prior loan, format YYYY-MM-DD (optional)
        prior_policy_amount: Prior policy amount (optional)
        finance_affidavit: Prince George Finance Affidavit option (optional)
        old_original_loan_amount: Old original loan amount (optional)

    Returns:
        AtlasTitleQuote with itemized fees and total.
    """
    # Validate inputs
    state = state.upper()
    if state not in STATE_IDS:
        raise ValueError(f"Unsupported state: {state}. Supported: {list(STATE_IDS.keys())}")
    if transaction_type not in TRANSACTION_TYPES:
        raise ValueError(f"Invalid transaction_type: {transaction_type}. Use: {list(TRANSACTION_TYPES.keys())}")
    if service_type not in SERVICE_TYPES:
        raise ValueError(f"Invalid service_type: {service_type}. Use: {list(SERVICE_TYPES.keys())}")

    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                       "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    })

    # Step 1: GET the rate calculator page to extract nonce + county IDs
    page_resp = session.get(CALCULATOR_URL, timeout=15)
    page_resp.raise_for_status()
    page_html = page_resp.text

    nonce = extract_nonce(page_html)
    county_map = get_county_ids_for_state(page_html, STATE_IDS[state])

    # Resolve county name to ID
    county_id = county_map.get(county)
    if not county_id:
        # Try case-insensitive match
        for name, cid in county_map.items():
            if name.lower() == county.lower():
                county_id = cid
                break
    if not county_id:
        raise ValueError(
            f"County '{county}' not found for state {state}. "
            f"Available counties: {list(county_map.keys())[:20]}..."
        )

    # Step 2: POST to admin-ajax.php
    payload = {
        "action": "submitquotes",
        "quotes[loan]": str(loan_amount),
        "quotes[transaction]": TRANSACTION_TYPES[transaction_type],
        "quotes[state]": STATE_IDS[state],
        "quotes[county]": county_id,
        "quotes[sales]": str(sales_price) if sales_price else "0",
        "quotes[policyType]": POLICY_TYPES.get(policy_type, "0"),
        "quotes[escrowType]": ESCROW_TYPES.get(escrow_type, "0"),
        "quotes[services]": SERVICE_TYPES[service_type],
        "quotes[city]": city,
        "quotes[address]": address,
        "quotes[outstandingPrincipalBalance]": outstanding_principal_balance,
        "quotes[originalAmount]": original_amount,
        "quotes[totalPayoffAmount]": total_payoff_amount,
        "quotes[recordingDate]": recording_date,
        "quotes[priorPolicyAmount]": prior_policy_amount,
        "quotes[financeAffidavit]": FINANCE_AFFIDAVIT_OPTIONS.get(finance_affidavit, "0"),
        "quotes[oldOriginalLoanAmount]": old_original_loan_amount,
        "_ajax_nonce": nonce,
    }

    # Add optional fields for specific transaction types
    if fsbo_transaction:
        payload["quotes[fsboTransaction]"] = fsbo_transaction
    if primary_residence:
        payload["quotes[primaryResidence]"] = primary_residence

    ajax_resp = session.post(
        AJAX_URL,
        data=payload,
        headers={
            "X-Requested-With": "XMLHttpRequest",
            "Referer": CALCULATOR_URL,
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        timeout=15,
    )
    ajax_resp.raise_for_status()

    if not ajax_resp.text.strip():
        raise RuntimeError("Empty response from Atlas Title API. The nonce may have expired.")

    # Step 3: Parse the HTML response
    fees, total = parse_fee_response(ajax_resp.text)

    return AtlasTitleQuote(
        state=state,
        county=county,
        transaction_type=transaction_type,
        service_type=service_type,
        loan_amount=loan_amount,
        sales_price=sales_price if sales_price else None,
        total=total,
        fees=fees,
    )


# ── Example Usage ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Example: Refinance in Tennessee, Maury County
    quote = get_atlas_title_fees(
        state="TN",
        county="Maury",
        loan_amount=500000,
        transaction_type="refinance",
        service_type="title_and_escrow",
        city="Spring Hill",
        address="127 Locke Ave",
    )

    print(f"\n{'='*60}")
    print(f"Atlas Title Fee Quote")
    print(f"{'='*60}")
    print(f"State: {quote.state} | County: {quote.county}")
    print(f"Transaction: {quote.transaction_type} | Service: {quote.service_type}")
    print(f"Loan Amount: ${quote.loan_amount:,}")
    print(f"{'─'*60}")

    current_category = ""
    for fee in quote.fees:
        if fee.category != current_category:
            current_category = fee.category
            print(f"\n  {fee.category} ({fee.paid_by})")
            print(f"  {'─'*50}")
        print(f"    {fee.description:<45} {fee.amount:>8}")

    print(f"\n{'═'*60}")
    print(f"  TOTAL{' '*44}{quote.total:>8}")
    print(f"{'═'*60}")


    # Example: Purchase in California
    # quote2 = get_atlas_title_fees(
    #     state="CA",
    #     county="Los Angeles",
    #     loan_amount=800000,
    #     sales_price=1000000,
    #     transaction_type="purchase",
    #     service_type="title_and_escrow",
    # )
```

---

**How it works — matching the site's exact method:**

The Atlas Title calculator is a WordPress site using jQuery AJAX. When you click "Calculate," it sends a `POST` to `/wp-admin/admin-ajax.php` with `action=submitquotes` and all the form fields serialized as `quotes[fieldname]`. The response comes back as **raw HTML** (not JSON), containing `<table class="rc-table">` elements with the fee breakdown. A WordPress nonce (`_ajax_nonce`) is required and is embedded in the page's inline JavaScript — it changes per page load and expires after ~24 hours, so the code fetches a fresh one each time.

**Key details for integration:**

- **State/County IDs** are numeric (not the names) — the code includes the full state mapping and dynamically parses county IDs from the page HTML
- **Transaction types**: refinance (0), purchase (1), reverse mortgage (2), equity (3)
- **Service types**: title & escrow (0), title only (1)
- Purchase transactions require `sales_price` and additional fields like `fsbo_transaction` and `primary_residence`
- The nonce must be fresh — the code handles this automatically via the session-based two-step approach
- Install dependencies: `pip install requests beautifulsoup4`