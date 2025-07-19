"use client"
import { Link } from "react-router-dom" // Re-import Link
import { Stethoscope, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"

import "../../../css/vet.css"

// Custom SVG Icons provided by the user (copied from HomePage example)
const PawIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    {/* Main paw pad */}
    <ellipse cx="12" cy="16" rx="4" ry="3" />
    {/* Top left toe pad */}
    <circle cx="8" cy="10" r="1.5" />
    {/* Top center toe pad */}
    <circle cx="12" cy="8" r="1.5" />
    {/* Top right toe pad */}
    <circle cx="16" cy="10" r="1.5" />
    {/* Side toe pad */}
    <circle cx="18" cy="13" r="1.2" />
  </svg>
)
const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12 12 10.2 12 8 13.8 4 16 4M16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14M8 4C10.2 4 12 5.8 12 8S10.2 12 8 12 4 10.2 4 8 5.8 4 8 4M8 14C12.4 14 16 15.8 16 18V20H0V18C0 15.8 3.6 14 8 14Z" />
  </svg>
)
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 19 21V5C21 3.9 20.1 3 19 3M19 19H5V8H19V19M7 10H12V15H7" />
  </svg>
)

// Mock data for available animals, as requested
const featuredAnimals = [
  {
    id: 1,
    name: "Buddy",
    type: "Dog",
    breed: "Golden Retriever",
    age: "3 years",
    readyForAdoption: true,
    image: "/images/animals/buddy.png",
    behavior: "Friendly and energetic, great with kids and other pets",
    history: "Rescued from a local shelter after his previous owner moved and couldn't take him. He's well-socialized.",
    socialnessLevel: "High",
  },
  {
    id: 2,
    name: "Luna",
    type: "Cat",
    breed: "Siamese Mix",
    age: "2 years",
    readyForAdoption: true,
    image: "/images/animals/luna.png",
    behavior: "Calm and affectionate, loves to cuddle and purr",
    history: "Found as a stray, Luna was initially shy but has blossomed into a loving companion.",
    socialnessLevel: "Medium",
  },
  {
    id: 3,
    name: "Max",
    type: "Dog",
    breed: "German Shepherd",
    age: "5 years",
    readyForAdoption: false,
    image: "/images/animals/max.png",
    behavior: "Loyal and protective, needs experienced owner",
    history: "Owner moved and couldn't take him. Max is house-trained and knows basic commands.",
    socialnessLevel: "Medium",
  },
]

export default function VetDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="full-width-wrapper bg-gradient-main">
      <main className="flex-1 p-6 md:p-10">
        {/* Introduction Section - Styled to blend with the background and match section header text */}
        <section className="hero">
          <div className="hero-overlay" />
          <div className="hero-container">
            <div className="hero-content">
              {/* Removed the hero-badge div */}
              <h1 className="hero-title">
                Welcome, <span className="hero-title-gradient">Doctor!</span>
              </h1>
              <p className="hero-description">
                We're glad to have you back in the system. You can view and update medical records, manage checkups, and
                ensure every animal stays healthy and ready for adoption. Thank you for taking care of our furry
                friends.
              </p>
            </div>
          </div>
        </section>

        <section id="animals" className="all-animals">
          <div className="all-animals-container">
            <div className="section-header-all">
              <h2 className="section-title-all">Animals Under Care</h2>
              <p className="section-description-all">
                Explore the profiles of animals currently under our care, including their behavior, history, and
                socialness.
              </p>
              <div className="section-divider-all" />
              <div className="section-divider-all" style={{ width: "4rem", marginTop: "1rem" }} />{" "}
              {/* Smaller divider */}
            </div>
            <div className="all-animals-grid">
              {featuredAnimals.map((animal) => (
                <div key={animal.id} className="animal-card-all">
                  <div className="animal-image-container-all">
                    <img src={animal.image || "/placeholder.svg"} alt={animal.name} className="animal-image-all" />
                    <div className={`animal-status-all ${animal.readyForAdoption ? "" : "not-ready"}`}>
                      {animal.readyForAdoption ? "Ready for Adoption" : "Not Ready Yet"}
                    </div>
                    <div className="animal-overlay-all" />
                  </div>
                  <div className="animal-content-all">
                    <h4 className="animal-name-all">{animal.name}</h4>
                    <p className="animal-details-all">
                      {animal.type} • {animal.breed} • {animal.age}
                    </p>
                    <p className="animal-description-all">{animal.behavior}</p>
                    <div className="grid gap-3 text-sm text-gray-text">
                      <div className="animal-info-item">
                        <PawIcon className="h-5 w-5 flex-shrink-0 text-blue-primary" />
                        <div>
                          <span className="label">Behavior:</span> {animal.behavior}
                        </div>
                      </div>
                      <div className="animal-info-item">
                        <CalendarIcon className="h-5 w-5 flex-shrink-0 text-blue-primary" />
                        <div>
                          <span className="label">History:</span> {animal.history}
                        </div>
                      </div>
                      <div className="animal-info-item">
                        <UsersIcon className="h-5 w-5 flex-shrink-0 text-blue-primary" />
                        <div>
                          <span className="label">Socialness:</span> {animal.socialnessLevel}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col mt-6">
                      <Link to={`/animalMedicalForm?animalId=${animal.id}`} className="block">
                        <button className="btn-animal-all" style={{ marginBottom: "20px" }}>
                          <Stethoscope className="h-5 w-5 mr-2" />
                          <span>View Medical Records</span>
                        </button>
                      </Link>
                      <Link to={`/readyStatusForm/Id=${animal.id}`} className="block">
                        <button className="btn-animal-all" style={{ marginBottom: "20px" }}>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span>Update Adoption Status</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      {/* Removed footer as per HomePage example */}
    </div>
  )
}
