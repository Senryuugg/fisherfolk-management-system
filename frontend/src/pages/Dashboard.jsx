'use client';

import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { reportsAPI, organizationAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import '../styles/Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [organizationCount, setOrganizationCount] = useState(0);

  if (!user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      console.log('[v0] Fetching dashboard data...');
      const [statsResponse, orgResponse] = await Promise.all([
        reportsAPI.getDashboardStats(),
        organizationAPI.getAll(),
      ]);
      
      console.log('[v0] Dashboard stats:', statsResponse.data);
      console.log('[v0] Organizations:', orgResponse.data);
      
      setDashboardData(statsResponse.data);
      setOrganizationCount(orgResponse.data.length);
    } catch (error) {
      console.error('[v0] Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading || !dashboardData) {
    return (
      <div className="dashboard-container">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
        <div className="main-content">
          <Header title="DASHBOARD" user={user} />
          <div className="content-area">
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Extract data from API response
  const totalFisherfolk = dashboardData.fisherfolk.total[0]?.count || 0;
  const totalBoats = dashboardData.boats.total[0]?.count || 0;
  const totalGears = dashboardData.gears.total[0]?.count || 0;
  
  // Province distribution for charts
  const provinceData = dashboardData.fisherfolk.byProvince || [];
  const topProvinces = provinceData.slice(0, 6);
  
  // Livelihood distribution
  const livelihoodData = dashboardData.fisherfolk.byLivelihood || [];
  
  // Boats by year
  const boatsByYear = dashboardData.boats.byYear || [];
  
  // Gear types
  const gearTypes = dashboardData.gears.byType || [];
  const topGearTypes = gearTypes.slice(0, 6);

  // Livelihood Distribution Data
  const livelihoodChartData = {
    labels: livelihoodData.map(item => item._id || 'Unknown'),
    datasets: [
      {
        label: 'Fisherfolk by Livelihood',
        data: livelihoodData.map(item => item.count),
        backgroundColor: ['#4A9EFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        borderWidth: 0,
      },
    ],
  };

  // Fisherfolk by Province Data
  const provinceChartData = {
    labels: topProvinces.map(item => item._id || 'Unknown'),
    datasets: [
      {
        label: 'Fisherfolk Count',
        data: topProvinces.map(item => item.count),
        backgroundColor: '#4A9EFF',
        borderRadius: 6,
      },
    ],
  };

  // Status Distribution
  const statusData = dashboardData.fisherfolk.byStatus || [];
  const activeCount = statusData.find(s => s._id === 'active')?.count || 0;
  const inactiveCount = statusData.find(s => s._id === 'inactive')?.count || 0;
  
  const statusChartData = {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        label: 'Fisherfolk Status',
        data: [activeCount, inactiveCount],
        backgroundColor: ['#10B981', '#94A3B8'],
        borderWidth: 0,
      },
    ],
  };

  // Gear Types Data
  const gearTypesChartData = {
    labels: topGearTypes.map(item => item._id || 'Unknown'),
    datasets: [
      {
        label: 'Gear Count',
        data: topGearTypes.map(item => item.count),
        backgroundColor: '#10B981',
        borderRadius: 6,
      },
    ],
  };

  // Boats Registered Per Year
  const boatsPerYearData = {
    labels: boatsByYear.map(item => item._id?.toString() || 'Unknown'),
    datasets: [
      {
        label: 'Boats Registered',
        data: boatsByYear.map(item => item.count),
        borderColor: '#4A9EFF',
        backgroundColor: 'rgba(74, 158, 255, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: '#4A9EFF',
      },
    ],
  };

  // Fisherfolk Registration Per Year
  const fisherfolkByYear = dashboardData.fisherfolk.byYear || [];
  const fisherfolkPerYearData = {
    labels: fisherfolkByYear.map(item => item._id?.toString() || 'Unknown'),
    datasets: [
      {
        label: 'Fisherfolk Registered',
        data: fisherfolkByYear.map(item => item.count),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: '#10B981',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 12,
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
      <div className="main-content">
        <Header title="DASHBOARD" user={user} />
        <div className="content-area">
          <div className="stat-cards-row">
            <div className="stat-card">
              <div className="stat-card-border"></div>
              <div className="stat-card-content">
                <h3>Total No. of Registered Fisherfolk</h3>
                <p className="stat-number">{totalFisherfolk.toLocaleString()}</p>
                <small>{activeCount} active, {inactiveCount} inactive</small>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-border"></div>
              <div className="stat-card-content">
                <h3>Total No. of C/MFARMCs established</h3>
                <p className="stat-number">{totalBoats.toLocaleString()}</p>
                <small>Across all regions</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-border"></div>
              <div className="stat-card-content">
                <h3>Total No. of Registered Fisherfolk Organizations/ Cooperative</h3>
                <p className="stat-number">{organizationCount.toLocaleString()}</p>
                <small>Increase this month</small>
              </div>
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-container">
              <h4>Livelihood Distribution</h4>
              <div className="chart-wrapper">
                <Doughnut data={livelihoodChartData} options={doughnutOptions} />
              </div>
            </div>
            <div className="chart-container">
              <h4>Fisherfolk by Province (Top 6)</h4>
              <div className="chart-wrapper">
                <Bar data={provinceChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-container">
              <h4>Status Distribution</h4>
              <div className="chart-wrapper">
                <Doughnut data={statusChartData} options={doughnutOptions} />
              </div>
            </div>
            <div className="chart-container">
              <h4>Fishing Gear Types (Top 6)</h4>
              <div className="chart-wrapper">
                <Bar data={gearTypesChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-container">
              <h4>Boats Registered Per Year</h4>
              <div className="chart-wrapper">
                <Line data={boatsPerYearData} options={chartOptions} />
              </div>
            </div>
            <div className="chart-container">
              <h4>Fisherfolk Registered Per Year</h4>
              <div className="chart-wrapper">
                <Line data={fisherfolkPerYearData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
