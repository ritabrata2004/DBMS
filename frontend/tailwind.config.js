/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  // Important: This allows Tailwind to work alongside Material UI
  corePlugins: {
    preflight: false,
  },
};
