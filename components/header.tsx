"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, X, Home, Search, ChevronDown, Sparkles, Wrench, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Custom hook for click outside
function useClickOutside(ref: React.RefObject<HTMLDivElement>, handler: () => void) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
}

interface Tool {
  name: string;
  href: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
}

interface ToolCategory {
  name: string;
  icon: React.ReactNode;
  description: string;
  tools: Tool[];
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close search when clicking outside
  useClickOutside(searchRef, () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  });

  const toolCategories: Record<string, ToolCategory> = useMemo(() => ({
    essential: {
      name: 'Essential',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Most used tools',
      tools: [
        {
          name: 'Compress',
          href: '/compress',
          description: 'Reduce file size',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          ),
          popular: true,
        },
        {
          name: 'Convert',
          href: '/convert',
          description: 'Change formats',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          ),
          popular: true,
        },
        {
          name: 'Resize',
          href: '/resize',
          description: 'Resize images',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          ),
        },
      ],
    },
    advanced: {
      name: 'Advanced',
      icon: <Wrench className="w-4 h-4" />,
      description: 'Professional tools',
      tools: [
        {
          name: 'Edit',
          href: '/edit',
          description: 'Edit images',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          ),
        },
        {
          name: 'Remove BG',
          href: '/remove-background',
          description: 'Remove backgrounds',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
              <path d="M22 21H7" />
              <path d="m5 11 9 9" />
            </svg>
          ),
          popular: true,
        },
        {
          name: 'Palette',
          href: '/color-palette',
          description: 'Extract colors',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
            </svg>
          ),
        },
      ],
    },
    utilities: {
      name: 'Utilities',
      icon: <Settings className="w-4 h-4" />,
      description: 'Helper tools',
      tools: [
        {
          name: 'Favicon',
          href: '/favicon-generator',
          description: 'Generate favicons',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
              <rect x="6" y="6" width="4" height="4" />
              <rect x="14" y="6" width="4" height="4" />
              <rect x="6" y="14" width="4" height="4" />
              <rect x="14" y="14" width="4" height="4" />
            </svg>
          ),
        },
        {
          name: 'Metadata',
          href: '/metadata',
          description: 'Strip EXIF data',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          ),
        },
      ],
    },
  }), []);

  const allTools = useMemo(() => {
    return Object.values(toolCategories).flatMap(category => category.tools);
  }, [toolCategories]);

  const filteredTools = useMemo(() => {
    if (!searchQuery) return [];
    return allTools.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allTools]);

  return (
    <>
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className={`flex items-center transition-opacity ${
            pathname === '/' ? 'opacity-100' : 'opacity-80 hover:opacity-100'
          }`}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Image
                src="/camera.png"
                alt="OptiPix"
                width={24}
                height={24}
                className="w-full h-full"
              />
            </div>
            <div className="leading-tight ml-2">
              <h1 className="text-xl font-bold tracking-tight">
                Opti<span className="text-primary">Pix</span>
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="h-9 w-9 p-0"
              >
                <Search className="h-4 w-4" />
              </Button>
              {isSearchOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-background border rounded-lg shadow-lg p-2 min-w-[300px] z-50">
                  <Input
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-2"
                    autoFocus
                    role="combobox"
                    aria-expanded={filteredTools.length > 0}
                    aria-haspopup="listbox"
                    aria-label="Search tools"
                  />
                  {filteredTools.length > 0 && (
                    <div className="max-h-48 overflow-y-auto" role="listbox" aria-live="polite" aria-label="Search results">
                      {filteredTools.map((tool) => (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          role="option"
                          aria-selected={false}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-muted transition-colors"
                        >
                          {tool.icon}
                          <div>
                            <div className="font-medium text-sm">{tool.name}</div>
                            <div className="text-xs text-muted-foreground">{tool.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Categories */}
            {Object.entries(toolCategories).map(([key, category]) => (
              <div key={key} className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center space-x-1 h-9 px-3 transition-all ${
                    category.tools.some((tool) => pathname === tool.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {category.icon}
                  <span className="font-medium">{category.name}</span>
                  <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
                </Button>
                
                {/* Hover Dropdown */}
                <div className="absolute top-full left-0 mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-background border rounded-lg shadow-lg w-56 py-2">
                    <div className="px-2 py-1.5">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {category.description}
                      </div>
                    </div>
                    <div className="border-t border-border/50 my-1"></div>
                    {category.tools.map((tool) => {
                      const isActive = pathname === tool.href;
                      return (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          className={`flex items-center space-x-3 p-2 transition-all duration-200 cursor-pointer ${
                            isActive ? 'text-primary bg-primary/5' : 'hover:bg-muted hover:text-foreground hover:translate-x-1'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                            isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            {tool.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{tool.name}</span>
                              {tool.popular && (
                                <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{tool.description}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile Navigation */}
    {isMenuOpen && (
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="md:hidden fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur-md"
          >
            <div className="h-full overflow-y-auto">
              {/* Mobile Search */}
              <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b px-4 py-4 z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
                {searchQuery && filteredTools.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto bg-muted/50 rounded-lg p-2">
                    {filteredTools.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => {
                          setIsMenuOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          {tool.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{tool.name}</div>
                          <div className="text-xs text-muted-foreground">{tool.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Tool Categories - Grid Layout */}
              <div className="p-4 space-y-6">
                {!searchQuery && (
                  <>
                    {/* Quick Access - Popular Tools */}
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-sm text-foreground">Popular Tools</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {allTools.filter(tool => tool.popular).map((tool) => {
                          const isActive = pathname === tool.href;
                          return (
                            <Link
                              key={tool.href}
                              href={tool.href}
                              onClick={() => setIsMenuOpen(false)}
                              className={`flex flex-col items-center space-y-2 p-4 rounded-xl border transition-all ${
                                isActive
                                  ? 'bg-primary/10 border-primary/30 -translate-y-1'
                                  : 'bg-card/50 border-border/50 hover:bg-card hover:-translate-y-0.5'
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                isActive ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted'
                              }`}>
                                {tool.icon}
                              </div>
                              <div className="text-center">
                                <div className={`font-medium text-xs transition-colors ${
                                  isActive ? 'text-primary' : 'text-foreground'
                                }`}>
                                  {tool.name}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {tool.description}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* All Tools by Category */}
                    {Object.entries(toolCategories).map(([key, category]) => (
                      <div key={key}>
                        <div className="flex items-center space-x-2 mb-4">
                          {category.icon}
                          <h3 className="font-semibold text-sm text-foreground">
                            {category.name}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            ({category.tools.length} tools)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {category.tools.map((tool) => {
                            const isActive = pathname === tool.href;
                            return (
                              <Link
                                key={tool.href}
                                href={tool.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex flex-col items-center space-y-2 p-4 rounded-xl border transition-all ${
                                  isActive
                                    ? 'bg-primary/10 border-primary/30 -translate-y-1'
                                    : 'bg-card/50 border-border/50 hover:bg-card hover:-translate-y-0.5'
                                }`}
                              >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                  isActive ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted'
                                }`}>
                                  {tool.icon}
                                </div>
                                <div className="text-center">
                                  <div className={`font-medium text-xs transition-colors flex items-center justify-center space-x-1 ${
                                    isActive ? 'text-primary' : 'text-foreground'
                                  }`}>
                                    <span>{tool.name}</span>
                                    {tool.popular && (
                                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {tool.description}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
    </>
  );
}
