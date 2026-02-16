'use client';

import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/Report.css';

export default function Report() {
  const { user, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('report');
  const [activeTab, setActiveTab] = useState('livelihood');
  const [filters, setFilters] = useState({
    region: 'NCR',
    province: '',
  });

  // Sample data for Fisherfolks/Livelihood
  const fisherfolkData = [
    {
      id: 1,
      rsbsaNumber: 'i26-1339130000-004',
      registrationNumber: 'REG001',
      registrationDate: '01/23/2026',
      lastName: 'MANAHON',
      firstName: 'PABIE',
      middleName: 'CASENARES',
      province: 'NCR, City of Manila, First District (Not a Province)',
      cityMunicipality: 'Port Area',
      barangay: 'Barangay 649',
    },
    {
      id: 2,
      rsbsaNumber: 'i26-1339130000-005',
      registrationNumber: 'REG002',
      registrationDate: '01/23/2026',
      lastName: 'CABAGUE',
      firstName: 'JOMAR',
      middleName: 'CODILLA',
      province: 'NCR, City of Manila, First District (Not a Province)',
      cityMunicipality: 'Port Area',
      barangay: 'Barangay 649',
    },
    {
      id: 3,
      rsbsaNumber: 'i25-1339010000-001',
      registrationNumber: 'REG003',
      registrationDate: '04/24/2025',
      lastName: 'DE JESUS',
      firstName: 'RENE',
      middleName: 'AGUILAR',
      province: 'NCR, City of Manila, First District (Not a Province)',
      cityMunicipality: 'Tondo I/II',
      barangay: 'Barangay 129',
    },
  ];

  // Sample data for Age Bracket
  const ageBracketData = [
    { id: 1, ageBracket: '18-25', count: 45, percentage: 15.2 },
    { id: 2, ageBracket: '26-35', count: 92, percentage: 31.1 },
    { id: 3, ageBracket: '36-45', count: 85, percentage: 28.7 },
    { id: 4, ageBracket: '46-55', count: 54, percentage: 18.2 },
    { id: 5, ageBracket: '56+', count: 20, percentage: 6.8 },
  ];

  // Sample data for Children
  const childrenData = [
    { id: 1, childrenCount: '0', fisherfolkCount: 125, percentage: 42.2 },
    { id: 2, childrenCount: '1-2', fisherfolkCount: 98, percentage: 33.1 },
    { id: 3, childrenCount: '3-4', fisherfolkCount: 45, percentage: 15.2 },
    { id: 4, childrenCount: '5+', fisherfolkCount: 28, percentage: 9.5 },
  ];

  // Sample data for Gender
  const genderData = [
    { id: 1, gender: 'Male', count: 220, percentage: 74.2 },
    { id: 2, gender: 'Female', count: 76, percentage: 25.8 },
  ];

  // Sample data for Monthly Income
  const incomeData = [
    { id: 1, incomeRange: 'Below 5,000', count: 35, percentage: 11.8 },
    { id: 2, incomeRange: '5,000 - 10,000', count: 78, percentage: 26.4 },
    { id: 3, incomeRange: '10,000 - 20,000', count: 112, percentage: 37.8 },
    { id: 4, incomeRange: '20,000 - 30,000', count: 52, percentage: 17.6 },
    { id: 5, incomeRange: '30,000+', count: 19, percentage: 6.4 },
  ];

  // Sample data for Total Fisherfolks Count
  const fisherfolkTotalData = [
    { id: 1, category: 'Total Registered Fisherfolks', count: 296 },
    { id: 2, category: 'Active', count: 268 },
    { id: 3, category: 'Inactive', count: 28 },
  ];

  // Sample data for Boats
  const boatsData = [
    { id: 1, boatName: 'Bangka A1', owner: 'MANAHON, PABIE', boatType: 'Fishing Boat', registrationDate: '01/23/2026', status: 'Active' },
    { id: 2, boatName: 'Bangka B2', owner: 'CABAGUE, JOMAR', boatType: 'Fishing Boat', registrationDate: '01/23/2026', status: 'Active' },
    { id: 3, boatName: 'Bangka C3', owner: 'DE JESUS, RENE', boatType: 'Fishing Boat', registrationDate: '04/24/2025', status: 'Inactive' },
  ];

  // Sample data for Gears
  const gearsData = [
    { id: 1, gearType: 'Fishing Net', owner: 'MANAHON, PABIE', quantity: 5, condition: 'Good', registrationDate: '01/23/2026' },
    { id: 2, gearType: 'Hook and Line', owner: 'CABAGUE, JOMAR', quantity: 12, condition: 'Good', registrationDate: '01/23/2026' },
    { id: 3, gearType: 'Fish Trap', owner: 'DE JESUS, RENE', quantity: 3, condition: 'Fair', registrationDate: '04/24/2025' },
  ];

  // Sample data for Organizations
  const organizationData = [
    { id: 1, orgName: 'Fishing Association A', registrationDate: '12/15/2024', members: 45, category: 'Cooperative' },
    { id: 2, orgName: 'Fishermen United Group', registrationDate: '11/20/2024', members: 67, category: 'Association' },
    { id: 3, orgName: 'Coastal Fishermen Union', registrationDate: '10/05/2024', members: 89, category: 'Union' },
  ];

  // Sample data for Committee
  const committeeData = [
    { id: 1, committeeName: 'Management Committee', chairman: 'SANTOS, JUAN', members: 5, organization: 'Fishing Association A', dateFormed: '01/10/2025' },
    { id: 2, committeeName: 'Finance Committee', chairman: 'CRUZ, MARIA', members: 4, organization: 'Fishermen United Group', dateFormed: '12/20/2024' },
    { id: 3, committeeName: 'Operations Committee', chairman: 'REYES, PEDRO', members: 6, organization: 'Coastal Fishermen Union', dateFormed: '11/15/2024' },
  ];

  // Sample data for Officers
  const officersData = [
    { id: 1, officerName: 'SANTOS, JUAN', position: 'Chairman', organization: 'Fishing Association A', appointmentDate: '01/10/2025' },
    { id: 2, officerName: 'CRUZ, MARIA', position: 'Vice Chairman', organization: 'Fishing Association A', appointmentDate: '01/10/2025' },
    { id: 3, officerName: 'REYES, PEDRO', position: 'Treasurer', organization: 'Fishermen United Group', appointmentDate: '12/20/2024' },
    { id: 4, officerName: 'GARCIA, ANNA', position: 'Secretary', organization: 'Coastal Fishermen Union', appointmentDate: '11/15/2024' },
  ];

  // CSV Export utility function
  const exportToCSV = (data, headers, filename) => {
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => {
          const key = header.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
          const value = Object.values(row).find((v, i) => 
            Object.keys(row)[i].toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') === key
          ) || '';
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleExport = () => {
    let data, headers, filename;

    switch (activeTab) {
      case 'livelihood':
        data = fisherfolkData;
        headers = ['RSBSA NUMBER', 'REGISTRATION NUMBER', 'REGISTRATION DATE', 'LASTNAME', 'FIRSTNAME', 'MIDDLE NAME', 'PROVINCE', 'CITY/MUNICIPALITY', 'BARANGAY'];
        filename = 'main-livelihood-report';
        break;
      case 'alternative':
        data = fisherfolkData;
        headers = ['RSBSA NUMBER', 'REGISTRATION NUMBER', 'REGISTRATION DATE', 'LASTNAME', 'FIRSTNAME', 'MIDDLE NAME', 'PROVINCE', 'CITY/MUNICIPALITY', 'BARANGAY'];
        filename = 'alternative-livelihood-report';
        break;
      case 'ageBracket':
        data = ageBracketData;
        headers = ['AGE BRACKET', 'COUNT', 'PERCENTAGE'];
        filename = 'age-bracket-report';
        break;
      case 'children':
        data = childrenData;
        headers = ['CHILDREN COUNT', 'FISHERFOLK COUNT', 'PERCENTAGE'];
        filename = 'children-report';
        break;
      case 'gender':
        data = genderData;
        headers = ['GENDER', 'COUNT', 'PERCENTAGE'];
        filename = 'gender-report';
        break;
      case 'income':
        data = incomeData;
        headers = ['INCOME RANGE', 'COUNT', 'PERCENTAGE'];
        filename = 'monthly-income-report';
        break;
      case 'totalFisherfolks':
        data = fisherfolkTotalData;
        headers = ['CATEGORY', 'COUNT'];
        filename = 'total-fisherfolks-report';
        break;
      case 'boats':
        data = boatsData;
        headers = ['BOAT NAME', 'OWNER', 'BOAT TYPE', 'REGISTRATION DATE', 'STATUS'];
        filename = 'boats-report';
        break;
      case 'gears':
        data = gearsData;
        headers = ['GEAR TYPE', 'OWNER', 'QUANTITY', 'CONDITION', 'REGISTRATION DATE'];
        filename = 'gears-report';
        break;
      case 'organizations':
        data = organizationData;
        headers = ['ORGANIZATION NAME', 'REGISTRATION DATE', 'MEMBERS', 'CATEGORY'];
        filename = 'organizations-report';
        break;
      case 'committee':
        data = committeeData;
        headers = ['COMMITTEE NAME', 'CHAIRMAN', 'MEMBERS', 'ORGANIZATION', 'DATE FORMED'];
        filename = 'committee-report';
        break;
      case 'officers':
        data = officersData;
        headers = ['OFFICER NAME', 'POSITION', 'ORGANIZATION', 'APPOINTMENT DATE'];
        filename = 'officers-report';
        break;
      default:
        return;
    }

    exportToCSV(data, headers, filename);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'livelihood':
        return (
          <table className="report-table">
            <thead>
              <tr>
                <th>RSBSA NUMBER</th>
                <th>REGISTRATION NUMBER</th>
                <th>REGISTRATION DATE</th>
                <th>LASTNAME</th>
                <th>FIRSTNAME</th>
                <th>MIDDLE NAME</th>
                <th>PROVINCE</th>
                <th>CITY/MUNICIPALITY</th>
                <th>BARANGAY</th>
              </tr>
            </thead>
            <tbody>
              {fisherfolkData.map((row) => (
                <tr key={row.id}>
                  <td>{row.rsbsaNumber}</td>
                  <td>{row.registrationNumber}</td>
                  <td>{row.registrationDate}</td>
                  <td>{row.lastName}</td>
                  <td>{row.firstName}</td>
                  <td>{row.middleName}</td>
                  <td>{row.province}</td>
                  <td>{row.cityMunicipality}</td>
                  <td>{row.barangay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'alternative':
        return (
          <table className="report-table">
            <thead>
              <tr>
                <th>RSBSA NUMBER</th>
                <th>REGISTRATION NUMBER</th>
                <th>REGISTRATION DATE</th>
                <th>LASTNAME</th>
                <th>FIRSTNAME</th>
                <th>MIDDLE NAME</th>
                <th>PROVINCE</th>
                <th>CITY/MUNICIPALITY</th>
                <th>BARANGAY</th>
              </tr>
            </thead>
            <tbody>
              {fisherfolkData.map((row) => (
                <tr key={row.id}>
                  <td>{row.rsbsaNumber}</td>
                  <td>{row.registrationNumber}</td>
                  <td>{row.registrationDate}</td>
                  <td>{row.lastName}</td>
                  <td>{row.firstName}</td>
                  <td>{row.middleName}</td>
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
            <thead>
              <tr>
                <th>AGE BRACKET</th>
                <th>COUNT</th>
                <th>PERCENTAGE</th>
              </tr>
            </thead>
            <tbody>
              {ageBracketData.map((row) => (
                <tr key={row.id}>
                  <td>{row.ageBracket}</td>
                  <td>{row.count}</td>
                  <td>{row.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'children':
        return (
          <table className="report-table">
            <thead>
              <tr>
                <th>CHILDREN COUNT</th>
                <th>FISHERFOLK COUNT</th>
                <th>PERCENTAGE</th>
              </tr>
            </thead>
            <tbody>
              {childrenData.map((row) => (
                <tr key={row.id}>
                  <td>{row.childrenCount}</td>
                  <td>{row.fisherfolkCount}</td>
                  <td>{row.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'gender':
        return (
          <table className="report-table">
            <thead>
              <tr>
                <th>GENDER</th>
                <th>COUNT</th>
                <th>PERCENTAGE</th>
              </tr>
            </thead>
            <tbody>
              {genderData.map((row) => (
                <tr key={row.id}>
                  <td>{row.gender}</td>
                  <td>{row.count}</td>
                  <td>{row.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'income':
        return (
          <table className="report-table">
            <thead>
              <tr>
                <th>INCOME RANGE</th>
                <th>COUNT</th>
                <th>PERCENTAGE</th>
              </tr>
            </thead>
            <tbody>
              {incomeData.map((row) => (
                <tr key={row.id}>
                  <td>{row.incomeRange}</td>
                  <td>{row.count}</td>
                  <td>{row.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'totalFisherfolks':
        return (
          <table className="report-table">
            <thead>
              <tr>
                <th>CATEGORY</th>
                <th>COUNT</th>
              </tr>
            </thead>
            <tbody>
              {fisherfolkTotalData.map((row) => (
                <tr key={row.id}>
                  <td>{row.category}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'boats':
        return (
          <table className="report-table">
            <thead>
              <tr>
                <th>BOAT NAME</th>
                <th>OWNER</th>
                <th>BOAT TYPE</th>
                <th>REGISTRATION DATE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {boatsData.map((row) => (
                <tr key={row.id}>
                  <td>{row.boatName}</td>
                  <td>{row.owner}</td>
                  <td>{row.boatType}</td>
                  <td>{row.registrationDate}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'gears':
        return (
          <table className="report-table">
            <thead>
              <tr>
                <th>GEAR TYPE</th>
                <th>OWNER</th>
                <th>QUANTITY</th>
                <th>CONDITION</th>
                <th>REGISTRATION DATE</th>
              </tr>
            </thead>
            <tbody>
              {gearsData.map((row) => (
                <tr key={row.id}>
                  <td>{row.gearType}</td>
                  <td>{row.owner}</td>
                  <td>{row.quantity}</td>
                  <td>{row.condition}</td>
                  <td>{row.registrationDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'organizations':
        return (
          <table className="report-table">
            <thead>
              <tr>
                <th>ORGANIZATION NAME</th>
                <th>REGISTRATION DATE</th>
                <th>MEMBERS</th>
                <th>CATEGORY</th>
              </tr>
            </thead>
            <tbody>
              {organizationData.map((row) => (
                <tr key={row.id}>
                  <td>{row.orgName}</td>
                  <td>{row.registrationDate}</td>
                  <td>{row.members}</td>
                  <td>{row.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'committee':
        return (
          <table className="report-table">
            <thead>
              <tr>
                <th>COMMITTEE NAME</th>
                <th>CHAIRMAN</th>
                <th>MEMBERS</th>
                <th>ORGANIZATION</th>
                <th>DATE FORMED</th>
              </tr>
            </thead>
            <tbody>
              {committeeData.map((row) => (
                <tr key={row.id}>
                  <td>{row.committeeName}</td>
                  <td>{row.chairman}</td>
                  <td>{row.members}</td>
                  <td>{row.organization}</td>
                  <td>{row.dateFormed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'officers':
        return (
          <table className="report-table">
            <thead>
              <tr>
                <th>OFFICER NAME</th>
                <th>POSITION</th>
                <th>ORGANIZATION</th>
                <th>APPOINTMENT DATE</th>
              </tr>
            </thead>
            <tbody>
              {officersData.map((row) => (
                <tr key={row.id}>
                  <td>{row.officerName}</td>
                  <td>{row.position}</td>
                  <td>{row.organization}</td>
                  <td>{row.appointmentDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
      <div className="main-content">
        <Header title="REPORT" user={user} />
        <div className="content-area report-container">
          <div className="report-table-section">
            {/* Tabs in Table Header */}
            <div className="report-tabs-header">
              <div className="report-tabs">
                <button
                  className={`report-tab ${activeTab === 'livelihood' ? 'active' : ''}`}
                  onClick={() => setActiveTab('livelihood')}
                >
                  Main Livelihood
                </button>
                <button
                  className={`report-tab ${activeTab === 'alternative' ? 'active' : ''}`}
                  onClick={() => setActiveTab('alternative')}
                >
                  Alternative Livelihood
                </button>
                <button
                  className={`report-tab ${activeTab === 'ageBracket' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ageBracket')}
                >
                  Age Bracket
                </button>
                <button
                  className={`report-tab ${activeTab === 'children' ? 'active' : ''}`}
                  onClick={() => setActiveTab('children')}
                >
                  Children
                </button>
                <button
                  className={`report-tab ${activeTab === 'gender' ? 'active' : ''}`}
                  onClick={() => setActiveTab('gender')}
                >
                  Gender
                </button>
                <button
                  className={`report-tab ${activeTab === 'income' ? 'active' : ''}`}
                  onClick={() => setActiveTab('income')}
                >
                  Monthly Income
                </button>
                <button
                  className={`report-tab ${activeTab === 'totalFisherfolks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('totalFisherfolks')}
                >
                  Total Fisherfolks
                </button>
                <button
                  className={`report-tab ${activeTab === 'boats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('boats')}
                >
                  Boats
                </button>
                <button
                  className={`report-tab ${activeTab === 'gears' ? 'active' : ''}`}
                  onClick={() => setActiveTab('gears')}
                >
                  Gears
                </button>
                <button
                  className={`report-tab ${activeTab === 'organizations' ? 'active' : ''}`}
                  onClick={() => setActiveTab('organizations')}
                >
                  Organizations
                </button>
                <button
                  className={`report-tab ${activeTab === 'committee' ? 'active' : ''}`}
                  onClick={() => setActiveTab('committee')}
                >
                  Committee
                </button>
                <button
                  className={`report-tab ${activeTab === 'officers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('officers')}
                >
                  Officers
                </button>
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
                    <button className="search-btn">Search</button>
                    <button className="reset-btn">Reset</button>
                  </>
                )}
                <button className="export-btn" onClick={handleExport}>
                  ⬇ Export as CSV
                </button>
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
