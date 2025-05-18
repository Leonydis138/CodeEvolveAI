import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useIsMobile as useMobile } from "@/hooks/use-mobile";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function Sidebar() {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [isAutonomous, setIsAutonomous] = useState(false);

  const NavLink = ({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <a
          className={cn(
            "flex items-center",
            isMobile ? "p-3 rounded-md" : "px-4 py-3 text-sm font-medium rounded-md",
            isActive
              ? "bg-primary bg-opacity-20 text-primary-light"
              : "text-gray-300 hover:bg-editor-line hover:text-white transition-colors"
          )}
        >
          {isMobile ? (
            icon
          ) : (
            <>
              <span className="mr-3">{icon}</span>
              {children}
            </>
          )}
        </a>
      </Link>
    );
  };

  return (
    <aside className="w-16 md:w-64 bg-editor-surface border-r border-editor-line flex-shrink-0">
      <div className="py-4 flex flex-col h-full">
        <nav className="flex-1 px-2 space-y-1">
          {/* Mobile View: Icon Only */}
          {isMobile && (
            <div className="flex flex-col items-center space-y-4 py-2">
              <NavLink href="/" icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }>
                Dashboard
              </NavLink>
              
              <NavLink href="/code-analysis" icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              }>
                Code Analysis
              </NavLink>
              
              <NavLink href="/research-analysis" icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }>
                Research Analysis
              </NavLink>
              
              <NavLink href="/ai-chat" icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                </svg>
              }>
                AI Chat
              </NavLink>
              
              <NavLink href="/insights" icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }>
                Insights
              </NavLink>
              
              <NavLink href="/learning" icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }>
                Learning Hub
              </NavLink>
              
              <NavLink href="/settings" icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }>
                Settings
              </NavLink>
            </div>
          )}

          {/* Desktop View: Full Menu */}
          {!isMobile && (
            <div className="space-y-1">
              <NavLink href="/" icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }>
                Dashboard
              </NavLink>

              <NavLink href="/code-analysis" icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              }>
                Code Analysis
              </NavLink>

              <NavLink href="/research-analysis" icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }>
                Research Analysis
              </NavLink>
              
              <NavLink href="/ai-chat" icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                </svg>
              }>
                AI Chat
              </NavLink>

              <NavLink href="/insights" icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }>
                Insights
              </NavLink>

              <NavLink href="/learning" icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }>
                Learning Hub
              </NavLink>

              <div className="mt-8">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Domains
                </h3>
                <div className="mt-2 space-y-1">
                  <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-editor-line hover:text-white">
                    <span className="w-2 h-2 mr-3 bg-success rounded-full"></span>
                    Mathematics
                  </a>
                  <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-editor-line hover:text-white">
                    <span className="w-2 h-2 mr-3 bg-info rounded-full"></span>
                    Physics
                  </a>
                  <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-editor-line hover:text-white">
                    <span className="w-2 h-2 mr-3 bg-secondary rounded-full"></span>
                    Computer Science
                  </a>
                  <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-editor-line hover:text-white group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Domain
                  </a>
                </div>
              </div>
            </div>
          )}
        </nav>

        {!isMobile && (
          <div className="mt-auto border-t border-editor-line p-4">
            <div className="flex items-center">
              <div className="text-xs text-gray-400">
                Active Mode:
              </div>
              <div className="flex items-center ml-auto">
                <span className={cn(
                  "text-xs mr-2",
                  isAutonomous ? "text-warning" : "text-success"
                )}>
                  {isAutonomous ? "Autonomous" : "Suggestion"}
                </span>
                <Switch
                  checked={isAutonomous}
                  onCheckedChange={setIsAutonomous}
                  aria-label="Toggle autonomous mode"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
