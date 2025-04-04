import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
    './src/**/*.{ts,tsx}',
  ],
  theme: {
  	extend: {
  		container: {
  			center: true,
  			padding: "2rem",
  			screens: {
  				"2xl": "1400px",
  			},
  		},
  		fontFamily: {
  			hindi: ['var(--font-hindi)'],
  			playfair: ['var(--font-playfair)'],
  		},
  		colors: {
  			sai: {
  				orange: '#FF6B00',
  				'orange-light': '#FF8533',
  				'orange-dark': '#CC5500',
  				blue: '#1E88E5',
  				'blue-light': '#64B5F6',
  				'blue-dark': '#1565C0',
  				green: '#4CAF50',
  				'green-light': '#81C784',
  				'green-dark': '#388E3C',
  				pink: '#E91E63',
  				'pink-light': '#F48FB1',
  				'pink-dark': '#C2185B',
  			},
  			border: "hsl(var(--border))",
  			input: "hsl(var(--input))",
  			ring: "hsl(var(--ring))",
  			background: "hsl(var(--background))",
  			foreground: "hsl(var(--foreground))",
  			sidebar: {
  				DEFAULT: "hsl(var(--sidebar))",
  				foreground: "hsl(var(--sidebar-foreground))",
  				border: "hsl(var(--sidebar-border))",
  			},
  			primary: {
  				DEFAULT: "hsl(var(--primary))",
  				foreground: "hsl(var(--primary-foreground))",
  			},
  			secondary: {
  				DEFAULT: "hsl(var(--secondary))",
  				foreground: "hsl(var(--secondary-foreground))",
  			},
  			destructive: {
  				DEFAULT: "hsl(var(--destructive))",
  				foreground: "hsl(var(--destructive-foreground))",
  			},
  			muted: {
  				DEFAULT: "hsl(var(--muted))",
  				foreground: "hsl(var(--muted-foreground))",
  			},
  			accent: {
  				DEFAULT: "hsl(var(--accent))",
  				foreground: "hsl(var(--accent-foreground))",
  			},
  			popover: {
  				DEFAULT: "hsl(var(--popover))",
  				foreground: "hsl(var(--popover-foreground))",
  			},
  			card: {
  				DEFAULT: "hsl(var(--card))",
  				foreground: "hsl(var(--card-foreground))",
  			},
  		},
  		backgroundImage: {
  			'sai-gradient': 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
  		},
  		borderRadius: {
  			lg: "var(--radius)",
  			md: "calc(var(--radius) - 2px)",
  			sm: "calc(var(--radius) - 4px)"
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
