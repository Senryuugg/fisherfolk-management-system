'use client';

import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/LevelsOfDevelopment.css';

// Each indicator has a label and an array of means-of-verification items
const levels = [
  {
    id: 1,
    title: 'Level I',
    subtitle: 'Basic Structure of FARMC',
    description:
      'Focuses on the initial organization, establishment, and foundational structure of the FARMC as per Fisheries Office Order No. 405, series of 2025.',
    color: '#e74c3c',
    lightColor: '#fdf2f2',
    indicators: [
      {
        label: 'A. FARMC organized in accordance with FAO 196',
        items: [
          'Notice of meeting or any LGU-issued document for fisherfolk consultation',
          'Registration and accreditation certificate of fisherfolk organization',
          'Minutes of the meeting',
          'Photo documentation of consultation',
          'Attendance sheet',
          'List of M/CFARMC officers and members',
          'Endorsement letter from the participating fisherfolk association, considering: (a) 1 year residency; (b) Proof of occupation (engaged in fishing/fish culture/processing); (c) Good moral character',
        ],
      },
      {
        label: 'B. Committees are formed',
        items: [
          'List of chairpersons and committee members, signed by the Local Chief Executive (LCE)',
        ],
      },
      {
        label: 'C. With Secretariat',
        items: [
          'List of names of the Secretariat',
          'Special Order issued by the LGU designating the FARMC Secretariat',
        ],
      },
      {
        label: 'D. With Internal Policy',
        items: [
          'Copy of the approved internal policy, stamped or received by the Sangguniang Bayan',
        ],
      },
      {
        label: 'E. Fisherfolk registry started',
        items: [
          'Updated number of registered fisherfolk, based on FishR and list of fisherfolk registry',
        ],
      },
      {
        label: 'F. With municipal/city fisheries profile',
        items: [
          'Copy of updated Municipal Fisheries Profile',
        ],
      },
      {
        label: 'G. Formulation of resolutions and proposed ordinances initiated',
        items: [
          'Copies of initiated resolutions and proposed ordinances',
          'Minutes of meetings',
          'Attendance sheets',
          'Photo documentation',
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Level II',
    subtitle: 'Basic Functions of FARMC',
    description:
      'Involves basic operations, such as participating in fisheries development planning, assisting with law enforcement, and establishing a physical FARMC office.',
    color: '#e67e22',
    lightColor: '#fdf5ec',
    indicators: [
      {
        label: 'A. Participation of FARMCs in the formulation of Municipal Fisheries Development Plan (MFDP)',
        items: [
          'Minutes of LGU activities reflecting the FARMC\'s participation in the formulation of MFDP',
          'Copy of the MFDP (in lieu of the MFDP, other similar documents may be considered)',
          'Photo documentation',
        ],
      },
      {
        label: 'B. Recommend Municipal/City Fisheries Ordinance',
        items: [
          'Copy of FARMC resolution recommending review, enactment, or amendment of the MFO as the case may be',
          'Minutes of the meeting, preferably with a secretary\'s certification',
        ],
      },
      {
        label: 'C. FARMC actively assists in fisheries law enforcement',
        items: [
          'Report list of activities undertaken (include relevant details such as number of apprehensions and cases filed in court)',
        ],
      },
      {
        label: 'D. Municipal/City FARMC office is established and operational',
        items: [
          'Photo of the M/CFARMC office',
          'Preferably with tenurial instrument or any other document certifying that a particular physical structure or space is being used for the operation of the council',
          'Photo documentation of activities in the office',
        ],
      },
      {
        label: 'E. Regular FARMC meetings are conducted with proper documentation',
        items: [
          'Minutes of the meeting, attendance sheet and photo documentation (indicating frequency, date and agenda) must be on file',
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Level III',
    subtitle: 'FARMC Fully Operational',
    description:
      'Assesses how effectively the FARMC integrates into local government processes, implements approved plans and ordinances, and strengthens partnerships.',
    color: '#d4ac0d',
    lightColor: '#fffde7',
    indicators: [
      {
        label: 'A. MFDP approved & implemented',
        items: [
          'Copy of the approved MFDP or other similar documents',
          'Proof of publication indicating the law has taken effect',
          'Proof of implementation (e.g., record of apprehension; issuance of auxiliary invoice — absence of apprehension does not mean the law is not implemented)',
          'Copies of policies or resolutions recommended by the FARMCs that were implemented by the LGUs',
        ],
      },
      {
        label: 'B. MFO/Policies implemented by LGU',
        items: [
          'Reports, minutes of meeting and activity documentation showing that the M/CFARMC was consulted by the SB/SP, including a list of issues discussed and resolved',
          'FARMC resolutions endorsing local policies',
        ],
      },
      {
        label: 'C. Recognized as an advisory body of the Sangguniang Bayan/Panlungsod',
        items: [
          'Reports, minutes of meeting and activity documentation showing that the M/CFARMC was consulted by the SB/SP',
          'FARMC resolutions endorsing local policies',
        ],
      },
      {
        label: 'D. Partnership with LGU established (Matatag na Balikatan)',
        items: [
          'Documentation of partnership efforts, such as FARMC assistance in LGU fisheries project implementation',
          'Documents indicating that the LGU consulted the FARMC such as: (a) Memorandum of Understanding (MOU); (b) Memorandum of Agreement (MOA)',
        ],
      },
      {
        label: 'E. Working committees active & performing',
        items: [
          'Accomplishment report per committee',
          'Minutes of the meeting of each committee',
          'Photo documentation',
          'Project proposal',
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'Level IV',
    subtitle: 'Sustainability Mechanisms',
    description:
      'Establishes solid, sustainable mechanisms including a functional database system, financial capability, independent reorganization, and active networking.',
    color: '#27ae60',
    lightColor: '#f0fdf4',
    indicators: [
      {
        label: 'A. Adoption and application of Databank/Database system established and accessible',
        items: [
          'Certificate of training on FARMC Database System',
          'FARMC Database System installed and operational in the FARMC Office',
        ],
      },
      {
        label: 'B. Established financial capability and fund sourcing ability',
        items: [
          'Inclusion of M/CFARMC operations in the Annual Investment Plan, supported by a certificate of disbursement signed by the municipal/city accountant or budget officer',
          'Copies of approved proposals or other supporting documents attesting to fund release for FARMC initiatives',
          'LGU-issued resolution confirming budget allocation for FARMC operations',
        ],
      },
      {
        label: 'C. Capable of reorganization following process based on the internal policy',
        items: [
          'Copy of minutes documenting the reorganization process',
          'List of new FARMC officers',
          'Documentation of initiatives highlighting the council as an independent body',
        ],
      },
      {
        label: 'D. Ability to access sufficient support',
        items: [
          'Documentation highlighting initiatives done and proof of support acquired to implement their own initiatives',
        ],
      },
      {
        label: 'E. Programs/Activities/Projects are sustained',
        items: [
          'Documentation and interventions showing sustained implementation of activities',
          'FARMC accomplishment report',
          'Monitoring and Evaluation (M&E)',
        ],
      },
      {
        label: 'F. Established partnership arrangement & networking',
        items: [
          'Memorandum of Agreement (MOA)',
          'Memorandum of Understanding (MOU)',
          'Pledge of Commitment',
        ],
      },
    ],
  },
  {
    id: 5,
    title: 'Level V',
    subtitle: 'Model of Excellence',
    description:
      'The highest level — the FARMC is recognized as a strong community partner, has received awards, and actively shares its success stories to inspire other councils.',
    color: '#2980b9',
    lightColor: '#eff6ff',
    indicators: [
      {
        label: 'A. The FARMC is recognized by the LGU and community as a strong and dynamic partner in the management of municipal waters',
        items: [
          'Reports, documentation, or communications recognizing the M/CFARMC\'s involvement in governing bodies, fora, assemblies, dialogues, and related activities',
        ],
      },
      {
        label: 'B. Awards and citations/recognition for exemplary performance received by the FARMC',
        items: [
          'Plaques/Certificates/cheques for the awards received',
          'Cash incentives, trophies',
          'Certificate of merits/recognitions/appreciations received by the M/CFARMC',
        ],
      },
      {
        label: 'C. Success stories showcasing FARMC Impact',
        items: [
          'Copies of IEC materials (e.g., published narratives, audiovisual content, newsletter features, radio or TV segments) that document FARMC success stories',
          'Printed brochures, handouts, or publications highlighting outcomes or innovations led by the M/CFARMC',
        ],
      },
    ],
  },
];

export default function LevelsOfDevelopment() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('levels');
  const [selectedLevel, setSelectedLevel] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openLevel = (level) => {
    setSelectedLevel(level);
  };

  const closeModal = () => {
    setSelectedLevel(null);
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
      <div className="main-content">
        <Header title="LEVELS OF DEVELOPMENT" user={user} />
        <div className="content-area levels-container">
          <div className="levels-intro">
            <h2>Fisheries and Aquatic Resource Management Councils</h2>
            <p>
              (FARMCs) in the Philippines are classified into 5 levels of development by the Bureau
              of Fisheries and Aquatic Resources (BFAR) to measure their functionality in managing
              local waters. These levels, ranging from basic organization to fully functional, help
              guide fisherfolk councils in becoming effective partners in fisheries management,
              conservation, and policy.
            </p>
            <p className="levels-click-hint">
              Click on any level to view its means of verification.
            </p>

            <h3>FARMC Levels of Development (as per BFAR criteria):</h3>

            <div className="levels-list">
              {levels.map((level) => (
                <button
                  key={level.id}
                  className="level-list-item"
                  style={{ borderLeft: `5px solid ${level.color}` }}
                  onClick={() => openLevel(level)}
                  aria-label={`View means of verification for ${level.title}: ${level.subtitle}`}
                >
                  <span className="level-list-number" style={{ backgroundColor: level.color }}>
                    {level.id}
                  </span>
                  <div className="level-list-body">
                    <div className="level-list-titles">
                      <span className="level-list-title" style={{ color: level.color }}>{level.title}</span>
                      <span className="level-list-subtitle">{level.subtitle}</span>
                    </div>
                    <p className="level-list-description">{level.description}</p>
                  </div>
                  <span className="level-list-arrow" style={{ color: level.color }}>&#8250;</span>
                </button>
              ))}
            </div>

            <div className="reference-section">
              <p>
                For a complete reference, the Bureau of Fisheries and Aquatic Resources (BFAR)
                provides a full documentation guide on the five levels of development of Fisheries
                and Aquatic Resource Management Councils (FARMCs), available for download in this{' '}
                <a href="/files/FARMC-Levels-of-Development.pdf" className="download-link">
                  FARMC Levels of Development
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Level Detail Modal */}
      {selectedLevel && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content level-modal" onClick={(e) => e.stopPropagation()}>
            <div
              className="level-modal-header"
              style={{ borderBottom: `3px solid ${selectedLevel.color}`, backgroundColor: selectedLevel.lightColor }}
            >
              <div className="level-modal-title">
                <span
                  className="level-number level-number-lg"
                  style={{ backgroundColor: selectedLevel.color }}
                >
                  {selectedLevel.id}
                </span>
                <div>
                  <h2 style={{ color: selectedLevel.color }}>{selectedLevel.title}</h2>
                  <p className="level-subtitle-lg">{selectedLevel.subtitle}</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={closeModal} aria-label="Close">
                &times;
              </button>
            </div>

            <div className="level-modal-body">
              <p className="level-modal-description">{selectedLevel.description}</p>

              <div className="mov-section">
                <h3>Means of Verification (MoV)</h3>
                <div className="mov-indicators">
                  {selectedLevel.indicators.map((indicator, i) => (
                    <div key={i} className="mov-indicator-group">
                      <p className="mov-indicator-label">{indicator.label}</p>
                      <ul className="mov-list">
                        {indicator.items.map((item, j) => (
                          <li key={j} className="mov-item">
                            <span className="mov-check" style={{ color: selectedLevel.color }}>&#10003;</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="level-modal-footer">
              <button className="cancel-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
