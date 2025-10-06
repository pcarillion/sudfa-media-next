"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounceValue } from "usehooks-ts";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface AutocompleteSuggestion {
  id: string;
  titre: string;
  slug: string;
}

interface SearchInputProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
}

/**
 * Composant de champ de recherche avec autocomplétion
 * @param {SearchInputProps} props - Les propriétés du composant
 * @param {Function} props.onSearch - Fonction appelée lors de la soumission de recherche
 * @param {boolean} [props.loading=false] - État de chargement de la recherche
 * @param {string} [props.placeholder="Rechercher des articles..."] - Texte placeholder
 * @returns {JSX.Element} Le composant de recherche avec autocomplétion
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  loading = false,
  placeholder = "Rechercher des articles...",
}) => {
  const queryParams = useSearchParams();
  const q = queryParams.get("q");
  const [query, setQuery] = useState(q ? q : "");
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [debouncedQuery] = useDebounceValue(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const response = await fetch(
          `/api/search/autocomplete?q=${encodeURIComponent(debouncedQuery)}`
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(data.suggestions?.length > 0);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  /**
   * Gère la soumission du formulaire de recherche
   * @param {React.FormEvent} e - Événement de soumission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  /**
   * Gère les changements dans le champ de saisie
   * @param {React.ChangeEvent<HTMLInputElement>} e - Événement de changement
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
  };

  /**
   * Gère la navigation au clavier dans les suggestions
   * @param {React.KeyboardEvent} e - Événement clavier
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selectedSuggestion = suggestions[selectedIndex];
          window.location.href = `/article/${selectedSuggestion.slug}`;
        } else {
          handleSubmit(e);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  /**
   * Efface la recherche et remet à zéro les états
   */
  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  /**
   * Gère le clic sur une suggestion
   * @param {AutocompleteSuggestion} suggestion - Suggestion cliquée
   */
  const handleSuggestionClick = (suggestion: AutocompleteSuggestion) => {
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D2270F] focus:border-transparent outline-none transition-all duration-200 text-lg"
            autoComplete="off"
          />

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Search button */}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#D2270F] text-white px-3 py-1 rounded-md hover:bg-[#B91C0C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>

      {/* Autocomplete suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {loadingSuggestions ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Recherche en cours...
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="py-2">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.id}
                  // @ts-expect-error
                  ref={el => (suggestionRefs.current[index] = el)}
                  className={`px-4 py-2 cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? "bg-[#D2270F] text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <Link
                    href={`/article/${suggestion.slug}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="block w-full text-left hover:no-underline"
                  >
                    <div className="flex items-center">
                      <Search className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{suggestion.titre}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            query.trim().length >= 2 && (
              <div className="p-4 text-center text-gray-500">
                Aucune suggestion trouvée
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
