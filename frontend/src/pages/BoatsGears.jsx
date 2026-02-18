'use client';

import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { canCreate } from '../utils/permissions';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/BoatsGears.css';

export default function BoatsGears() {
  const { user, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('boats-gears');
  const [activeTab, setActiveTab] = useState('boats');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTab, setModalTab] = useState('boats');
  const [formData, setFormData] = useState({
    boatName: '',
    mfbrNo: '',
    fisherfolkName: '',
    boatType: '',
    engineType: '',
    grossTonnage: '',
    netTonnage: '',
    registrationDate: '',
    homePort: '',
    province: '',
    cityMunicipality: '',
    barangay: '',
    status: 'active',
    gearType: '',
    gearClassification: '',
    quantity: '',
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });
  const [boatsData, setBoatsData] = useState([
    {
      id: 1,
      frsNo: '',
      mfbrNo: 'i26-1339130000-004',
      fisherfolkName: 'PABIE MANAHON',
      boatName: 'Boat 1',
      address: 'NCR, City of Manila, First District',
      registrationDate: '01/23/2026',
      status: 'Active',
    },
    {
      id: 2,
      frsNo: '',
      mfbrNo: 'i26-1339130000-005',
      fisherfolkName: 'JOMAR CABAGUE',
      boatName: 'Boat 2',
      address: 'NCR, City of Manila, First District',
      registrationDate: '01/23/2026',
      status: 'Active',
    },
  ]);
  const [gearsData, setGearsData] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ search: '', status: '' });
  };

  // Filter boats data based on search inputs
  const filteredBoats = boatsData.filter((boat) => {
    const searchLower = filters.search.toLowerCase();
    const matchesMfbr = boat.mfbrNo.toLowerCase().includes(searchLower);
    const matchesName = boat.fisherfolkName.toLowerCase().includes(searchLower);
    const matchesBoatName = boat.boatName.toLowerCase().includes(searchLower);
    const matchesSearch = matchesMfbr || matchesName || matchesBoatName;
    return matchesSearch;
  });

  // Filter gears data based on search inputs
  const filteredGears = gearsData.filter((gear) => {
    const searchLower = filters.search.toLowerCase();
    const matchesName = gear.fisherfolkName.toLowerCase().includes(searchLower);
    const matchesType = gear.gearType.toLowerCase().includes(searchLower);
    return matchesName || matchesType;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalTab === 'boats') {
      if (!formData.mfbrNo || !formData.fisherfolkName || !formData.boatName) {
        alert('Please fill in all required fields');
        return;
      }
      const newBoat = {
        id: boatsData.length + 1,
        frsNo: '',
        mfbrNo: formData.mfbrNo,
        fisherfolkName: formData.fisherfolkName,
        boatName: formData.boatName,
        address: `${formData.barangay}, ${formData.cityMunicipality}, ${formData.province}`,
        registrationDate: formData.registrationDate || new Date().toLocaleDateString(),
        status: formData.status === 'active' ? 'Active' : 'Inactive',
      };
      setBoatsData([...boatsData, newBoat]);
    } else if (modalTab === 'gears') {
      if (!formData.gearType || !formData.fisherfolkName) {
        alert('Please fill in all required fields');
        return;
      }
      const newGear = {
        id: gearsData.length + 1,
        frsNo: '',
        mfbrNo: formData.mfbrNo,
        fisherfolkName: formData.fisherfolkName,
        gearType: formData.gearType,
        quantity: formData.quantity || 0,
        registrationDate: formData.registrationDate || new Date().toLocaleDateString(),
        status: formData.status === 'active' ? 'Active' : 'Inactive',
      };
      setGearsData([...gearsData, newGear]);
    }

    // Reset form and close modal
    setFormData({
      boatName: '',
      mfbrNo: '',
      fisherfolkName: '',
      boatType: '',
      engineType: '',
      grossTonnage: '',
      netTonnage: '',
      registrationDate: '',
      homePort: '',
      province: '',
      cityMunicipality: '',
      barangay: '',
      status: 'active',
      gearType: '',
      gearClassification: '',
      quantity: '',
    });
    setShowAddModal(false);
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
      <div className="main-content">
        <Header title="LIST OF REGISTERED BOATS AND GEARS" user={user} />
        <div className="content-area boats-gears-container">
          <div className="bg-tabs-section">
            {/* Tabs in Table Header */}
            <div className="bg-tabs-header">
              <div className="bg-tabs">
                <button
                  className={`bg-tab ${activeTab === 'boats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('boats')}
                >
                  Registered Boats
                </button>
                <button
                  className={`bg-tab ${activeTab === 'gears' ? 'active' : ''}`}
                  onClick={() => setActiveTab('gears')}
                >
                  Registered Gears
                </button>
              </div>
            </div>

            {activeTab === 'boats' && (
            <div className="tab-content">
              <div className="table-header">
                <h3>List of Registered Boats:</h3>
                {canCreate(user) && (
                  <button className="add-btn" onClick={() => { setModalTab('boats'); setShowAddModal(true); }}>
                    + Add Boats/Gears
                  </button>
                )}
              </div>

              <div className="table-controls">
                <div className="items-per-page">
                  <label>Show:</label>
                  <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={40}>40</option>
                    <option value={50}>50</option>
                  </select>
                  <span>items per page</span>
                </div>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>FRS No.</th>
                      <th>MFBR No.</th>
                      <th>Name of Fisherfolk</th>
                      <th>Address</th>
                      <th>Boat Name</th>
                      <th>Date of Registration</th>
                      <th>Status</th>
                    </tr>
                    <tr className="filter-row">
                      <td></td>
                      <td></td>
                      <td><input type="text" placeholder="Search name" className="filter-input" value={filters.search} onChange={handleFilterChange} name="search" /></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td><select className="filter-select" value={filters.status} onChange={handleFilterChange} name="status"><option value="">Select one</option><option value="active">Active</option><option value="inactive">Inactive</option></select></td>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBoats.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-cell">
                          No boats found
                        </td>
                      </tr>
                    ) : (
                      filteredBoats.map((boat) => (
                        <tr key={boat.id}>
                          <td>{boat.frsNo || '-'}</td>
                          <td>{boat.mfbrNo}</td>
                          <td>{boat.fisherfolkName}</td>
                          <td>{boat.boatName}</td>
                          <td>{boat.address}</td>
                          <td>{boat.registrationDate}</td>
                          <td>
                            <span className="status-badge active">{boat.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'gears' && (
            <div className="tab-content">
              <div className="table-header">
                <h3>List of Registered Gears:</h3>
                {canCreate(user) && (
                  <button className="add-btn" onClick={() => { setModalTab('gears'); setShowAddModal(true); }}>
                    + Add Boats/Gears
                  </button>
                )}
              </div>
              <div className="table-controls">
                <div className="items-per-page">
                  <label>Show:</label>
                  <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={40}>40</option>
                    <option value={50}>50</option>
                  </select>
                  <span>items per page</span>
                </div>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>FR No.</th>
                      <th>Name of Fisherfolk</th>
                      <th>Gear Classification</th>
                      <th>Date Registered</th>
                    </tr>
                    <tr className="filter-row">
                      <td></td>
                      <td><input type="text" placeholder="Select one to search name" className="filter-input" value={filters.search} onChange={handleFilterChange} name="search" /></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGears.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="empty-cell">
                          {gearsData.length === 0 ? 'No gears registered yet' : 'No results found'}
                        </td>
                      </tr>
                    ) : (
                      filteredGears.map((gear) => (
                        <tr key={gear.id}>
                          <td>{gear.frsNo || '-'}</td>
                          <td>{gear.fisherfolkName}</td>
                          <td>{gear.gearType}</td>
                          <td>{gear.registrationDate}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Add Boats / Gears</h2>
                  <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                    &times;
                  </button>
                </div>
                <div className="modal-tabs">
                  <button
                    className={`modal-tab-btn ${modalTab === 'boats' ? 'active' : ''}`}
                    onClick={() => setModalTab('boats')}
                  >
                    Boats
                  </button>
                  <button
                    className={`modal-tab-btn ${modalTab === 'gears' ? 'active' : ''}`}
                    onClick={() => setModalTab('gears')}
                  >
                    Gears
                  </button>
                </div>

                {modalTab === 'boats' && (
                  <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>MFBR No. *</label>
                        <input
                          type="text"
                          required
                          value={formData.mfbrNo}
                          onChange={(e) => setFormData({ ...formData, mfbrNo: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>FRS No.</label>
                        <input
                          type="text"
                          value={formData.frsNo}
                          onChange={(e) => setFormData({ ...formData, frsNo: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Name of Fisherfolk *</label>
                        <input
                          type="text"
                          required
                          value={formData.fisherfolkName}
                          onChange={(e) => setFormData({ ...formData, fisherfolkName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Boat Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.boatName}
                          onChange={(e) => setFormData({ ...formData, boatName: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Boat Type</label>
                        <select
                          value={formData.boatType}
                          onChange={(e) => setFormData({ ...formData, boatType: e.target.value })}
                        >
                          <option value="">Select Type</option>
                          <option value="motorized">Motorized</option>
                          <option value="non-motorized">Non-Motorized</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Engine Type</label>
                        <input
                          type="text"
                          value={formData.engineType}
                          onChange={(e) => setFormData({ ...formData, engineType: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Gross Tonnage</label>
                        <input
                          type="text"
                          value={formData.grossTonnage}
                          onChange={(e) => setFormData({ ...formData, grossTonnage: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Net Tonnage</label>
                        <input
                          type="text"
                          value={formData.netTonnage}
                          onChange={(e) => setFormData({ ...formData, netTonnage: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Home Port</label>
                        <input
                          type="text"
                          value={formData.homePort}
                          onChange={(e) => setFormData({ ...formData, homePort: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Province</label>
                        <input
                          type="text"
                          value={formData.province}
                          onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>City/Municipality</label>
                        <input
                          type="text"
                          value={formData.cityMunicipality}
                          onChange={(e) => setFormData({ ...formData, cityMunicipality: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Barangay</label>
                        <input
                          type="text"
                          value={formData.barangay}
                          onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Registration Date</label>
                        <input
                          type="date"
                          value={formData.registrationDate}
                          onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="modal-buttons">
                      <button type="submit" className="save-btn">Save</button>
                      <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                    </div>
                  </form>
                )}

                {modalTab === 'gears' && (
                  <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>FRS No.</label>
                        <input
                          type="text"
                          value={formData.frsNo}
                          onChange={(e) => setFormData({ ...formData, frsNo: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Gear Type *</label>
                        <input
                          type="text"
                          required
                          value={formData.gearType}
                          onChange={(e) => setFormData({ ...formData, gearType: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Gear Classification</label>
                        <select
                          value={formData.gearClassification}
                          onChange={(e) => setFormData({ ...formData, gearClassification: e.target.value })}
                        >
                          <option value="">Select Classification</option>
                          <option value="hook-and-line">Hook and Line</option>
                          <option value="gill-net">Gill Net</option>
                          <option value="seine-net">Seine Net</option>
                          <option value="pot-trap">Pot/Trap</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Quantity</label>
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Name of Fisherfolk *</label>
                        <input
                          type="text"
                          required
                          value={formData.fisherfolkName}
                          onChange={(e) => setFormData({ ...formData, fisherfolkName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Registration Date</label>
                        <input
                          type="date"
                          value={formData.registrationDate}
                          onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="modal-buttons">
                      <button type="submit" className="save-btn">Save</button>
                      <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
