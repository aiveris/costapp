import { useState } from 'react';
import Auth from './Auth';

export default function LandingPage({ onAuthStateChange }: { onAuthStateChange: (user: any) => void }) {
  const [showAuth, setShowAuth] = useState(false);

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7.11111C17.775 5.21864 15.8556 4 13.6979 4C9.99875 4 7 7.58172 7 12C7 16.4183 9.99875 20 13.6979 20C15.8556 20 17.775 18.7814 19 16.8889M5 10H14M5 14H14" />
        </svg>
      ),
      title: 'Transakcijų valdymas',
      description: 'Sekite visas pajamas ir išlaidas vienoje vietoje su patogia kategorijų sistema',
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 15v3m4-7v7m4-11v11m4-6v6" />
        </svg>
      ),
      title: 'Statistika ir grafikai',
      description: 'Vizualizuokite savo finansus su interaktyviais grafikais ir detalizuotomis statistikomis',
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.23,2H5.77A3.77,3.77,0,0,0,2,5.77V18.23A3.77,3.77,0,0,0,5.77,22H18.23A3.77,3.77,0,0,0,22,18.23V5.77A3.77,3.77,0,0,0,18.23,2ZM20,18.23A1.77,1.77,0,0,1,18.23,20H5.77A1.77,1.77,0,0,1,4,18.23V5.77A1.77,1.77,0,0,1,5.77,4H18.23A1.77,1.77,0,0,1,20,5.77Z"/>
          <path d="M8,11H7a1,1,0,0,0,0,2H8a1,1,0,0,0,0-2Z"/>
          <path d="M13,11H11a1,1,0,0,0,0,2h2a1,1,0,0,0,0-2Z"/>
          <path d="M17,11H16a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Z"/>
        </svg>
      ),
      title: 'Biudžeto valdymas',
      description: 'Nustatykite biudžetus kategorijoms ir gaukite perspėjimus apie viršijimus',
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M44,7.1V14a2,2,0,0,1-2,2H35a2,2,0,0,1-2-2.3A2.1,2.1,0,0,1,35.1,12h2.3A18,18,0,0,0,6.1,22.2a2,2,0,0,1-2,1.8h0a2,2,0,0,1-2-2.2A22,22,0,0,1,40,8.9V7a2,2,0,0,1,2.3-2A2.1,2.1,0,0,1,44,7.1Z"/>
          <path d="M4,40.9V34a2,2,0,0,1,2-2h7a2,2,0,0,1,2,2.3A2.1,2.1,0,0,1,12.9,36H10.6A18,18,0,0,0,41.9,25.8a2,2,0,0,1,2-1.8h0a2,2,0,0,1,2,2.2A22,22,0,0,1,8,39.1V41a2,2,0,0,1-2.3,2A2.1,2.1,0,0,1,4,40.9Z"/>
          <path d="M24.7,22c-3.5-.7-3.5-1.3-3.5-1.8s.2-.6.5-.9a3.4,3.4,0,0,1,1.8-.4,6.3,6.3,0,0,1,3.3.9,1.8,1.8,0,0,0,2.7-.5,1.9,1.9,0,0,0-.4-2.8A9.1,9.1,0,0,0,26,15.3V13a2,2,0,0,0-4,0v2.2c-3,.5-5,2.5-5,5.2s3.3,4.9,6.5,5.5,3.3,1.3,3.3,1.8-1.1,1.4-2.5,1.4h0a6.7,6.7,0,0,1-4.1-1.3,2,2,0,0,0-2.8.6,1.8,1.8,0,0,0,.3,2.6A10.9,10.9,0,0,0,22,32.8V35a2,2,0,0,0,4,0V32.8a6.3,6.3,0,0,0,3-1.3,4.9,4.9,0,0,0,2-4h0C31,23.8,27.6,22.6,24.7,22Z"/>
        </svg>
      ),
      title: 'Periodinės transakcijos',
      description: 'Automatizuokite pasikartojančias transakcijas ir sutaupykite laiko',
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 512.002 512.002" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M243.654,0.001c-37.122,0-67.322,30.201-67.322,67.322s30.2,67.323,67.322,67.323s67.323-30.201,67.323-67.322C310.977,30.203,280.776,0.001,243.654,0.001z M243.654,104.229c-20.35,0-36.905-16.556-36.905-36.905s16.555-36.905,36.905-36.905s36.906,16.556,36.906,36.905S264.004,104.229,243.654,104.229z"/>
          <rect x="187.704" y="187.543" width="111.895" height="30.417"/>
        </svg>
      ),
      title: 'Santaupų valdymas',
      description: 'Valdykite santaupų sąskaitas ir sekite progresą link finansinių tikslų',
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9H21M7 3V5M17 3V5M6 13H8M6 17H8M11 13H13M11 17H13M16 13H18M16 17H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" />
        </svg>
      ),
      title: 'Kalendorinė peržiūra',
      description: 'Peržiūrėkite visas transakcijas patogioje kalendoriaus peržiūroje',
    },
  ];

  if (showAuth) {
    return <Auth onAuthStateChange={onAuthStateChange} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            CostAPP
          </h1>
          <button
            onClick={() => setShowAuth(true)}
            className="px-4 py-2 sm:px-6 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg min-h-[44px] touch-manipulation active:scale-95"
          >
            Prisijungti
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Valdykite savo finansus
            <span className="block text-blue-600 dark:text-blue-400 mt-2">protingai ir lengvai</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto">
            Moderni finansų valdymo aplikacija, kuri padės jums kontroliuoti pajamas, išlaidas ir pasiekti finansinių tikslų
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setShowAuth(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 min-h-[52px] touch-manipulation"
            >
              Pradėti dabar
            </button>
            <button
              onClick={() => {
                const featuresSection = document.getElementById('features');
                featuresSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all min-h-[52px] touch-manipulation active:scale-95"
            >
              Sužinoti daugiau
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Kodėl pasirinkti CostAPP?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Visos funkcijos, kurių jums reikia efektyviam finansų valdymui
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl p-6 sm:p-8 transition-all transform hover:-translate-y-1"
            >
              <div className="text-blue-600 dark:text-blue-400 mb-4">
                {feature.icon}
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-2xl shadow-2xl p-8 sm:p-12 text-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Pradėkite šiandien
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Prisijunkite prie CostAPP ir pradėkite valdyti savo finansus profesionaliai
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 min-h-[52px] touch-manipulation"
          >
            Sukurti paskyrą nemokamai
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 sm:px-6 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} CostAPP. Visos teisės saugomos.</p>
        </div>
      </footer>
    </div>
  );
}
