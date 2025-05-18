import React from "react";
import { Link } from "wouter";

export function DashboardHeader() {
  return (
    <div className="px-6 py-4 bg-editor-surface border-b border-editor-line">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <p className="text-sm text-gray-400 mt-1">Your code optimization overview</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <button className="w-full sm:w-auto px-4 py-2 bg-editor-line hover:bg-opacity-80 rounded-md flex items-center justify-center text-sm font-medium transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Import Code
          </button>
          <Link href="/analysis">
            <a className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary-dark rounded-md flex items-center justify-center text-sm font-medium transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start New Analysis
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
