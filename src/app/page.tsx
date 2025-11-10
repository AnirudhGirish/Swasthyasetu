"use client";

import { useEffect, useState } from "react";
import LocationSelector from "../components/LocationSelector";
import { LoginButton } from "../components/auth/LoginButton";
import CircularText from "@/components/CircularText";
import Image from "next/image";
import Link from "next/link";

type Location = {
  country: string;
  state: string;
  city: string;
};

export default function HomePage() {
  const [locationReady, setLocationReady] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user_location");
    if (stored) {
      const parsed = JSON.parse(stored);
      setLocation(parsed);
      setLocationReady(true);
    }
    setIsVisible(true);
  }, []);

  const handleLocationSet = (loc: Location) => {
    setLocation(loc);
    setLocationReady(true);
  };

  return (
    <main className="min-h-screen flex flex-col bg-white relative overflow-hidden">

      {/* Header */}
      <header className="w-full bg-gradient-to-r from-sky-100/50 via-sky-300/50 to-sky-100/50 backdrop-blur-sm fixed top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 flex items-center justify-center">
              <Image alt="logo" src={"/logo.png"} width={50} height={50} />
            </div>
            <div>
              <Image alt="logo" src={"/digi.png"} width={150} height={100} />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-b from-sky-900 via-sky-600 to-sky-900 bg-clip-text text-transparent">
              Swasthya
              <span className="bg-gradient-to-b from-orange-900 via-orange-600 to-orange-900 bg-clip-text text-transparent">
                Setu
              </span>
            </h1>
            <p className="text-md text-gray-500 -mt-1">Digital Health Bridge</p>
          </div>
          {locationReady && (
            <div className="flex items-center space-x-2 bg-sky-800 backdrop-blur-sm px-3 py-2 rounded-full border border-sky-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-white font-medium">
                {location?.city}, {location?.state}
              </span>
            </div>
          )}
        </div>
        <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-white to-green-500 shadow-inner"></div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col justify-center pt-34 pb-20 my-12">
        {!locationReady ? (
          <div className="flex justify-center z-10 relative">
            <LocationSelector onLocationSet={handleLocationSet} />
          </div>
        ) : (
          <div
            className={`max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 px-6 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-sky-50 to-orange-50 border border-sky-200 rounded-full text-md text-sky-800 font-medium mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <span className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full mr-2 animate-pulse"></span>
                  Government of India Initiative
                </div>
                <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-orange-600 via-orange-300 to-orange-500 bg-clip-text text-transparent">
                    Revolutionary
                  </span>
                  <br />
                  <div className="bg-gradient-to-r from-orange-400 to-green-500 w-fit p-2 rounded-2xl">
                    <span className="bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent">
                      Healthcare
                    </span>
                  </div>
                  <span className="bg-gradient-to-r from-green-400 via-green-700 to-green-500 bg-clip-text text-transparent">
                    Intelligence
                  </span>
                </h2>

                <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                  SwasthyaSetu transforms healthcare delivery through
                  cutting-edge AI and real-time data integration. Connect
                  patients, hospitals, and health authorities in a unified
                  ecosystem that saves lives and optimizes resources.
                </p>
              </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <LoginButton />
                <Link
                  href="/publics"
                  className="group px-8 py-3 rounded-xl border-2 border-sky-200 text-sky-700 bg-white/80 backdrop-blur-sm hover:bg-sky-50 hover:border-sky-300 transition-all duration-300 text-center font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  Explore Platform
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>

              {/* Location Card */}
              <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl px-6 py-5 border border-sky-100 inline-block hover:shadow-xl transition-all duration-300 hover:scale-102">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      Active Location
                    </p>
                    <p className="font-bold text-gray-800">
                      {location?.city}, {location?.state}, {location?.country}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem("user_location");
                    window.location.reload();
                  }}
                  className="text-sm text-sky-600 hover:text-sky-800 transition-colors font-medium hover:underline"
                >
                  Change Location →
                </button>
              </div>

              {/* CTA Buttons */}

            </div>

            {/* Right Illustration */}
            <div className="flex-1 flex flex-col items-center lg:items-end gap-10">
              <div className="relative">
                <div className="w-96 h-96 bg-gradient-to-br from-green-300 to-orange-300 rounded-3xl shadow-2xl border border-sky-200 flex items-center justify-center overflow-hidden group hover:scale-105 transition-transform duration-500">
                  <CircularText
                    text="YOUR HEALTH * OUR INTILLIGENCE * "
                    onHover="speedUp"
                    spinDuration={20}
                    className="custom-class text-black"
                  />
                </div>
                {/* Floating Elements */}
                <div className="absolute top-36 right-41">
                  <Image alt="logo" src={"/logo.png"} height={60} width={60} />
                </div>
                <div className="absolute -bottom-6 left-16 w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl shadow-lg"></div>
                <div className="absolute -bottom-6 right-16 w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg "></div>
                <div className="absolute -bottom-6 right-38 w-20 h-20 bg-gradient-to-br from-white to-white rounded-xl shadow-lg flex justify-center items-center">
                  <div className="animate-spin ">
                    <Image alt="chakra" src={"/chakra.png"} width={50} height={50}/>
                  </div>
                </div>
              </div>
                            <div className="flex flex-wrap gap-6 py-6">
                {[
                  { number: "24/7", label: "AI Monitoring" },
                  { number: "Real-time", label: "Resource Tracking" },
                  { number: "Smart", label: "Predictions" },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-sky-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                  >
                    <div className="text-lg font-bold bg-gradient-to-r from-sky-600 via-sky-300 to-sky-600 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="bg-gradient-to-br from-slate-50 via-white to-sky-50 py-24 border-t border-sky-100 relative"
      >
        {/* Section Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-50/50 to-transparent"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20 px-6">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-sky-100 to-orange-100 border border-sky-200 rounded-full text-sm text-sky-800 font-medium mb-6">
              <span className="w-2 h-2 bg-gradient-to-r from-sky-400 to-sky-500 rounded-full mr-2 animate-pulse"></span>
              Comprehensive Healthcare Ecosystem
            </div>
            <h3 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-sky-800 to-sky-600 bg-clip-text text-transparent">
                Transforming Healthcare
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                Through Innovation
              </span>
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our AI-powered platform creates seamless connections between
              citizens, healthcare providers, and government agencies, ensuring
              optimal resource allocation and rapid emergency response.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-6 mb-16">
            {[
              {
                title: "Citizens & Patients",
                subtitle: "Empowered Healthcare Access",
                icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
                color: "from-sky-500 to-sky-600",
                bgGradient: "from-sky-50 to-sky-100",
                features: [
                  "AI-powered symptom analysis and health recommendations",
                  "Real-time hospital bed availability and wait times",
                  "Emergency service location and rapid response coordination",
                  "Simple Login data protection",
                ],
              },
              {
                title: "Healthcare Providers",
                subtitle: "Intelligent Operations Management",
                icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
                color: "from-green-500 to-green-600",
                bgGradient: "from-green-50 to-green-100",
                features: [
                  "Daily data submission of resources and patient demographics",
                  "Automated resource monitoring and demand forecasting",
                  "Patient flow management and capacity planning",
                  "Predictive analytics for resources",
                ],
              },
              {
                title: "Health Departments",
                subtitle: "Strategic Health Governance",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                color: "from-orange-500 to-orange-600",
                bgGradient: "from-orange-50 to-orange-100",
                features: [
                  "Regional health trend analysis and epidemic detection",
                  "Resource allocation optimization across facilities",
                  "Public health emergency response coordination",
                  "Healthcare accessibility and quality metrics monitoring",
                ],
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`group bg-gradient-to-br ${feature.bgGradient} p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-white/50`}
              >
                <div className="mb-6">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4`}
                  >
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={feature.icon}
                      />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm font-medium text-gray-600 mb-4">
                    {feature.subtitle}
                  </p>
                </div>

                <ul className="space-y-3">
                  {feature.features.map((item, fIdx) => (
                    <li key={fIdx} className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 bg-gradient-to-r ${feature.color} rounded-full mt-2 flex-shrink-0`}
                      ></div>
                      <span className="text-gray-700 text-sm leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Technology Stack */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-sky-100 mx-6">
            <div className="text-center mb-8">
              <h4 className="text-2xl font-bold bg-gradient-to-r from-sky-700 to-sky-600 bg-clip-text text-transparent mb-3">
                Powered by Advanced Technologies
              </h4>
              <p className="text-gray-600">
                Built on cutting-edge infrastructure for reliability, security,
                and scalability
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  name: "Artificial Intelligence",
                  icon: "🤖",
                  desc: "ML & Deep Learning",
                },
                {
                  name: "Real-time Analytics",
                  icon: "📊",
                  desc: "Live Data Processing",
                },
                {
                  name: "Cloud Infrastructure",
                  icon: "☁️",
                  desc: "Scalable & Secure",
                },
                {
                  name: "Secure Integration",
                  icon: "🔗",
                  desc: "Secure data access",
                },
              ].map((tech, idx) => (
                <div
                  key={idx}
                  className="text-center group hover:scale-105 transition-transform duration-300"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {tech.icon}
                  </div>
                  <h5 className="font-semibold text-gray-800 mb-1">
                    {tech.name}
                  </h5>
                  <p className="text-sm text-gray-600">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto relative">
        {/* Tricolor Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-green-600 shadow-inner"></div>

        <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-sky-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="font-semibold text-2xl">SwasthyaSetu</span>
                </div>
                <p className="text-sky-200 text-sm leading-relaxed">
                  Bridging the gap in healthcare through intelligent technology
                  and seamless connectivity.
                </p>
              </div>

              <div>
                <h6 className="font-semibold mb-3 text-sky-100">Quick Links</h6>
                <ul className="space-y-2 text-sm">
                  {[
                    "About Platform",
                    "Documentation",
                    "Support",
                    "Privacy Policy",
                  ].map((link, idx) => (
                    <li key={idx}>
                      <a
                        href="#"
                        className="text-sky-300 hover:text-white transition-colors duration-200"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h6 className="font-semibold mb-3 text-sky-100">
                  Government Initiative
                </h6>
                <p className="text-sky-200 text-sm leading-relaxed">
                  A Digital India initiative under the Ministry of Health &
                  Family Welfare, Government of India.
                </p>
                <p className="text-black text-[10px] mt-1 leading-relaxed">
                  This is a template and prototype. Ideated and built as a project proposal.
                  Not a public site from Governmant of India.
                </p>
              </div>
            </div>

            <div className="border-t border-sky-700 pt-6 text-center">
              <p className="text-sky-200 text-sm">
                © {new Date().getFullYear()} SwasthyaSetu | NIC | Ministry of
                Health & Family Welfare, Government of India
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
