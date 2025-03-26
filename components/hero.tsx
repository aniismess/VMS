import { Heart, Users, Star } from "lucide-react"

const quotes = [
  {
    text: "Love All, Serve All",
    author: "Sri Sathya Sai Baba",
    icon: Heart,
  },
  {
    text: "Help Ever, Hurt Never",
    author: "Sri Sathya Sai Baba",
    icon: Users,
  },
  {
    text: "Truth is God, Love is God, Live in Love",
    author: "Sri Sathya Sai Baba",
    icon: Star,
  },
]

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-sai-gradient">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-playfair">
            Sri Sathya Sai Seva Organisation
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/90">
            Empowering volunteers to serve humanity with love and devotion
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {quotes.map((quote) => (
              <div key={quote.text} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <quote.icon className="h-5 w-5 flex-none text-white/80" aria-hidden="true" />
                  {quote.text}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-white/80">
                  <p className="flex-auto italic">"{quote.author}"</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
} 