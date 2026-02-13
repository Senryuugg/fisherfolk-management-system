'use client';

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Gender Distribution Data
  const genderData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        label: 'Fisherfolk by Gender',
        data: [1245, 657],
        backgroundColor: ['#4A9EFF', '#FF6B9D'],
        borderWidth: 0,
      },
    ],
  };

  // Age Bracket Data
  const ageBracketData = {
    labels: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
    datasets: [
      {
        label: 'Fisherfolk Count',
        data: [234, 456, 589, 387, 189, 47],
        backgroundColor: '#4A9EFF',
        borderRadius: 6,
      },
    ],
  };

  // Children Data (Number of children per household)
  const childrenData = {
    labels: ['0', '1-2', '3-4', '5+'],
    datasets: [
      {
        label: 'Households',
        data: [123, 678, 456, 189],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        borderWidth: 0,
      },
    ],
  };

  // Monthly Income Data
  const monthlyIncomeData = {
    labels: ['Below 5k', '5k-10k', '10k-15k', '15k-20k', 'Above 20k'],
    datasets: [
      {
        label: 'Fisherfolk Count',
        data: [234, 567, 489, 345, 267],
        backgroundColor: '#10B981',
        borderRadius: 6,
      },
    ],
  };

  // Boats Registered Per Year
  const boatsPerYearData = {
    labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'Boats Registered',
        data: [145, 178, 210, 234, 267, 289],
        borderColor: '#4A9EFF',
        backgroundColor: 'rgba(74, 158, 255, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: '#4A9EFF',
      },
    ],
  };

  // Fishing Gear Types Per Province
  const fishingGearData = {
    labels: ['Manila', 'Caloocan', 'Quezon City', 'Pasay', 'Navotas', 'Malabon'],
    datasets: [
      {
        label: 'Hook & Line',
        data: [120, 85, 95, 67, 145, 98],
        backgroundColor: '#4A9EFF',
      },
      {
        label: 'Gill Net',
        data: [89, 67, 78, 56, 123, 89],
        backgroundColor: '#10B981',
      },
      {
        label: 'Fish Trap',
        data: [45, 34, 56, 23, 78, 56],
        backgroundColor: '#F59E0B',
      },
    ],
  };

  // Boat Types Per Province (Motorized vs Non-Motorized)
  const boatTypesData = {
    labels: ['Manila', 'Caloocan', 'Quezon City', 'Pasay', 'Navotas', 'Malabon'],
    datasets: [
      {
        label: 'Motorized',
        data: [178, 134, 156, 98, 234, 167],
        backgroundColor: '#4A9EFF',
      },
      {
        label: 'Non-Motorized',
        data: [89, 67, 78, 45, 123, 89],
        backgroundColor: '#94A3B8',
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
                <p className="stat-number">1,902</p>
                <small>4.2 increase from last week</small>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-border"></div>
              <div className="stat-card-content">
                <h3>Total No. of C/MFARMCs established</h3>
                <p className="stat-number">45</p>
                <small>Across all regions</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-border"></div>
              <div className="stat-card-content">
                <h3>Total No. of Registered Fisherfolk Organizations/ Cooperative</h3>
                <p className="stat-number">823</p>
                <small>Increase this month</small>
              </div>
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-container">
              <h4>Gender Distribution</h4>
              <div className="chart-wrapper">
                <Doughnut data={genderData} options={doughnutOptions} />
              </div>
            </div>
            <div className="chart-container">
              <h4>Age Bracket Distribution</h4>
              <div className="chart-wrapper">
                <Bar data={ageBracketData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-container">
              <h4>Number of Children per Household</h4>
              <div className="chart-wrapper">
                <Doughnut data={childrenData} options={doughnutOptions} />
              </div>
            </div>
            <div className="chart-container">
              <h4>Monthly Income Distribution</h4>
              <div className="chart-wrapper">
                <Bar data={monthlyIncomeData} options={chartOptions} />
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
              <h4>Fishing Gear Types Per Province</h4>
              <div className="chart-wrapper">
                <Bar data={fishingGearData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="charts-row-single">
            <div className="chart-container">
              <h4>Boat Types Per Province (Motorized vs Non-Motorized)</h4>
              <div className="chart-wrapper">
                <Bar data={boatTypesData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
