'use client';

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  fisherfolkAPI,
  boatsAPI,
  gearsAPI,
  organizationAPI,
  committeesAPI,
  officersAPI,
  reportsAPI,
} from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/Report.css';

const CATEGORIES = [
  { id: 'mainLivelihood',      label: 'Main Livelihood' },
  { id: 'altLivelihood',       label: 'Alternative Livelihood' },
  { id: 'ageBracket',          label: 'Age Bracket' },
  { id: 'children',            label: 'Children' },
  { id: 'gender',              label: 'Gender' },
  { id: 'monthlyIncome',       label: 'Monthly Income' },
  { id: 'fisherfolks',         label: 'Fisherfolks' },
  { id: 'boats',               label: 'Boats' },
  { id: 'gears',               label: 'Gears' },
  { id: 'organization',        label: 'Organization' },
  { id: 'committee',           label: 'Committee & Officers' },
];

const cleanProvince = (val) =>
  (val || 'Unknown').replace(/\s*\(Not a Province\)\s*/gi, '').trim() || 'Unknown';

export default function Report() {
  const { user, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('report');

  // ── Filters ───────────────────────────────────────────────────────────────
  const [category, setCategory] = useState('mainLivelihood');
  const [locFilters, setLocFilters] = useState({ district: '', city: '', barangay: '' });

  // ── Location option lists (populated from data) ───────────────────────────
  const [districtOptions, setDistrictOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [barangayOptions, setBarangayOptions] = useState([]);

  // ── Data states ───────────────────────────────────────────────────────────
  const [rawFisherfolk, setRawFisherfolk] = useState([]);
  const [ageBracketData, setAgeBracketData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [boatsData, setBoatsData] = useState([]);
  const [gearsData, setGearsData] = useState([]);
  const [organizationData, setOrganizationData] = useState([]);
  const [committeeData, setCommitteeData] = useState([]);
  const [officersData, setOfficersData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Initial load: fetch all fisherfolk to populate location options ───────
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [ffRes, boatRes, gearRes, orgRes, comRes, offRes] = await Promise.all([
        fisherfolkAPI.getAll({ limit: 2000 }),
        boatsAPI.getAll({ limit: 2000 }),
        gearsAPI.getAll({ limit: 2000 }),
        organizationAPI.getAll(),
        committeesAPI.getAll(),
        officersAPI.getAll(),
      ]);

      const ff = ffRes.data?.fisherfolk || ffRes.data || [];
      setRawFisherfolk(ff);

      // Derive unique location options from fisherfolk
      const districts = [...new Set(ff.map(f => f.district).filter(Boolean))].sort();
      const cities    = [...new Set(ff.map(f => f.cityMunicipality).filter(Boolean))].sort();
      const barangays = [...new Set(ff.map(f => f.barangay).filter(Boolean))].sort();
      setDistrictOptions(districts);
      setCityOptions(cities);
      setBarangayOptions(barangays);

      const boats = boatRes.data?.boats || boatRes.data || [];
      setBoatsData(boats.map(b => ({
        id: b._id,
        boatName: b.boatName || '-',
        fisherfolkName: b.fisherfolkName || b.ownerName || '-',
        boatType: b.boatType || '-',
        engineType: b.engineType || '-',
        homePort: b.homePort || '-',
        barangay: b.barangay || '-',
        cityMunicipality: b.cityMunicipality || '-',
        province: b.province || '-',
        registrationDate: b.registrationDate?.slice(0, 10) || '-',
        status: b.status || '-',
      })));

      const gears = gearRes.data?.gears || gearRes.data || [];
      setGearsData(gears.map(g => ({
        id: g._id,
        gearType: g.gearType || '-',
        fisherfolkName: g.fisherfolkName || g.ownerName || '-',
        gearClassification: g.gearClassification || '-',
        quantity: g.quantity ?? '-',
        registrationDate: g.registrationDate?.slice(0, 10) || '-',
        status: g.status || '-',
      })));

      setOrganizationData((orgRes.data || []).map(o => ({
        id: o._id,
        orgName: o.name,
        registrationDate: o.registrationDate?.slice(0, 10) || '-',
        members: o.members?.length ?? o.memberCount ?? '-',
        category: o.category || '-',
      })));

      setCommitteeData((comRes.data || []).map(c => ({
        id: c._id,
        committeeName: c.name,
        chairman: c.chairman || '-',
        members: c.members || '-',
        organization: c.organization || '-',
        dateFormed: c.dateFormed?.slice(0, 10) || '-',
      })));

      setOfficersData((offRes.data || []).map(o => ({
        id: o._id,
        officerName: o.name,
        position: o.position || '-',
        organization: o.organization || '-',
        appointmentDate: o.appointmentDate?.slice(0, 10) || '-',
      })));

      // Age bracket from API
      try {
        const ageRes = await reportsAPI.getAgeBreakdown();
        const raw = Array.isArray(ageRes.data) ? ageRes.data : [];
        setAgeBracketData(raw.map(r => ({ ageBracket: r._id, count: r.count })));
      } catch (_) { setAgeBracketData([]); }

      // Gender from API
      try {
        const genRes = await reportsAPI.getGenderBreakdown();
        const raw = Array.isArray(genRes.data) ? genRes.data : [];
        const total = raw.reduce((s, r) => s + r.count, 0) || 1;
        setGenderData(raw.map(r => ({
          gender: r._id || 'Unknown',
          count: r.count,
          percentage: ((r.count / total) * 100).toFixed(1),
        })));
      } catch (_) { setGenderData([]); }

      // Income from API
      try {
        const incRes = await reportsAPI.getIncomeReport();
        const raw = Array.isArray(incRes.data) ? incRes.data : [];
        setIncomeData(raw.map(r => ({
          province: cleanProvince(r._id),
          totalFisherfolk: r.totalFisherfolk,
          avgIncome: r.avgIncome ? r.avgIncome.toFixed(2) : '0.00',
        })));
      } catch (_) { setIncomeData([]); }

    } catch (err) {
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Location filter helpers ───────────────────────────────────────────────
  // Province field stores e.g. "NCR, Fourth District", "NCR, Third District"
  // Match by keyword so "First District" matches "NCR, City of Manila, First District"
  const districtKeyword = (label) => {
    const map = {
      'First District':  'first',
      'Second District': 'second',
      'Third District':  'third',
      'Fourth District': 'fourth',
    };
    return map[label] || label.toLowerCase();
  };

  const matchesLocation = (row) => {
    const d = locFilters.district ? districtKeyword(locFilters.district) : '';
    const c = locFilters.city.toLowerCase();
    const b = locFilters.barangay.toLowerCase();
    if (d && !(row.province || '').toLowerCase().includes(d)) return false;
    if (c && !(row.cityMunicipality || '').toLowerCase().includes(c)) return false;
    if (b && !(row.barangay || '').toLowerCase().includes(b)) return false;
    return true;
  };

  // ── Filtered data per category ────────────────────────────────────────────
  const filteredFisherfolk = rawFisherfolk.filter(matchesLocation);

  const childrenData = (() => {
    const buckets = { '0': 0, '1-2': 0, '3-4': 0, '5+': 0 };
    filteredFisherfolk.forEach(f => {
      const n = Number(f.numberOfChildren ?? 0);
      if (n === 0) buckets['0']++;
      else if (n <= 2) buckets['1-2']++;
      else if (n <= 4) buckets['3-4']++;
      else buckets['5+']++;
    });
    const total = filteredFisherfolk.length || 1;
    return Object.entries(buckets).map(([k, v]) => ({
      childrenCount: k,
      fisherfolkCount: v,
      percentage: ((v / total) * 100).toFixed(1),
    }));
  })();

  const fisherfolkSummary = (() => {
    const ff = filteredFisherfolk;
    const total = ff.length;
    const active = ff.filter(f => (f.status || 'active') === 'active').length;
    const inactive = ff.filter(f => f.status === 'inactive').length;
    return [
      { category: 'Total Registered Fisherfolks', count: total },
      { category: 'Active', count: active },
      { category: 'Inactive', count: inactive },
    ];
  })();

  const mainLivelihoodGroups = (() => {
    const groups = {};
    filteredFisherfolk.forEach(f => {
      const key = f.mainLivelihood || 'Not Specified';
      groups[key] = (groups[key] || 0) + 1;
    });
    const total = filteredFisherfolk.length || 1;
    return Object.entries(groups)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => ({ livelihood: k, count: v, percentage: ((v / total) * 100).toFixed(1) }));
  })();

  const altLivelihoodGroups = (() => {
    const groups = {};
    filteredFisherfolk.forEach(f => {
      const key = f.alternativeLivelihood || 'None';
      groups[key] = (groups[key] || 0) + 1;
    });
    const total = filteredFisherfolk.length || 1;
    return Object.entries(groups)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => ({ livelihood: k, count: v, percentage: ((v / total) * 100).toFixed(1) }));
  })();

  const filteredBoats = boatsData.filter(b =>
    (!locFilters.city || b.cityMunicipality.toLowerCase().includes(locFilters.city.toLowerCase())) &&
    (!locFilters.barangay || b.barangay.toLowerCase().includes(locFilters.barangay.toLowerCase()))
  );

  const filteredGears = gearsData.filter(() => true); // gears may not have location

  // ── Update city/barangay options when district filter changes ─────────────
  useEffect(() => {
    const kw = locFilters.district ? districtKeyword(locFilters.district) : '';
    if (!kw) {
      setCityOptions([...new Set(rawFisherfolk.map(f => f.cityMunicipality).filter(Boolean))].sort());
      setBarangayOptions([...new Set(rawFisherfolk.map(f => f.barangay).filter(Boolean))].sort());
    } else {
      const subset = rawFisherfolk.filter(f => (f.province || '').toLowerCase().includes(kw));
      setCityOptions([...new Set(subset.map(f => f.cityMunicipality).filter(Boolean))].sort());
      setBarangayOptions([...new Set(subset.map(f => f.barangay).filter(Boolean))].sort());
      setLocFilters(p => ({ ...p, city: '', barangay: '' }));
    }
  }, [locFilters.district]);

  useEffect(() => {
    const kw = locFilters.district ? districtKeyword(locFilters.district) : '';
    if (!locFilters.city) {
      const subset = kw ? rawFisherfolk.filter(f => (f.province || '').toLowerCase().includes(kw)) : rawFisherfolk;
      setBarangayOptions([...new Set(subset.map(f => f.barangay).filter(Boolean))].sort());
    } else {
      const subset = rawFisherfolk.filter(f =>
        (!kw || (f.province || '').toLowerCase().includes(kw)) &&
        (f.cityMunicipality || '').toLowerCase().includes(locFilters.city.toLowerCase())
      );
      setBarangayOptions([...new Set(subset.map(f => f.barangay).filter(Boolean))].sort());
      setLocFilters(p => ({ ...p, barangay: '' }));
    }
  }, [locFilters.city]);

  // ── Export helpers ────────────────────────────────────────────────────────
  const getExportConfig = () => {
    switch (category) {
      case 'mainLivelihood':
        return { data: mainLivelihoodGroups, headers: ['LIVELIHOOD', 'COUNT', 'PERCENTAGE'], keys: ['livelihood', 'count', 'percentage'], title: 'Main Livelihood Report', filename: 'main-livelihood' };
      case 'altLivelihood':
        return { data: altLivelihoodGroups, headers: ['LIVELIHOOD', 'COUNT', 'PERCENTAGE'], keys: ['livelihood', 'count', 'percentage'], title: 'Alternative Livelihood Report', filename: 'alt-livelihood' };
      case 'ageBracket':
        return { data: ageBracketData, headers: ['AGE BRACKET', 'COUNT'], keys: ['ageBracket', 'count'], title: 'Age Bracket Report', filename: 'age-bracket' };
      case 'children':
        return { data: childrenData, headers: ['CHILDREN COUNT', 'FISHERFOLK COUNT', 'PERCENTAGE'], keys: ['childrenCount', 'fisherfolkCount', 'percentage'], title: 'Children Report', filename: 'children' };
      case 'gender':
        return { data: genderData, headers: ['GENDER', 'COUNT', 'PERCENTAGE'], keys: ['gender', 'count', 'percentage'], title: 'Gender Report', filename: 'gender' };
      case 'monthlyIncome':
        return { data: incomeData, headers: ['PROVINCE', 'TOTAL FISHERFOLK', 'AVG MONTHLY INCOME'], keys: ['province', 'totalFisherfolk', 'avgIncome'], title: 'Monthly Income Report', filename: 'monthly-income' };
      case 'fisherfolks':
        return { data: filteredFisherfolk, headers: ['RSBSA NO.', 'LASTNAME', 'FIRSTNAME', 'PROVINCE', 'CITY/MUN.', 'BARANGAY', 'STATUS'], keys: ['rsbsaNumber', 'lastName', 'firstName', 'province', 'cityMunicipality', 'barangay', 'status'], title: 'Fisherfolks Report', filename: 'fisherfolks' };
      case 'boats':
        return { data: filteredBoats, headers: ['BOAT NAME', 'FISHERFOLK', 'BOAT TYPE', 'REG. DATE', 'STATUS'], keys: ['boatName', 'fisherfolkName', 'boatType', 'registrationDate', 'status'], title: 'Boats Report', filename: 'boats' };
      case 'gears':
        return { data: filteredGears, headers: ['GEAR TYPE', 'FISHERFOLK', 'CLASSIFICATION', 'QTY', 'REG. DATE'], keys: ['gearType', 'fisherfolkName', 'gearClassification', 'quantity', 'registrationDate'], title: 'Gears Report', filename: 'gears' };
      case 'organization':
        return { data: organizationData, headers: ['ORGANIZATION NAME', 'REG. DATE', 'MEMBERS', 'CATEGORY'], keys: ['orgName', 'registrationDate', 'members', 'category'], title: 'Organizations Report', filename: 'organizations' };
      case 'committee':
        return {
          data: [...committeeData, ...officersData.map(o => ({ committeeName: '', chairman: o.officerName, members: o.position, organization: o.organization, dateFormed: o.appointmentDate }))],
          headers: ['NAME', 'CHAIRMAN/OFFICER', 'MEMBERS/POSITION', 'ORGANIZATION', 'DATE'],
          keys: ['committeeName', 'chairman', 'members', 'organization', 'dateFormed'],
          title: 'Committee & Officers Report', filename: 'committee-officers',
        };
      default:
        return null;
    }
  };

  const exportToCSV = () => {
    const cfg = getExportConfig(); if (!cfg) return;
    const { data, headers, keys, filename } = cfg;
    const rows = data.map(row => keys.map(k => { const v = row[k] ?? ''; return typeof v === 'string' && v.includes(',') ? `"${v}"` : v; }));
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = `${filename}-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const exportToExcel = () => {
    const cfg = getExportConfig(); if (!cfg) return;
    const { data, headers, keys, filename, title } = cfg;
    const headerRow = headers.map(h => `<th>${h}</th>`).join('');
    const bodyRows = data.map(row => '<tr>' + keys.map(k => `<td>${row[k] ?? ''}</td>`).join('') + '</tr>').join('');
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"/></head><body><h2>${title}</h2><p>Generated: ${new Date().toLocaleDateString('en-PH')}</p><table border="1"><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' }));
    link.download = `${filename}-${new Date().toISOString().slice(0,10)}.xls`;
    link.click();
  };

  const exportToPDF = () => {
    const cfg = getExportConfig(); if (!cfg) return;
    const { data, headers, keys, title } = cfg;
    const headerRow = headers.map(h => `<th>${h}</th>`).join('');
    const bodyRows = data.map(row => '<tr>' + keys.map(k => `<td>${row[k] ?? ''}</td>`).join('') + '</tr>').join('');
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;font-size:12px;padding:20px;}h2{color:#1a3a4a;font-size:16px;}p{color:#666;font-size:11px;margin-bottom:16px;}table{width:100%;border-collapse:collapse;font-size:11px;}th{background:#b3e5fc;color:#1a3a4a;padding:8px 10px;text-align:left;border:1px solid #81d4fa;}td{padding:7px 10px;border:1px solid #ddd;}tr:nth-child(even){background:#f8fafc;}@media print{button{display:none;}}</style></head><body><h2>${title}</h2><p>Generated: ${new Date().toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'})}</p><table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
  };

  const resetFilters = () => setLocFilters({ district: '', city: '', barangay: '' });

  // ── Table renderers ───────────────────────────────────────────────────────
  const renderTable = () => {
    if (loading) return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Loading report data...</span>
      </div>
    );
    if (error) return <div className="error-banner">{error}</div>;

    switch (category) {
      case 'mainLivelihood':
        return (
          <table className="report-table">
            <thead><tr><th>MAIN LIVELIHOOD</th><th className="num-cell">COUNT</th><th className="num-cell">PERCENTAGE</th></tr></thead>
            <tbody>
              {mainLivelihoodGroups.length === 0
                ? <tr><td colSpan="3" className="empty-text">No records found.</td></tr>
                : mainLivelihoodGroups.map((r, i) => (
                  <tr key={i}><td>{r.livelihood}</td><td className="num-cell">{r.count}</td><td className="num-cell">{r.percentage}%</td></tr>
                ))}
            </tbody>
          </table>
        );

      case 'altLivelihood':
        return (
          <table className="report-table">
            <thead><tr><th>ALTERNATIVE LIVELIHOOD</th><th className="num-cell">COUNT</th><th className="num-cell">PERCENTAGE</th></tr></thead>
            <tbody>
              {altLivelihoodGroups.length === 0
                ? <tr><td colSpan="3" className="empty-text">No records found.</td></tr>
                : altLivelihoodGroups.map((r, i) => (
                  <tr key={i}><td>{r.livelihood}</td><td className="num-cell">{r.count}</td><td className="num-cell">{r.percentage}%</td></tr>
                ))}
            </tbody>
          </table>
        );

      case 'ageBracket':
        return (
          <table className="report-table">
            <thead><tr><th>AGE BRACKET</th><th className="num-cell">COUNT</th></tr></thead>
            <tbody>
              {ageBracketData.length === 0
                ? <tr><td colSpan="2" className="empty-text">No records found.</td></tr>
                : ageBracketData.map((r, i) => (
                  <tr key={i}><td>{r.ageBracket}</td><td className="num-cell">{r.count}</td></tr>
                ))}
            </tbody>
          </table>
        );

      case 'children':
        return (
          <table className="report-table">
            <thead><tr><th>NUMBER OF CHILDREN</th><th className="num-cell">FISHERFOLK COUNT</th><th className="num-cell">PERCENTAGE</th></tr></thead>
            <tbody>
              {childrenData.map((r, i) => (
                <tr key={i}><td>{r.childrenCount}</td><td className="num-cell">{r.fisherfolkCount}</td><td className="num-cell">{r.percentage}%</td></tr>
              ))}
            </tbody>
          </table>
        );

      case 'gender':
        return (
          <table className="report-table">
            <thead><tr><th>GENDER</th><th className="num-cell">COUNT</th><th className="num-cell">PERCENTAGE</th></tr></thead>
            <tbody>
              {genderData.length === 0
                ? <tr><td colSpan="3" className="empty-text">No records found.</td></tr>
                : genderData.map((r, i) => (
                  <tr key={i}><td>{r.gender}</td><td className="num-cell">{r.count}</td><td className="num-cell">{r.percentage}%</td></tr>
                ))}
            </tbody>
          </table>
        );

      case 'monthlyIncome':
        return (
          <table className="report-table">
            <thead><tr><th>PROVINCE</th><th className="num-cell">TOTAL FISHERFOLK</th><th className="num-cell">AVG MONTHLY INCOME (PHP)</th></tr></thead>
            <tbody>
              {incomeData.length === 0
                ? <tr><td colSpan="3" className="empty-text">No records found.</td></tr>
                : incomeData.map((r, i) => (
                  <tr key={i}><td>{r.province}</td><td className="num-cell">{r.totalFisherfolk}</td><td className="num-cell">{r.avgIncome}</td></tr>
                ))}
            </tbody>
          </table>
        );

      case 'fisherfolks':
        return (
          <>
            <div className="report-summary-row">
              {fisherfolkSummary.map((s, i) => (
                <div key={i} className="summary-card">
                  <span className="summary-label">{s.category}</span>
                  <span className="summary-value">{s.count}</span>
                </div>
              ))}
            </div>
            <table className="report-table">
              <thead><tr><th>RSBSA NO.</th><th>LAST NAME</th><th>FIRST NAME</th><th>PROVINCE</th><th>CITY/MUNICIPALITY</th><th>BARANGAY</th><th>STATUS</th></tr></thead>
              <tbody>
                {filteredFisherfolk.length === 0
                  ? <tr><td colSpan="7" className="empty-text">No records found.</td></tr>
                  : filteredFisherfolk.map((r, i) => (
                    <tr key={r._id || i}>
                      <td>{r.rsbsaNumber || '-'}</td>
                      <td>{r.lastName || '-'}</td>
                      <td>{r.firstName || '-'}</td>
                      <td>{cleanProvince(r.province)}</td>
                      <td>{r.cityMunicipality || '-'}</td>
                      <td>{r.barangay || '-'}</td>
                      <td><span className={`status-badge ${r.status === 'active' ? 'active' : 'inactive'}`}>{r.status || 'active'}</span></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        );

      case 'boats':
        return (
          <table className="report-table">
            <thead><tr><th>BOAT NAME</th><th>FISHERFOLK</th><th>BOAT TYPE</th><th>ENGINE TYPE</th><th>HOME PORT</th><th>CITY/MUN.</th><th>BARANGAY</th><th>REG. DATE</th><th>STATUS</th></tr></thead>
            <tbody>
              {filteredBoats.length === 0
                ? <tr><td colSpan="9" className="empty-text">No records found.</td></tr>
                : filteredBoats.map((r, i) => (
                  <tr key={r.id || i}>
                    <td>{r.boatName}</td><td>{r.fisherfolkName}</td><td>{r.boatType}</td>
                    <td>{r.engineType}</td><td>{r.homePort}</td><td>{r.cityMunicipality}</td>
                    <td>{r.barangay}</td><td>{r.registrationDate}</td>
                    <td><span className={`status-badge ${r.status === 'active' ? 'active' : 'inactive'}`}>{r.status}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        );

      case 'gears':
        return (
          <table className="report-table">
            <thead><tr><th>GEAR TYPE</th><th>FISHERFOLK</th><th>CLASSIFICATION</th><th className="num-cell">QTY</th><th>REG. DATE</th><th>STATUS</th></tr></thead>
            <tbody>
              {filteredGears.length === 0
                ? <tr><td colSpan="6" className="empty-text">No records found.</td></tr>
                : filteredGears.map((r, i) => (
                  <tr key={r.id || i}>
                    <td>{r.gearType}</td><td>{r.fisherfolkName}</td><td>{r.gearClassification}</td>
                    <td className="num-cell">{r.quantity}</td><td>{r.registrationDate}</td>
                    <td><span className={`status-badge ${r.status === 'active' ? 'active' : 'inactive'}`}>{r.status}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        );

      case 'organization':
        return (
          <table className="report-table">
            <thead><tr><th>ORGANIZATION NAME</th><th>REGISTRATION DATE</th><th className="num-cell">MEMBERS</th><th>CATEGORY</th></tr></thead>
            <tbody>
              {organizationData.length === 0
                ? <tr><td colSpan="4" className="empty-text">No records found.</td></tr>
                : organizationData.map((r, i) => (
                  <tr key={r.id || i}><td>{r.orgName}</td><td>{r.registrationDate}</td><td className="num-cell">{r.members}</td><td>{r.category}</td></tr>
                ))}
            </tbody>
          </table>
        );

      case 'committee':
        return (
          <div className="committee-tables">
            <h4 className="sub-table-title">Committees</h4>
            <table className="report-table">
              <thead><tr><th>COMMITTEE NAME</th><th>CHAIRMAN</th><th>MEMBERS</th><th>ORGANIZATION</th><th>DATE FORMED</th></tr></thead>
              <tbody>
                {committeeData.length === 0
                  ? <tr><td colSpan="5" className="empty-text">No committee records found.</td></tr>
                  : committeeData.map((r, i) => (
                    <tr key={r.id || i}><td>{r.committeeName}</td><td>{r.chairman}</td><td>{r.members}</td><td>{r.organization}</td><td>{r.dateFormed}</td></tr>
                  ))}
              </tbody>
            </table>
            <h4 className="sub-table-title" style={{ marginTop: '20px' }}>Officers</h4>
            <table className="report-table">
              <thead><tr><th>OFFICER NAME</th><th>POSITION</th><th>ORGANIZATION</th><th>APPOINTMENT DATE</th></tr></thead>
              <tbody>
                {officersData.length === 0
                  ? <tr><td colSpan="4" className="empty-text">No officer records found.</td></tr>
                  : officersData.map((r, i) => (
                    <tr key={r.id || i}><td>{r.officerName}</td><td>{r.position}</td><td>{r.organization}</td><td>{r.appointmentDate}</td></tr>
                  ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  const hasLocFilters = locFilters.district || locFilters.city || locFilters.barangay;
  const currentLabel = CATEGORIES.find(c => c.id === category)?.label || '';

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
      <div className="main-content">
        <Header title="REPORT" user={user} />
        <div className="content-area report-container">

          {/* ── Filter Panel ─────────────────────────────────────────────── */}
          <div className="report-filter-panel">
            <div className="report-filter-row">
              {/* Category */}
              <div className="report-filter-group">
                <label className="report-filter-label">Report Category</label>
                <select
                  className="report-filter-select report-filter-select--category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="report-filter-divider" />

              {/* Location filters */}
              <div className="report-filter-group">
                <label className="report-filter-label">District</label>
                <select
                  className="report-filter-select"
                  value={locFilters.district}
                  onChange={e => setLocFilters(p => ({ ...p, district: e.target.value }))}
                >
                  <option value="">All Districts</option>
                  <option value="First District">First District</option>
                  <option value="Second District">Second District</option>
                  <option value="Third District">Third District</option>
                  <option value="Fourth District">Fourth District</option>
                </select>
              </div>

              <div className="report-filter-group">
                <label className="report-filter-label">City / Municipality</label>
                <select
                  className="report-filter-select"
                  value={locFilters.city}
                  onChange={e => setLocFilters(p => ({ ...p, city: e.target.value }))}
                >
                  <option value="">All Cities</option>
                  {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="report-filter-group">
                <label className="report-filter-label">Barangay</label>
                <select
                  className="report-filter-select"
                  value={locFilters.barangay}
                  onChange={e => setLocFilters(p => ({ ...p, barangay: e.target.value }))}
                >
                  <option value="">All Barangays</option>
                  {barangayOptions.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {hasLocFilters && (
                <button type="button" className="report-reset-btn" onClick={resetFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* ── Results Section ───────────────────────────────────────────── */}
          <div className="report-table-section">
            <div className="report-top-bar">
              <div className="report-top-bar-left">
                <h3 className="report-section-title">{currentLabel}</h3>
                {hasLocFilters && (
                  <div className="report-active-filters">
                    {locFilters.district && <span className="filter-chip">District: {locFilters.district}</span>}
                    {locFilters.city && <span className="filter-chip">City: {locFilters.city}</span>}
                    {locFilters.barangay && <span className="filter-chip">Barangay: {locFilters.barangay}</span>}
                  </div>
                )}
              </div>
              <div className="export-btns">
                <button type="button" className="export-btn export-csv"   onClick={exportToCSV}>CSV</button>
                <button type="button" className="export-btn export-excel" onClick={exportToExcel}>Excel</button>
                <button type="button" className="export-btn export-pdf"   onClick={exportToPDF}>PDF</button>
              </div>
            </div>

            <div className="report-table-wrapper">
              {renderTable()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
