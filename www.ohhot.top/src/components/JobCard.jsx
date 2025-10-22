import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatNumber } from '../utils/helpers';
import { JOB_TYPE_LABELS, EXPERIENCE_LABELS, EDUCATION_LABELS } from '../constants';
import './JobCard.css';

const JobCard = ({ job, showActions = true, onFavorite, onApply }) => {
  const {
    id,
    title,
    company,
    salary,
    location,
    jobType,
    experience,
    education,
    benefits = [],
    createdAt,
    isFavorite = false,
    isApplied = false
  } = job;

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(id, !isFavorite);
  };

  const handleApply = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onApply?.(id);
  };

  return (
    <div className="job-card">
      <Link to={`/jobs/${id}`} className="job-card-link">
        <div className="job-card-header">
          <div className="company-info">
            {company?.logo && (
              <img src={company.logo} alt={company.name} className="company-logo" />
            )}
            <div className="company-details">
              <h3 className="job-title">{title}</h3>
              <p className="company-name">{company?.name}</p>
            </div>
          </div>
          
          {showActions && (
            <div className="job-actions">
              <button 
                className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
                onClick={handleFavorite}
                title={isFavorite ? '取消收藏' : '收藏职位'}
              >
                ♥
              </button>
            </div>
          )}
        </div>

        <div className="job-card-body">
          <div className="salary-location">
            <span className="salary">{salary || '面议'}</span>
            <span className="location">{location}</span>
          </div>

          <div className="job-meta">
            <span className="job-type">{JOB_TYPE_LABELS[jobType] || jobType}</span>
            <span className="experience">{EXPERIENCE_LABELS[experience] || experience}</span>
            <span className="education">{EDUCATION_LABELS[education] || education}</span>
          </div>

          {benefits.length > 0 && (
            <div className="benefits">
              {benefits.slice(0, 3).map((benefit, index) => (
                <span key={index} className="benefit-tag">
                  {benefit}
                </span>
              ))}
              {benefits.length > 3 && (
                <span className="benefit-more">+{benefits.length - 3}</span>
              )}
            </div>
          )}

          <div className="job-footer">
            <span className="post-time">{formatDate(createdAt)} 发布</span>
            
            {showActions && (
              <button 
                className={`apply-btn ${isApplied ? 'applied' : ''}`}
                onClick={handleApply}
                disabled={isApplied}
              >
                {isApplied ? '已申请' : '立即申请'}
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default JobCard;