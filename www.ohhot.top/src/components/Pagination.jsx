import React from 'react';
import { Button } from 'antd';
import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  pageSize, 
  totalItems,
  showSizeChanger = false,
  onSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showQuickJumper = false,
  showTotal = true
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2; // 当前页前后显示页数
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (
        (i === currentPage - delta - 1 && currentPage - delta > 2) ||
        (i === currentPage + delta + 1 && currentPage + delta < totalPages - 1)
      ) {
        pages.push('...');
      }
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    onSizeChange?.(newSize);
  };

  const handleQuickJumper = (e) => {
    if (e.key === 'Enter') {
      const page = parseInt(e.target.value);
      if (page >= 1 && page <= totalPages) {
        handlePageChange(page);
        e.target.value = '';
      }
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination">
      {showTotal && totalItems && (
        <div className="pagination-total">
          共 {totalItems} 条记录
        </div>
      )}
      
      <div className="pagination-controls">
        <button
          className="pagination-btn pagination-prev"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          上一页
        </button>

        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="pagination-ellipsis">...</span>
            ) : (
              <button
                className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          className="pagination-btn pagination-next"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          下一页
        </button>
      </div>

      <div className="pagination-options">
        {showSizeChanger && (
          <div className="page-size-selector">
            <select 
              value={pageSize} 
              onChange={handleSizeChange}
              className="page-size-select"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size} 条/页
                </option>
              ))}
            </select>
          </div>
        )}

        {showQuickJumper && (
          <div className="quick-jumper">
            <span>跳至</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              onKeyPress={handleQuickJumper}
              className="jumper-input"
              placeholder="页码"
            />
            <span>页</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;