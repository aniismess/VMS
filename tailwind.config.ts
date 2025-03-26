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
  			background: 'hsl(0 0% 100%)',
  			foreground: 'hsl(222.2 84% 4.9%)',
  			card: {
  				DEFAULT: 'hsl(0 0% 100%)',
  				foreground: 'hsl(222.2 84% 4.9%)'
  			},
  			popover: {
  				DEFAULT: 'hsl(0 0% 100%)',
  				foreground: 'hsl(222.2 84% 4.9%)'
  			},
  			primary: {
  				DEFAULT: 'hsl(24 100% 50%)',
  				foreground: 'hsl(0 0% 100%)'
  			},
  			secondary: {
  				DEFAULT: 'hsl(210 40% 96.1%)',
  				foreground: 'hsl(222.2 47.4% 11.2%)'
  			},
  			muted: {
  				DEFAULT: 'hsl(210 40% 96.1%)',
  				foreground: 'hsl(215.4 16.3% 46.9%)'
  			},
  			accent: {
  				DEFAULT: 'hsl(210 40% 96.1%)',
  				foreground: 'hsl(222.2 47.4% 11.2%)'
  			},
  			destructive: {
  				DEFAULT: 'hsl(0 84.2% 60.2%)',
  				foreground: 'hsl(210 40% 98%)'
  			},
  			border: 'hsl(214.3 31.8% 91.4%)',
  			input: 'hsl(214.3 31.8% 91.4%)',
  			ring: 'hsl(24 100% 50%)',
  			chart: {
  				'1': 'hsl(24 100% 50%)',
  				'2': 'hsl(217.2 91.2% 59.8%)',
  				'3': 'hsl(142.1 76.2% 36.3%)',
  				'4': 'hsl(346.8 77.2% 49.8%)',
  				'5': 'hsl(24 100% 50%)'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(0 0% 100%)',
  				foreground: 'hsl(222.2 84% 4.9%)',
  				primary: 'hsl(24 100% 50%)',
  				'primary-foreground': 'hsl(0 0% 100%)',
  				accent: 'hsl(210 40% 96.1%)',
  				'accent-foreground': 'hsl(222.2 47.4% 11.2%)',
  				border: 'hsl(214.3 31.8% 91.4%)',
  				ring: 'hsl(24 100% 50%)'
  			}
  		},
  		backgroundImage: {
  			'sai-gradient': 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
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
