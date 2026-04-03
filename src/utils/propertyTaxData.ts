interface CountyData {
  name: string;
  rate: number;
}

interface StateData {
  name: string;
  rate: number;
  counties: CountyData[];
}

interface TaxDatabase {
  nationalRate: number;
  states: Record<string, StateData>;
}

export const TAX_DATA: TaxDatabase = {
  nationalRate: 0.890,
  states: {
    "AL": { name: "Alabama", rate: 0.38, counties: [
      { name: "Jefferson", rate: 0.47 }, { name: "Madison", rate: 0.42 },
      { name: "Mobile", rate: 0.40 }, { name: "Montgomery", rate: 0.44 },
      { name: "Shelby", rate: 0.35 }, { name: "Tuscaloosa", rate: 0.36 },
      { name: "Baldwin", rate: 0.30 }, { name: "Lee", rate: 0.39 },
      { name: "Morgan", rate: 0.41 }
    ]},
    "AZ": { name: "Arizona", rate: 0.43, counties: [
      { name: "Maricopa", rate: 0.42 }, { name: "Pima", rate: 0.59 },
      { name: "Pinal", rate: 0.56 }, { name: "Yavapai", rate: 0.34 },
      { name: "Coconino", rate: 0.44 }, { name: "Mohave", rate: 0.38 }
    ]},
    "AR": { name: "Arkansas", rate: 0.57, counties: [] },
    "CA": { name: "California", rate: 0.71, counties: [
      { name: "Los Angeles", rate: 0.70 }, { name: "San Diego", rate: 0.67 },
      { name: "Orange", rate: 0.57 }, { name: "Riverside", rate: 0.82 },
      { name: "San Bernardino", rate: 0.78 }, { name: "Santa Clara", rate: 0.55 },
      { name: "Alameda", rate: 0.65 }, { name: "Sacramento", rate: 0.74 },
      { name: "San Francisco", rate: 0.56 }, { name: "Contra Costa", rate: 0.70 },
      { name: "Fresno", rate: 0.80 }, { name: "Ventura", rate: 0.63 },
      { name: "San Mateo", rate: 0.48 }, { name: "Kern", rate: 0.88 },
      { name: "San Joaquin", rate: 0.85 }
    ]},
    "CO": { name: "Colorado", rate: 0.49, counties: [
      { name: "Denver", rate: 0.51 }, { name: "El Paso", rate: 0.44 },
      { name: "Arapahoe", rate: 0.43 }, { name: "Jefferson", rate: 0.48 },
      { name: "Adams", rate: 0.53 }, { name: "Douglas", rate: 0.45 },
      { name: "Boulder", rate: 0.50 }, { name: "Larimer", rate: 0.47 }
    ]},
    "CT": { name: "Connecticut", rate: 1.66, counties: [
      { name: "Fairfield", rate: 1.41 }, { name: "Hartford", rate: 1.82 },
      { name: "New Haven", rate: 1.98 }, { name: "Litchfield", rate: 1.32 },
      { name: "New London", rate: 1.59 }, { name: "Middlesex", rate: 1.54 }
    ]},
    "DE": { name: "Delaware", rate: 0.53, counties: [] },
    "FL": { name: "Florida", rate: 0.75, counties: [
      { name: "Miami-Dade", rate: 0.86 }, { name: "Broward", rate: 0.87 },
      { name: "Palm Beach", rate: 0.85 }, { name: "Hillsborough", rate: 0.83 },
      { name: "Orange", rate: 0.79 }, { name: "Pinellas", rate: 0.73 },
      { name: "Duval", rate: 0.77 }, { name: "Lee", rate: 0.68 },
      { name: "Polk", rate: 0.76 }, { name: "Brevard", rate: 0.72 },
      { name: "Volusia", rate: 0.70 }, { name: "Seminole", rate: 0.71 },
      { name: "Bay", rate: 0.60 }, { name: "Collier", rate: 0.54 },
      { name: "Osceola", rate: 0.82 }, { name: "Pasco", rate: 0.74 },
      { name: "Sarasota", rate: 0.65 }, { name: "Manatee", rate: 0.72 }
    ]},
    "GA": { name: "Georgia", rate: 0.74, counties: [
      { name: "Fulton", rate: 0.88 }, { name: "Gwinnett", rate: 0.90 },
      { name: "DeKalb", rate: 0.99 }, { name: "Cobb", rate: 0.84 },
      { name: "Chatham", rate: 0.82 }, { name: "Cherokee", rate: 0.75 },
      { name: "Clayton", rate: 0.98 }, { name: "Henry", rate: 0.81 },
      { name: "Forsyth", rate: 0.66 }
    ]},
    "HI": { name: "Hawaii", rate: 0.27, counties: [] },
    "ID": { name: "Idaho", rate: 0.53, counties: [] },
    "IL": { name: "Illinois", rate: 1.92, counties: [
      { name: "Cook", rate: 1.83 }, { name: "DuPage", rate: 1.98 },
      { name: "Lake", rate: 2.21 }, { name: "Will", rate: 2.30 },
      { name: "Kane", rate: 2.35 }, { name: "McHenry", rate: 2.28 },
      { name: "Winnebago", rate: 2.44 }, { name: "Madison", rate: 1.92 },
      { name: "St. Clair", rate: 2.03 }, { name: "Champaign", rate: 1.86 },
      { name: "Sangamon", rate: 1.80 }, { name: "Peoria", rate: 2.05 }
    ]},
    "IN": { name: "Indiana", rate: 0.74, counties: [
      { name: "Marion", rate: 0.96 }, { name: "Lake", rate: 0.86 },
      { name: "Allen", rate: 0.78 }, { name: "Hamilton", rate: 0.70 },
      { name: "St. Joseph", rate: 0.82 }, { name: "Elkhart", rate: 0.62 }
    ]},
    "IA": { name: "Iowa", rate: 1.28, counties: [] },
    "KS": { name: "Kansas", rate: 1.22, counties: [] },
    "KY": { name: "Kentucky", rate: 0.72, counties: [] },
    "LA": { name: "Louisiana", rate: 0.49, counties: [] },
    "ME": { name: "Maine", rate: 1.09, counties: [] },
    "MD": { name: "Maryland", rate: 0.95, counties: [
      { name: "Montgomery", rate: 0.80 }, { name: "Prince George's", rate: 0.92 },
      { name: "Baltimore County", rate: 1.01 }, { name: "Anne Arundel", rate: 0.80 },
      { name: "Howard", rate: 0.87 }, { name: "Frederick", rate: 0.87 },
      { name: "Baltimore City", rate: 1.69 }, { name: "Harford", rate: 0.95 }
    ]},
    "MA": { name: "Massachusetts", rate: 1.00, counties: [
      { name: "Middlesex", rate: 1.04 }, { name: "Suffolk", rate: 0.58 },
      { name: "Worcester", rate: 1.15 }, { name: "Essex", rate: 1.07 },
      { name: "Norfolk", rate: 1.02 }, { name: "Bristol", rate: 1.09 },
      { name: "Plymouth", rate: 1.03 }, { name: "Hampden", rate: 1.32 }
    ]},
    "MI": { name: "Michigan", rate: 1.18, counties: [
      { name: "Wayne", rate: 1.59 }, { name: "Oakland", rate: 1.24 },
      { name: "Macomb", rate: 1.36 }, { name: "Kent", rate: 1.08 },
      { name: "Genesee", rate: 1.51 }, { name: "Washtenaw", rate: 1.47 },
      { name: "Ingham", rate: 1.72 }, { name: "Ottawa", rate: 0.96 }
    ]},
    "MN": { name: "Minnesota", rate: 1.02, counties: [
      { name: "Hennepin", rate: 1.05 }, { name: "Ramsey", rate: 1.15 },
      { name: "Dakota", rate: 0.94 }, { name: "Anoka", rate: 1.00 },
      { name: "Washington", rate: 0.92 }, { name: "Scott", rate: 0.91 }
    ]},
    "MS": { name: "Mississippi", rate: 0.65, counties: [] },
    "MO": { name: "Missouri", rate: 0.82, counties: [] },
    "MT": { name: "Montana", rate: 0.73, counties: [] },
    "NE": { name: "Nebraska", rate: 1.36, counties: [] },
    "NV": { name: "Nevada", rate: 0.48, counties: [] },
    "NH": { name: "New Hampshire", rate: 1.57, counties: [] },
    "NJ": { name: "New Jersey", rate: 1.89, counties: [
      { name: "Bergen", rate: 1.82 }, { name: "Middlesex", rate: 1.96 },
      { name: "Essex", rate: 2.18 }, { name: "Hudson", rate: 1.32 },
      { name: "Monmouth", rate: 1.60 }, { name: "Ocean", rate: 1.58 },
      { name: "Union", rate: 1.94 }, { name: "Passaic", rate: 2.25 },
      { name: "Morris", rate: 1.72 }, { name: "Camden", rate: 2.47 },
      { name: "Burlington", rate: 1.79 }, { name: "Somerset", rate: 1.63 }
    ]},
    "NM": { name: "New Mexico", rate: 0.55, counties: [] },
    "NY": { name: "New York", rate: 1.45, counties: [
      { name: "New York (Manhattan)", rate: 0.92 }, { name: "Kings (Brooklyn)", rate: 0.63 },
      { name: "Queens", rate: 0.73 }, { name: "Bronx", rate: 0.79 },
      { name: "Richmond (Staten Is.)", rate: 0.88 }, { name: "Suffolk", rate: 1.78 },
      { name: "Nassau", rate: 1.82 }, { name: "Westchester", rate: 1.62 },
      { name: "Erie", rate: 2.04 }, { name: "Monroe", rate: 2.08 },
      { name: "Onondaga", rate: 2.12 }, { name: "Albany", rate: 1.68 },
      { name: "Orange", rate: 1.88 }, { name: "Rockland", rate: 1.54 }
    ]},
    "NC": { name: "North Carolina", rate: 0.61, counties: [
      { name: "Mecklenburg", rate: 0.71 }, { name: "Wake", rate: 0.65 },
      { name: "Guilford", rate: 0.82 }, { name: "Forsyth", rate: 0.74 },
      { name: "Durham", rate: 0.81 }, { name: "Cumberland", rate: 0.69 },
      { name: "Buncombe", rate: 0.47 }, { name: "New Hanover", rate: 0.55 }
    ]},
    "ND": { name: "North Dakota", rate: 0.94, counties: [] },
    "OH": { name: "Ohio", rate: 1.22, counties: [
      { name: "Cuyahoga", rate: 1.83 }, { name: "Franklin", rate: 1.42 },
      { name: "Hamilton", rate: 1.55 }, { name: "Summit", rate: 1.60 },
      { name: "Montgomery", rate: 1.63 }, { name: "Lucas", rate: 1.62 },
      { name: "Stark", rate: 1.31 }, { name: "Butler", rate: 1.29 },
      { name: "Delaware", rate: 1.08 }
    ]},
    "OK": { name: "Oklahoma", rate: 0.76, counties: [] },
    "OR": { name: "Oregon", rate: 0.77, counties: [] },
    "PA": { name: "Pennsylvania", rate: 1.16, counties: [
      { name: "Philadelphia", rate: 0.95 }, { name: "Allegheny", rate: 1.47 },
      { name: "Montgomery", rate: 1.24 }, { name: "Bucks", rate: 1.15 },
      { name: "Delaware", rate: 1.39 }, { name: "Chester", rate: 1.11 },
      { name: "Lancaster", rate: 1.16 }, { name: "York", rate: 1.33 },
      { name: "Berks", rate: 1.37 }
    ]},
    "RI": { name: "Rhode Island", rate: 1.18, counties: [] },
    "SC": { name: "South Carolina", rate: 0.50, counties: [] },
    "SD": { name: "South Dakota", rate: 1.01, counties: [] },
    "TN": { name: "Tennessee", rate: 0.45, counties: [
      { name: "Shelby", rate: 1.03 }, { name: "Davidson", rate: 0.56 },
      { name: "Knox", rate: 0.63 }, { name: "Hamilton", rate: 0.55 },
      { name: "Rutherford", rate: 0.54 }, { name: "Williamson", rate: 0.41 },
      { name: "Montgomery", rate: 0.67 }, { name: "Maury", rate: 0.48 },
      { name: "Sumner", rate: 0.52 }
    ]},
    "TX": { name: "Texas", rate: 1.31, counties: [
      { name: "Harris", rate: 1.63 }, { name: "Dallas", rate: 1.48 },
      { name: "Tarrant", rate: 1.73 }, { name: "Bexar", rate: 1.52 },
      { name: "Travis", rate: 1.22 }, { name: "Collin", rate: 1.42 },
      { name: "Denton", rate: 1.33 }, { name: "Fort Bend", rate: 1.59 },
      { name: "Williamson", rate: 1.38 }, { name: "El Paso", rate: 1.71 },
      { name: "Montgomery", rate: 1.33 }, { name: "Hidalgo", rate: 1.28 }
    ]},
    "UT": { name: "Utah", rate: 0.48, counties: [] },
    "VT": { name: "Vermont", rate: 1.56, counties: [] },
    "VA": { name: "Virginia", rate: 0.71, counties: [
      { name: "Fairfax", rate: 0.93 }, { name: "Prince William", rate: 0.83 },
      { name: "Loudoun", rate: 0.83 }, { name: "Chesterfield", rate: 0.72 },
      { name: "Henrico", rate: 0.73 }, { name: "Virginia Beach (City)", rate: 0.71 },
      { name: "Arlington", rate: 0.87 }, { name: "Stafford", rate: 0.79 }
    ]},
    "WA": { name: "Washington", rate: 0.79, counties: [
      { name: "King", rate: 0.83 }, { name: "Pierce", rate: 0.94 },
      { name: "Snohomish", rate: 0.76 }, { name: "Spokane", rate: 0.84 },
      { name: "Clark", rate: 0.78 }, { name: "Thurston", rate: 0.93 }
    ]},
    "WV": { name: "West Virginia", rate: 0.49, counties: [] },
    "WI": { name: "Wisconsin", rate: 1.25, counties: [
      { name: "Milwaukee", rate: 1.83 }, { name: "Dane", rate: 1.50 },
      { name: "Waukesha", rate: 1.42 }, { name: "Brown", rate: 1.55 },
      { name: "Racine", rate: 1.63 }, { name: "Outagamie", rate: 1.39 }
    ]},
    "WY": { name: "Wyoming", rate: 0.51, counties: [] },
    "AK": { name: "Alaska", rate: 0.93, counties: [] },
  }
};

/**
 * Look up the property tax rate for a given state (2-letter code).
 * Returns the rate as a human-readable percentage (e.g., 0.75 for 0.75%).
 * The form stores percentages in human format, calculations divide by 100.
 */
export function getStatesWithNames(): { code: string; name: string }[] {
  return Object.entries(TAX_DATA.states)
    .map(([code, data]) => ({ code, name: data.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function lookupTaxRate(stateCode: string): { rate: number; stateName: string } | null {
  const code = stateCode.toUpperCase().trim();
  const stateData = TAX_DATA.states[code];
  if (!stateData) return null;
  return { rate: stateData.rate, stateName: stateData.name };
}

/**
 * Get counties for a state.
 */
export function getCountiesForState(stateCode: string): { name: string; rate: number }[] {
  const code = stateCode.toUpperCase().trim();
  const stateData = TAX_DATA.states[code];
  if (!stateData) return [];
  return stateData.counties.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Look up tax rate by state + county. Falls back to state rate if county not found.
 */
export function lookupTaxRateByCounty(stateCode: string, countyName: string): number | null {
  const code = stateCode.toUpperCase().trim();
  const stateData = TAX_DATA.states[code];
  if (!stateData) return null;

  const county = stateData.counties.find(
    c => c.name.toLowerCase() === countyName.toLowerCase()
  );
  // Return county rate if found, else state average — as human-readable %
  return county ? county.rate : stateData.rate;
}
