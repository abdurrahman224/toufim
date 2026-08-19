import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
  return (
    <div className="flex items-center justify-between px-3 md:px-4 lg:px-5 py-5 border-t border-gray-100 flex-wrap gap-4">
      <span className="text-sm md:text-base text-[#64748B]">
        Page <small className="text-base text-[#0F172A]">{currentPage} of {totalPages} to {totalItems}</small>  total leads  
      </span>
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-8 h-8 text-xs rounded-lg flex items-center justify-center border font-medium transition-colors ${
            currentPage === 1
              ? 'border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          <ChevronLeft />
        </button>
        {[...Array(totalPages)].map((_, idx) => {
          const pageNum = idx + 1;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 text-xs rounded-lg flex items-center justify-center border font-medium transition-colors ${
                pageNum === currentPage
                  ? 'text-white border-orange-500'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
              style={pageNum === currentPage ? { background: '#f97316' } : {}}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`w-8 h-8 text-xs rounded-lg flex items-center justify-center border font-medium transition-colors ${
            currentPage === totalPages
              ? 'border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}

export function usePagination(data, itemsPerPage = 6) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    currentPage,
    totalPages,
    paginatedData,
    handlePageChange,
  };
}
