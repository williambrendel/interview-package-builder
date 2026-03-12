"use strict";

// Different type of browsers, os, and agent.
const BROWSERS = [
  { name: "Chrome", version: () => `${Math.floor(Math.random() * 30) + 90}.0.${Math.floor(Math.random() * 9999)}.${Math.floor(Math.random() * 999)}` },
  { name: "Firefox", version: () => `${Math.floor(Math.random() * 10) + 80}.0` },
  { name: "Edge", version: () => `${Math.floor(Math.random() * 10) + 90}.0.${Math.floor(Math.random() * 999)}.${Math.floor(Math.random() * 99)}` },
  { name: "Safari", version: () => `${Math.floor(Math.random() * 3) + 13}.0.${Math.floor(Math.random() * 9)}` }
], OS = [
  "Windows NT 10.0; Win64; x64",
  "Macintosh; Intel Mac OS X 10_15_7",
  "X11; Linux x86_64",
  "iPhone; CPU iPhone OS 15_2 like Mac OS X",
  "Android 11; Mobile"
], AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 11; SM-G975U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
];

// Helper function to get a random browser string.
const getBrowser = (i = Math.floor(Math.random() * BROWSERS.length)) => (
  i = BROWSERS[i],
  `${i.name}/${i.version()}`
);

// Main function to get a random agent.
const getRandomUserAgent = () => (
  AGENTS[Math.floor(Math.random() * AGENTS.length * 2)]
  || `Mozilla/5.0 (${OS[Math.floor(Math.random() * OS.length)]}) AppleWebKit/537.36 (KHTML, like Gecko) ${getBrowser()} Safari/537.36`
);

/**
 * @ignore
 * Default export with freezing.
 */
module.exports = Object.freeze(Object.defineProperty(getRandomUserAgent, "getRandomUserAgent", {
  value: getRandomUserAgent
}));