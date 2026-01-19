/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "navy-grey": "#0B0F1A",
                "cs-orange": "#FF7A00",
            },
            fontFamily: {
                "headline": ["Outfit", "Inter", "sans-serif"],
                "technical": ["Roboto Mono", "monospace"]
            }
        },
    },
    plugins: [],
}
