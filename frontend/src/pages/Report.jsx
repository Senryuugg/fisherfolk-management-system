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

export default function Report() {
  const { user, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('report');
  const [activeTab, setActiveTab] = useState('livelihood');

  const [filters, setFilters] = useState({ region: 'NCR', province: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Live data per tab
  const [fisherfolkData, setFisherfolkData] = useState([]);
  const [ageBracketData, setAgeBracketData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [fisherfolkTotalData, setFisherfolkTotalData] = useState([]);
  const [boatsData, setBoatsData] = useState([]);
  const [gearsData, setGearsData] = useState([]);
  const [organizationData, setOrganizationData] = useState([]);
  const [committeeData, setCommitteeData] = useState([]);
  const [officersData, setOfficersData] = useState([]);
  const [childrenData, setChildrenData] = useState([]);

  // Fetch data when tab changes
  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab]);

  const fetchTabData = async (tab) => {
    setLoading(true);
    setError('');
    try {
      switch (tab) {
        case 'livelihood':
        case 'alternative': {
          const res = await fisherfolkAPI.getAll({ limit: 200 });
          const all = res.data?.fisherfolk || res.data || [];
          setFisherfolkData(all);
          break;
        }
        case 'ageBracket': {
          const res = await reportsAPI.getAgeBreakdown();
          const raw = Array.isArray(res.data) ? res.data : [];
          setAgeBracketData(raw.map((r) => ({ ageBracket: r._id, count: r.count })));
          break;
        }
        case 'children': {
          // Derived from fisherfolk numberOfChildren field
          const res = await fisherfolkAPI.getAll({ limit: 500 });
          const all = res.data?.fisherfolk || res.data || [];
          const buckets = { '0': 0, '1-2': 0, '3-4': 0, '5+': 0 };
          all.forEach((f) => {
            const n = Number(f.numberOfChildren ?? 0);
            if (n === 0) buckets['0']++;
            else if (n <= 2) buckets['1-2']++;
            else if (n <= 4) buckets['3-4']++;
            else buckets['5+']++;
          });
          const total = all.length || 1;
          setChildrenData(
            Object.entries(buckets).map(([k, v]) => ({
              childrenCount: k,
              fisherfolkCount: v,
              percentage: ((v / total) * 100).toFixed(1),
            }))
          );
          break;
        }
        case 'gender': {
          const res = await reportsAPI.getGenderBreakdown();
          const raw = Array.isArray(res.data) ? res.data : [];
          const total = raw.reduce((s, r) => s + r.count, 0) || 1;
          setGenderData(
            raw.map((r) => ({
              gender: r._id || 'Unknown',
              count: r.count,
              percentage: ((r.count / total) * 100).toFixed(1),
            }))
          );
          break;
        }
        case 'income': {
          const res = await reportsAPI.getIncomeReport();
          const raw = Array.isArray(res.data) ? res.data : [];
          setIncomeData(
            raw.map((r) => ({
              province: r._id || 'Unknown',
              totalFisherfolk: r.totalFisherfolk,
              avgIncome: r.avgIncome ? r.avgIncome.toFixed(2) : '0.00',
            }))
          );
          break;
        }
        case 'totalFisherfolks': {
          const res = await reportsAPI.getFisherfolkStats();
          const d = res.data;
          const total = d.totalFisherfolk?.[0]?.count || 0;
          const active = d.byStatus?.find((s) => s._id === 'active')?.count || 0;
          const inactive = d.byStatus?.find((s) => s._id === 'inactive')?.count || 0;
          setFisherfolkTotalData([
            { category: 'Total Registered Fisherfolks', count: total },
            { category: 'Active', count: active },
            { category: 'Inactive', count: inactive },
          ]);
          break;
        }
        case 'boats': {
          const res = await boatsAPI.getAll({ limit: 200 });
          const all = res.data?.boats || res.data || [];
          setBoatsData(
            all.map((b) => ({
              id: b._id,
              boatName: b.boatName || b.name || '-',
              owner: b.owner ? `${b.owner.lastName || ''}, ${b.owner.firstName || ''}`.trim().replace(/^,\s*/, '') : (b.ownerName || '-'),
              boatType: b.boatType || '-',
              registrationDate: b.registrationDate?.slice(0, 10) || '-',
              status: b.status || '-',
            }))
          );
          break;
        }
        case 'gears': {
          const res = await gearsAPI.getAll({ limit: 200 });
          const all = res.data?.gears || res.data || [];
          setGearsData(
            all.map((g) => ({
              id: g._id,
              gearType: g.gearType || '-',
              owner: g.owner ? `${g.owner.lastName || ''}, ${g.owner.firstName || ''}`.trim().replace(/^,\s*/, '') : (g.ownerName || '-'),
              quantity: g.quantity || 1,
              condition: g.condition || '-',
              registrationDate: g.registrationDate?.slice(0, 10) || '-',
            }))
          );
          break;
        }
        case 'organizations': {
          const res = await organizationAPI.getAll();
          const all = res.data || [];
          setOrganizationData(
            all.map((o) => ({
              id: o._id,
              orgName: o.name,
              registrationDate: o.registrationDate?.slice(0, 10) || '-',
              members: o.members?.length ?? o.memberCount ?? '-',
              category: o.category,
            }))
          );
          break;
        }
        case 'committee': {
          const res = await committeesAPI.getAll();
          const all = res.data || [];
          setCommitteeData(
            all.map((c) => ({
              id: c._id,
              committeeName: c.name,
              chairman: c.chairman,
              members: c.members,
              organization: c.organization,
              dateFormed: c.dateFormed?.slice(0, 10) || '-',
            }))
          );
          break;
        }
        case 'officers': {
          const res = await officersAPI.getAll();
          const all = res.data || [];
          setOfficersData(
            all.map((o) => ({
              id: o._id,
              officerName: o.name,
              position: o.position,
              organization: o.organization,
              appointmentDate: o.appointmentDate?.slice(0, 10) || '-',
            }))
          );
          break;
        }
        default:
          break;
      }
    } catch (err) {
      setError(`Failed to load ${tab} data.`);
    } finally {
      setLoading(false);
    }
  };

  // ── Tab export config — maps each tab to its current live data ───────────────
  const getTabExportConfig = () => {
    switch (activeTab) {
      case 'livelihood':
      case 'alternative':
        return {
          data: fisherfolkData,
          headers: ['RSBSA NUMBER', 'REGISTRATION NUMBER', 'REGISTRATION DATE', 'LASTNAME', 'FIRSTNAME', 'MIDDLE NAME', 'PROVINCE', 'CITY/MUNICIPALITY', 'BARANGAY'],
          keys: ['rsbsaNumber', 'registrationNumber', 'registrationDate', 'lastName', 'firstName', 'middleName', 'province', 'cityMunicipality', 'barangay'],
          filename: activeTab === 'livelihood' ? 'main-livelihood-report' : 'alternative-livelihood-report',
          title: activeTab === 'livelihood' ? 'Main Livelihood Report' : 'Alternative Livelihood Report',
        };
      case 'ageBracket':
        return { data: ageBracketData, headers: ['AGE BRACKET', 'COUNT'], keys: ['ageBracket', 'count'], filename: 'age-bracket-report', title: 'Age Bracket Report' };
      case 'children':
        return { data: childrenData, headers: ['CHILDREN COUNT', 'FISHERFOLK COUNT', 'PERCENTAGE'], keys: ['childrenCount', 'fisherfolkCount', 'percentage'], filename: 'children-report', title: 'Children Report' };
      case 'gender':
        return { data: genderData, headers: ['GENDER', 'COUNT', 'PERCENTAGE'], keys: ['gender', 'count', 'percentage'], filename: 'gender-report', title: 'Gender Report' };
      case 'income':
        return { data: incomeData, headers: ['PROVINCE', 'TOTAL FISHERFOLK', 'AVG INCOME'], keys: ['province', 'totalFisherfolk', 'avgIncome'], filename: 'monthly-income-report', title: 'Monthly Income Report' };
      case 'totalFisherfolks':
        return { data: fisherfolkTotalData, headers: ['CATEGORY', 'COUNT'], keys: ['category', 'count'], filename: 'total-fisherfolks-report', title: 'Total Fisherfolks Report' };
      case 'boats':
        return { data: boatsData, headers: ['BOAT NAME', 'OWNER', 'BOAT TYPE', 'REGISTRATION DATE', 'STATUS'], keys: ['boatName', 'owner', 'boatType', 'registrationDate', 'status'], filename: 'boats-report', title: 'Boats Report' };
      case 'gears':
        return { data: gearsData, headers: ['GEAR TYPE', 'OWNER', 'QUANTITY', 'CONDITION', 'REGISTRATION DATE'], keys: ['gearType', 'owner', 'quantity', 'condition', 'registrationDate'], filename: 'gears-report', title: 'Gears Report' };
      case 'organizations':
        return { data: organizationData, headers: ['ORGANIZATION NAME', 'REGISTRATION DATE', 'MEMBERS', 'CATEGORY'], keys: ['orgName', 'registrationDate', 'members', 'category'], filename: 'organizations-report', title: 'Organizations Report' };
      case 'committee':
        return { data: committeeData, headers: ['COMMITTEE NAME', 'CHAIRMAN', 'MEMBERS', 'ORGANIZATION', 'DATE FORMED'], keys: ['committeeName', 'chairman', 'members', 'organization', 'dateFormed'], filename: 'committee-report', title: 'Committee Report' };
      case 'officers':
        return { data: officersData, headers: ['OFFICER NAME', 'POSITION', 'ORGANIZATION', 'APPOINTMENT DATE'], keys: ['officerName', 'position', 'organization', 'appointmentDate'], filename: 'officers-report', title: 'Officers Report' };
      default:
        return null;
    }
  };

  // ── CSV Export ────────────────────────────────────────────────────────────────
  const exportToCSV = () => {
    const cfg = getTabExportConfig();
    if (!cfg) return;
    const { data, headers, keys, filename } = cfg;
    const rows = data.map((row) =>
      keys.map((k) => {
        const v = row[k] ?? '';
        return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
      })
    );
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // ── Excel Export (XLS via HTML table trick) ──────────────────────────────────
  const exportToExcel = () => {
    const cfg = getTabExportConfig();
    if (!cfg) return;
    const { data, headers, keys, filename, title } = cfg;
    const headerRow = headers.map((h) => `<th>${h}</th>`).join('');
    const bodyRows = data
      .map((row) => '<tr>' + keys.map((k) => `<td>${row[k] ?? ''}</td>`).join('') + '</tr>')
      .join('');
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"/></head>
        <body>
          <h2>${title}</h2>
          <p>Generated: ${new Date().toLocaleDateString('en-PH')}</p>
          <table border="1">
            <thead><tr>${headerRow}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </body>
      </html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
  };

  // ── PDF Export (print dialog) ─────────────────────────────────────────────────
  const exportToPDF = () => {
    const cfg = getTabExportConfig();
    if (!cfg) return;
    const { data, headers, keys, title } = cfg;
    const headerRow = headers.map((h) => `<th>${h}</th>`).join('');
    const bodyRows = data
      .map((row) => '<tr>' + keys.map((k) => `<td>${row[k] ?? ''}</td>`).join('') + '</tr>')
      .join('');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
            h2 { color: #1a3a4a; margin-bottom: 4px; font-size: 16px; }
            p { color: #666; margin-bottom: 16px; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background: #b3e5fc; color: #1a3a4a; padding: 8px 10px; text-align: left; border: 1px solid #81d4fa; }
            td { padding: 7px 10px; border: 1px solid #ddd; }
            tr:nth-child(even) { background: #f8fafc; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <p>Generated: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <table>
            <thead><tr>${headerRow}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </body>
      </html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 400);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => fetchTabData(activeTab);

  // ── Tab rendering ─────────────────────────────────────────────────────────────
  const renderTabContent = () => {
    if (loading) return <div className="loading-row">Loading...</div>;
    if (error) return <div className="error-banner">{error}</div>;

    switch (activeTab) {
      case 'livelihood':
      case 'alternative':
        return (
          <table className="report-table">
            <thead>
              <tr>
                <th>RSBSA NUMBER</th><th>REGISTRATION DATE</th><th>LASTNAME</th>
                <th>FIRSTNAME</th><th>MIDDLE NAME</th><th>PROVINCE</th>
                <th>CITY/MUNICIPALITY</th><th>BARANGAY</th>
              </tr>
            </thead>
            <tbody>
              {fisherfolkData.length === 0 ? (
                <tr><td colSpan="8" className="empty-text">No records found.</td></tr>
              ) : fisherfolkData.map((row) => (
                <tr key={row._id}>
                  <td>{row.rsbsaNumber}</td>
                  <td>{row.registrationDate?.slice(0, 10)}</td>
                  <td>{row.lastName}</td>
                  <td>{row.firstName}</td>
                  <td>{row.middleName || '-'}</td>
                  <td>{row.province}</td>
                  <td>{row.cityMunicipality}</td>
                  <td>{row.barangay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'ageBracket':
        return (
          <table className="report-table">
            <thead><tr><th>AGE BRACKET</th><th>COUNT</th></tr></thead>
            <tbody>
              {ageBracketData.length === 0 ? (
                <tr><td colSpan="2" className="empty-text">No records found.</td></tr>
              ) : ageBracketData.map((row, i) => (
                <tr key={i}><td>{row.ageBracket}</td><td>{row.count}</td></tr>
              ))}
            </tbody>
          </table>
        );

      case 'children':
        return (
          <table className="report-table">
            <thead><tr><th>CHILDREN COUNT</th><th>FISHERFOLK COUNT</th><th>PERCENTAGE</th></tr></thead>
            <tbody>
              {childrenData.length === 0 ? (
                <tr><td colSpan="3" className="empty-text">No records found.</td></tr>
              ) : childrenData.map((row, i) => (
                <tr key={i}><td>{row.childrenCount}</td><td>{row.fisherfolkCount}</td><td>{row.percentage}%</td></tr>
              ))}
            </tbody>
          </table>
        );

      case 'gender':
        return (
          <table className="report-table">
            <thead><tr><th>GENDER</th><th>COUNT</th><th>PERCENTAGE</th></tr></thead>
            <tbody>
              {genderData.length === 0 ? (
                <tr><td colSpan="3" className="empty-text">No records found.</td></tr>
              ) : genderData.map((row, i) => (
                <tr key={i}><td>{row.gender}</td><td>{row.count}</td><td>{row.percentage}%</td></tr>
              ))}
            </tbody>
          </table>
        );

      case 'income':
        return (
          <table className="report-table">
            <thead><tr><th>PROVINCE</th><th>TOTAL FISHERFOLK</th><th>AVG INCOME</th></tr></thead>
            <tbody>
              {incomeData.length === 0 ? (
                <tr><td colSpan="3" className="empty-text">No records found.</td></tr>
              ) : incomeData.map((row, i) => (
                <tr key={i}><td>{row.province}</td><td>{row.totalFisherfolk}</td><td>{row.avgIncome}</td></tr>
              ))}
            </tbody>
          </table>
        );

      case 'totalFisherfolks':
        return (
          <table className="report-table">
            <thead><tr><th>CATEGORY</th><th>COUNT</th></tr></thead>
            <tbody>
              {fisherfolkTotalData.map((row, i) => (
                <tr key={i}><td>{row.category}</td><td>{row.count}</td></tr>
              ))}
            </tbody>
          </table>
        );

      case 'boats':
        return (
          <table className="report-table">
            <thead><tr><th>BOAT NAME</th><th>OWNER</th><th>BOAT TYPE</th><th>REGISTRATION DATE</th><th>STATUS</th></tr></thead>
            <tbody>
              {boatsData.length === 0 ? (
                <tr><td colSpan="5" className="empty-text">No records found.</td></tr>
              ) : boatsData.map((row) => (
                <tr key={row.id}><td>{row.boatName}</td><td>{row.owner}</td><td>{row.boatType}</td><td>{row.registrationDate}</td><td>{row.status}</td></tr>
              ))}
            </tbody>
          </table>
        );

      case 'gears':
        return (
          <table className="report-table">
            <thead><tr><th>GEAR TYPE</th><th>OWNER</th><th>QUANTITY</th><th>CONDITION</th><th>REGISTRATION DATE</th></tr></thead>
            <tbody>
              {gearsData.length === 0 ? (
                <tr><td colSpan="5" className="empty-text">No records found.</td></tr>
              ) : gearsData.map((row) => (
                <tr key={row.id}><td>{row.gearType}</td><td>{row.owner}</td><td>{row.quantity}</td><td>{row.condition}</td><td>{row.registrationDate}</td></tr>
              ))}
            </tbody>
          </table>
        );

      case 'organizations':
        return (
          <table className="report-table">
            <thead><tr><th>ORGANIZATION NAME</th><th>REGISTRATION DATE</th><th>MEMBERS</th><th>CATEGORY</th></tr></thead>
            <tbody>
              {organizationData.length === 0 ? (
                <tr><td colSpan="4" className="empty-text">No records found.</td></tr>
              ) : organizationData.map((row) => (
                <tr key={row.id}><td>{row.orgName}</td><td>{row.registrationDate}</td><td>{row.members}</td><td>{row.category}</td></tr>
              ))}
            </tbody>
          </table>
        );

      case 'committee':
        return (
          <table className="report-table">
            <thead><tr><th>COMMITTEE NAME</th><th>CHAIRMAN</th><th>MEMBERS</th><th>ORGANIZATION</th><th>DATE FORMED</th></tr></thead>
            <tbody>
              {committeeData.length === 0 ? (
                <tr><td colSpan="5" className="empty-text">No records found.</td></tr>
              ) : committeeData.map((row) => (
                <tr key={row.id}><td>{row.committeeName}</td><td>{row.chairman}</td><td>{row.members}</td><td>{row.organization}</td><td>{row.dateFormed}</td></tr>
              ))}
            </tbody>
          </table>
        );

      case 'officers':
        return (
          <table className="report-table">
            <thead><tr><th>OFFICER NAME</th><th>POSITION</th><th>ORGANIZATION</th><th>APPOINTMENT DATE</th></tr></thead>
            <tbody>
              {officersData.length === 0 ? (
                <tr><td colSpan="4" className="empty-text">No records found.</td></tr>
              ) : officersData.map((row) => (
                <tr key={row.id}><td>{row.officerName}</td><td>{row.position}</td><td>{row.organization}</td><td>{row.appointmentDate}</td></tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  const TABS = [
    { id: 'livelihood', label: 'Main Livelihood' },
    { id: 'alternative', label: 'Alternative Livelihood' },
    { id: 'ageBracket', label: 'Age Bracket' },
    { id: 'children', label: 'Children' },
    { id: 'gender', label: 'Gender' },
    { id: 'income', label: 'Monthly Income' },
    { id: 'totalFisherfolks', label: 'Total Fisherfolks' },
    { id: 'boats', label: 'Boats' },
    { id: 'gears', label: 'Gears' },
    { id: 'organizations', label: 'Organizations' },
    { id: 'committee', label: 'Committee' },
    { id: 'officers', label: 'Officers' },
  ];

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
      <div className="main-content">
        <Header title="REPORT" user={user} />
        <div className="content-area report-container">
          <div className="report-table-section">
            <div className="report-tabs-header">
              <div className="report-tabs">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    className={`report-tab ${activeTab === t.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="report-tab-content">
              <div className="filter-section">
                {(activeTab === 'livelihood' || activeTab === 'alternative') && (
                  <>
                    <div className="filter-inputs">
                      <select name="region" value={filters.region} onChange={handleFilterChange}>
                        <option value="NCR">NCR</option>
                        <option value="Region 1">Region 1</option>
                        <option value="Region 2">Region 2</option>
                      </select>
                      <select name="province" value={filters.province} onChange={handleFilterChange}>
                        <option value="">Province</option>
                        <option value="Manila">Manila</option>
                        <option value="Quezon">Quezon</option>
                      </select>
                    </div>
                    <button className="search-btn" onClick={handleSearch}>Search</button>
                    <button className="reset-btn" onClick={() => { setFilters({ region: 'NCR', province: '' }); fetchTabData(activeTab); }}>Reset</button>
                  </>
                )}
                <div className="export-btns">
                  <button className="export-btn export-csv" onClick={exportToCSV}>CSV</button>
                  <button className="export-btn export-excel" onClick={exportToExcel}>Excel</button>
                  <button className="export-btn export-pdf" onClick={exportToPDF}>PDF</button>
                </div>
              </div>

              <div className="table-section">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
