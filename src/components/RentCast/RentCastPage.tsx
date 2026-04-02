import { useState } from 'react';
import type { ScenarioInput } from '../../types';
import { formatAddress } from '../../types';

interface Props {
  scenarios: ScenarioInput[];
}

interface ValueEstimate {
  price: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  comparables?: Array<{
    formattedAddress: string;
    price: number;
    squareFootage: number;
    bedrooms: number;
    bathrooms: number;
    distance: number;
  }>;
}

interface RentEstimate {
  rent: number;
  rentRangeLow: number;
  rentRangeHigh: number;
  comparables?: Array<{
    formattedAddress: string;
    price: number;
    squareFootage: number;
    bedrooms: number;
    bathrooms: number;
    distance: number;
  }>;
}

interface PropertyRecord {
  formattedAddress: string;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  lotSize: number;
  propertyType: string;
  lastSaleDate: string;
  lastSalePrice: number;
  taxAssessment: number;
}

export default function RentCastPage({ scenarios }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [valueData, setValueData] = useState<ValueEstimate | null>(null);
  const [rentData, setRentData] = useState<RentEstimate | null>(null);
  const [propertyData, setPropertyData] = useState<PropertyRecord | null>(null);

  const address = formatAddress(scenarios[selectedScenario]?.propertyAddress);

  const runSearch = async () => {
    if (!address) {
      setError('Enter a property address on the Scenario Inputs page first.');
      return;
    }
    setLoading(true);
    setError('');
    setValueData(null);
    setRentData(null);
    setPropertyData(null);

    try {
      const [valRes, rentRes, propRes] = await Promise.allSettled([
        fetch(`/api/rentcast?type=value&address=${encodeURIComponent(address)}`).then(r => r.json()),
        fetch(`/api/rentcast?type=rent&address=${encodeURIComponent(address)}`).then(r => r.json()),
        fetch(`/api/rentcast?type=property&address=${encodeURIComponent(address)}`).then(r => r.json()),
      ]);

      if (valRes.status === 'fulfilled' && valRes.value.price) setValueData(valRes.value);
      if (rentRes.status === 'fulfilled' && rentRes.value.rent) setRentData(rentRes.value);
      if (propRes.status === 'fulfilled') {
        const props = Array.isArray(propRes.value) ? propRes.value[0] : propRes.value;
        if (props?.formattedAddress) setPropertyData(props);
      }

      if (valRes.status === 'rejected' && rentRes.status === 'rejected') {
        setError('RentCast API returned no results for this address. Try a more specific address.');
      }
    } catch {
      setError('Failed to connect to RentCast API.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number | undefined) => n ? `$${n.toLocaleString()}` : '—';

  return (
    <div className="space-y-6">
      {/* Styled header pill */}
      <div className="bg-monarch-section rounded-lg p-4">
        <div className="inline-flex items-center gap-3 bg-monarch-navy text-white px-5 py-3 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <div>
            <p className="text-base font-bold tracking-tight">RENTCAST REPORT</p>
            <p className="text-[11px] text-white/70">3rd Party Value & rental estimate</p>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div></div>
        <div className="flex items-center gap-3">
          {scenarios.length > 1 && (
            <select
              value={selectedScenario}
              onChange={e => setSelectedScenario(parseInt(e.target.value))}
              className="px-3 py-2 text-sm border border-monarch-border rounded bg-white"
            >
              {scenarios.map((_, i) => <option key={i} value={i}>Scenario {i + 1}</option>)}
            </select>
          )}
          <button
            onClick={runSearch}
            disabled={loading || !address}
            className="px-5 py-2.5 bg-monarch-navy text-white text-sm font-medium rounded-lg hover:bg-monarch-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Searching...</>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                Run RentCast Search
              </>
            )}
          </button>
        </div>
      </div>

      {/* Address being searched */}
      <div className="bg-white border border-monarch-border rounded-lg p-4">
        <p className="text-xs font-semibold text-monarch-navy uppercase tracking-wider mb-1">Search Address</p>
        <p className="text-sm">{address || <span className="text-monarch-muted italic">No address entered — go to Scenario Inputs</span>}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Results */}
      {(valueData || rentData || propertyData) && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Value Estimate */}
            <div className="bg-white border border-monarch-border rounded-lg p-5">
              <p className="text-xs font-bold text-monarch-navy uppercase tracking-wider mb-3">Property Value Estimate</p>
              {valueData ? (
                <>
                  <p className="text-3xl font-bold text-monarch-navy">{fmt(valueData.price)}</p>
                  <p className="text-xs text-monarch-muted mt-1">
                    Range: {fmt(valueData.priceRangeLow)} — {fmt(valueData.priceRangeHigh)}
                  </p>
                </>
              ) : <p className="text-sm text-monarch-muted">No data available</p>}
            </div>

            {/* Rent Estimate */}
            <div className="bg-white border border-monarch-border rounded-lg p-5">
              <p className="text-xs font-bold text-monarch-navy uppercase tracking-wider mb-3">Monthly Rent Estimate</p>
              {rentData ? (
                <>
                  <p className="text-3xl font-bold text-monarch-gold">{fmt(rentData.rent)}</p>
                  <p className="text-xs text-monarch-muted mt-1">
                    Range: {fmt(rentData.rentRangeLow)} — {fmt(rentData.rentRangeHigh)}
                  </p>
                </>
              ) : <p className="text-sm text-monarch-muted">No data available</p>}
            </div>

            {/* Annual Income Potential */}
            <div className="bg-white border border-monarch-border rounded-lg p-5">
              <p className="text-xs font-bold text-monarch-navy uppercase tracking-wider mb-3">Annual Rental Income</p>
              {rentData ? (
                <>
                  <p className="text-3xl font-bold text-green-600">{fmt(rentData.rent * 12)}</p>
                  <p className="text-xs text-monarch-muted mt-1">Based on {fmt(rentData.rent)}/mo estimate</p>
                </>
              ) : <p className="text-sm text-monarch-muted">No data available</p>}
            </div>
          </div>

          {/* Property Details */}
          {propertyData && (
            <div className="bg-white border border-monarch-border rounded-lg overflow-hidden">
              <div className="bg-monarch-navy text-white px-4 py-2">
                <span className="text-xs font-bold uppercase tracking-wider">Property Details</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-monarch-border">
                <Detail label="Address" value={propertyData.formattedAddress} />
                <Detail label="Type" value={propertyData.propertyType} />
                <Detail label="Sq Ft" value={propertyData.squareFootage?.toLocaleString()} />
                <Detail label="Bedrooms" value={String(propertyData.bedrooms || '—')} />
                <Detail label="Bathrooms" value={String(propertyData.bathrooms || '—')} />
                <Detail label="Year Built" value={String(propertyData.yearBuilt || '—')} />
                <Detail label="Lot Size" value={propertyData.lotSize ? `${propertyData.lotSize.toLocaleString()} sqft` : '—'} />
                <Detail label="Last Sale Price" value={fmt(propertyData.lastSalePrice)} />
                <Detail label="Last Sale Date" value={propertyData.lastSaleDate || '—'} />
                <Detail label="Tax Assessment" value={fmt(propertyData.taxAssessment)} />
              </div>
            </div>
          )}

          {/* Value Comparables */}
          {valueData?.comparables && valueData.comparables.length > 0 && (
            <div className="bg-white border border-monarch-border rounded-lg overflow-hidden">
              <div className="bg-monarch-navy text-white px-4 py-2">
                <span className="text-xs font-bold uppercase tracking-wider">Value Comparables</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-monarch-section text-xs text-monarch-navy font-semibold uppercase">
                    <th className="px-4 py-2 text-left">Address</th>
                    <th className="px-4 py-2 text-right">Sale Price</th>
                    <th className="px-4 py-2 text-right">Sq Ft</th>
                    <th className="px-4 py-2 text-right">Bed/Bath</th>
                    <th className="px-4 py-2 text-right">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {valueData.comparables.map((c, i) => (
                    <tr key={i} className="border-t border-monarch-border/50">
                      <td className="px-4 py-2 text-xs">{c.formattedAddress}</td>
                      <td className="px-4 py-2 text-right font-medium">{fmt(c.price)}</td>
                      <td className="px-4 py-2 text-right">{c.squareFootage?.toLocaleString() || '—'}</td>
                      <td className="px-4 py-2 text-right">{c.bedrooms}/{c.bathrooms}</td>
                      <td className="px-4 py-2 text-right">{c.distance?.toFixed(2)} mi</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Rent Comparables */}
          {rentData?.comparables && rentData.comparables.length > 0 && (
            <div className="bg-white border border-monarch-border rounded-lg overflow-hidden">
              <div className="bg-monarch-navy text-white px-4 py-2">
                <span className="text-xs font-bold uppercase tracking-wider">Rent Comparables</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-monarch-section text-xs text-monarch-navy font-semibold uppercase">
                    <th className="px-4 py-2 text-left">Address</th>
                    <th className="px-4 py-2 text-right">Rent</th>
                    <th className="px-4 py-2 text-right">Sq Ft</th>
                    <th className="px-4 py-2 text-right">Bed/Bath</th>
                    <th className="px-4 py-2 text-right">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {rentData.comparables.map((c, i) => (
                    <tr key={i} className="border-t border-monarch-border/50">
                      <td className="px-4 py-2 text-xs">{c.formattedAddress}</td>
                      <td className="px-4 py-2 text-right font-medium">{fmt(c.price)}/mo</td>
                      <td className="px-4 py-2 text-right">{c.squareFootage?.toLocaleString() || '—'}</td>
                      <td className="px-4 py-2 text-right">{c.bedrooms}/{c.bathrooms}</td>
                      <td className="px-4 py-2 text-right">{c.distance?.toFixed(2)} mi</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-monarch-muted text-center">Data provided by RentCast API — for internal use only. Not for client distribution.</p>
        </>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-3">
      <p className="text-[10px] text-monarch-muted uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-monarch-navy mt-0.5">{value || '—'}</p>
    </div>
  );
}
