'use client';

import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/FAQs.css';

export default function FAQs() {
  const { user, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('faqs');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'How do I add a new fisherfolk to the list?',
      answer:
        'To add a new fisherfolk, navigate to the Fisherfolk List page, click the "Add Fisherfolk" button, fill in the required information including RSBSA number, name, and location details, then save.',
    },
    {
      id: 2,
      question: 'I forgot my password. What should I do?',
      answer:
        'If you forgot your password, contact the Help Desk at the central office or regional office. They can help you reset your password. You can find contact details in the Help Desk section.',
    },
    {
      id: 3,
      question: 'Why is the Map not showing any data?',
      answer:
        'The Map feature requires proper geolocation data to be entered for fisherfolk records. Ensure that province, city, and barangay information is complete. You may also need to refresh the page.',
    },
    {
      id: 4,
      question: 'How can I download a report?',
      answer:
        'Go to the Report section, filter the data as needed, and use the export button to download the report in your preferred format (PDF or Excel).',
    },
    {
      id: 5,
      question: 'Who do I call for technical bugs?',
      answer:
        'For technical issues, contact the BFAR Help Desk. You can call the central office hotline at (632) 920-5500 or visit the Help Desk section for more contact information.',
    },
  ];

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
      <div className="main-content">
        <Header title="Frequently Asked Questions" user={user} />
        <div className="content-area faq-container">
          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className={`faq-item ${expandedFAQ === faq.id ? 'expanded' : ''}`}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <span className="faq-icon">
                      {expandedFAQ === faq.id ? '−' : '+'}
                    </span>
                    <span className="question-text">{faq.question}</span>
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="faq-answer">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="faq-contact">
            <h3>Still need help?</h3>
            <p>
              If you couldn't find the answer to your question, please visit the Help Desk or contact us directly:
            </p>
            <ul>
              <li>📞 Hotline: (632) 920-5500</li>
              <li>📧 Email: bfar@da.gov.ph</li>
              <li>🕐 Hours: Monday - Friday, 8:00 AM - 5:00 PM</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
