"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { searchSkills } from "@/lib/skills";

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
}

export default function SkillsInput({
  value,
  onChange,
  placeholder = "Type a skill (e.g. React, Python)...",
}: SkillsInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update suggestions when query changes
  useEffect(() => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    // Filter out already-selected skills
    const results = searchSkills(query, 9).filter(
      (s) => !value.includes(s)
    );
    setSuggestions(results);
    setOpen(results.length > 0);
    setActiveIndex(-1);
  }, [query, value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addSkill = useCallback(
    (skill: string) => {
      const trimmed = skill.trim();
      if (!trimmed || value.includes(trimmed)) return;
      onChange([...value, trimmed]);
      setQuery("");
      setSuggestions([]);
      setOpen(false);
      inputRef.current?.focus();
    },
    [value, onChange]
  );

  const removeSkill = useCallback(
    (skill: string) => {
      onChange(value.filter((s) => s !== skill));
    },
    [value, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        addSkill(suggestions[activeIndex]);
      } else if (query.trim()) {
        // Allow adding custom skill not in the list
        addSkill(query.trim());
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    } else if (e.key === "Backspace" && query === "" && value.length > 0) {
      // Backspace on empty input removes last skill
      removeSkill(value[value.length - 1]);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Tag chips + input combined */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          padding: "8px 10px",
          minHeight: 44,
          background: "rgba(10,13,26,0.8)",
          border: "1px solid var(--border-1)",
          borderRadius: "var(--radius-4)",
          transition: "border-color 0.2s, box-shadow 0.2s",
          cursor: "text",
          alignItems: "center",
        }}
        onClick={() => inputRef.current?.focus()}
        onFocus={() => {
          // highlight border on focus-within
        }}
      >
        {/* Existing skills as removable chips */}
        {value.map((skill) => (
          <span
            key={skill}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              fontWeight: 600,
              padding: "3px 8px 3px 10px",
              borderRadius: 4,
              background: "var(--blue-dim)",
              border: "1px solid var(--blue-border)",
              color: "#93c5fd",
              cursor: "default",
              lineHeight: 1.4,
            }}
          >
            {skill}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeSkill(skill); }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 1px",
                lineHeight: 1,
                color: "#93c5fd",
                opacity: 0.6,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
              }}
              aria-label={`Remove ${skill}`}
            >
              ×
            </button>
          </span>
        ))}

        {/* Text input — always visible */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
            placeholder={value.length === 0 ? placeholder : "Add more skills..."}
            style={{
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--text-0)",
              fontSize: 13.5,
              fontFamily: "inherit",
              minWidth: 180,
              flex: 1,
              padding: "2px 2px",
              caretColor: "var(--blue)",
            }}
            autoComplete="off"
            spellCheck={false}
          />
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 200,
            background: "rgba(10,13,26,0.97)",
            border: "1px solid var(--border-2)",
            borderRadius: "var(--radius-6)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.1)",
            backdropFilter: "blur(20px)",
            overflow: "hidden",
            animation: "fadeUp 0.15s var(--ease) both",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "8px 12px 6px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-3)",
            borderBottom: "1px solid var(--border-0)",
          }}>
            Suggestions — Tab or Enter to add
          </div>

          {suggestions.map((skill, i) => (
            <div
              key={skill}
              onMouseDown={(e) => { e.preventDefault(); addSkill(skill); }}
              onMouseEnter={() => setActiveIndex(i)}
              style={{
                padding: "9px 14px",
                fontSize: 13,
                fontWeight: 500,
                color: i === activeIndex ? "var(--text-0)" : "var(--text-1)",
                background: i === activeIndex ? "rgba(59,130,246,0.1)" : "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderBottom: i < suggestions.length - 1 ? "1px solid var(--border-0)" : "none",
                transition: "background 0.1s",
              }}
            >
              {/* Highlight matching portion */}
              <HighlightMatch text={skill} query={query} />
              {i === activeIndex && (
                <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-3)", fontFamily: "monospace" }}>↵</span>
              )}
            </div>
          ))}

          {/* Custom skill option if not exact match */}
          {query.trim() && !suggestions.some(s => s.toLowerCase() === query.toLowerCase()) && (
            <div
              onMouseDown={(e) => { e.preventDefault(); addSkill(query.trim()); }}
              style={{
                padding: "9px 14px",
                fontSize: 12.5,
                color: "var(--text-2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.02)",
                borderTop: "1px solid var(--border-0)",
              }}
            >
              <span style={{ background: "var(--blue-dim)", border: "1px solid var(--blue-border)", color: "#93c5fd", padding: "1px 6px", borderRadius: 3, fontSize: 11, fontWeight: 700 }}>+</span>
              Add &ldquo;<strong style={{ color: "var(--text-0)" }}>{query.trim()}</strong>&rdquo; as custom skill
            </div>
          )}
        </div>
      )}

      {/* Helper text */}
      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>
        <span>Type to search · Tab or Enter to add · Backspace removes last</span>
      </div>
    </div>
  );
}

// Highlights the matching query substring within the skill name
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <strong style={{ color: "var(--blue-light)", fontWeight: 700 }}>
        {text.slice(idx, idx + query.length)}
      </strong>
      {text.slice(idx + query.length)}
    </span>
  );
}
