/**
 * Module 16: Global Search
 * FR-SEARCH-001 to FR-SEARCH-005: Universal search across all modules
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPaginatedItems, getPaginatedTotal } from '@/types';
import Image from 'next/image';

type SearchCategory = 'all' | 'students' | 'teachers' | 'parents' | 'content' | 'classes';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery, category],
    queryFn: () => userService.searchUsers(debouncedQuery, { 
      category: category !== 'all' ? category : undefined 
    }),
    enabled: debouncedQuery.length >= 2,
  });

  const resultItems = getPaginatedItems(results);
  const resultTotal = getPaginatedTotal(results);

  const categories = [
    { id: 'all', label: 'All', count: resultTotal || 0 },
    { id: 'students', label: 'Students', count: 0 },
    { id: 'teachers', label: 'Teachers', count: 0 },
    { id: 'parents', label: 'Parents', count: 0 },
    { id: 'content', label: 'Content', count: 0 },
    { id: 'classes', label: 'Classes', count: 0 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search</h1>
        
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Input
            type="search"
            placeholder="Search for students, teachers, content, and more..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 py-3 text-lg"
            autoFocus
          />
        </div>

        {/* Category Filters */}
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as SearchCategory)}
              className={`
                px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors
                ${category === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {cat.label}
              {cat.count > 0 && (
                <span className="ml-2 text-xs opacity-75">({cat.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {!query && (
        <div className="text-center py-16">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Start searching</h3>
          <p className="mt-2 text-sm text-gray-500">
            Enter at least 2 characters to search across students, teachers, content, and more
          </p>
        </div>
      )}

      {query && query.length < 2 && (
        <div className="text-center py-16">
          <p className="text-sm text-gray-500">
            Enter at least 2 characters to search
          </p>
        </div>
      )}

      {isLoading && debouncedQuery && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && resultItems.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Found {resultTotal} result{resultTotal !== 1 ? 's' : ''} for "{debouncedQuery}"
          </p>
          {resultItems.map((item: any) => (
            <Card 
              key={item.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                if (item.role === 'STUDENT') router.push(`/students/${item.id}`);
                else if (item.role === 'TEACHER') router.push(`/teachers/${item.id}`);
                else if (item.role === 'PARENT') router.push(`/parents/${item.id}`);
              }}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {item.profilePicture ? (
                      <Image
                        src={item.profilePicture}
                        alt={item.fullName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                        {item.firstName?.[0]}{item.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{item.fullName}</h3>
                      <Badge variant="info" className="text-xs">{item.role}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.email}</p>
                    {item.role === 'STUDENT' && item.class && (
                      <p className="text-sm text-gray-500 mt-1">
                        Class {item.class} - Section {item.section}
                      </p>
                    )}
                    {item.role === 'TEACHER' && item.department && (
                      <p className="text-sm text-gray-500 mt-1">
                        {item.department}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && results && resultItems.length === 0 && debouncedQuery && (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No results found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Try different keywords or check your spelling
          </p>
        </div>
      )}
    </div>
  );
}
