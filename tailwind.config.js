/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: "#0D9488",
                background: "#F8FAFC",
                foreground: "#0F172A",
                muted: "#64748B",
            },
        },
    },
    plugins: [],
};