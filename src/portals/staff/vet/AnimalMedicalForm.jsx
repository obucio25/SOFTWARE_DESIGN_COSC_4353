"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Plus, Stethoscope, Calendar, Tag, ArrowLeft } from "lucide-react"

import "../../../css/vet.css"

// Helper function to generate a random animal for selection
const generateRandomAnimal = (id) => {
  const animalTypes = ["Dog", "Cat", "Bird", "Reptile"]
  const breeds = ["Golden Retriever", "Siamese Mix", "German Shepherd", "Ball Python", "Parrot", "Beagle"]
  return {
    id: id,
    name: `Animal ${id}`,
    type: animalTypes[Math.floor(Math.random() * animalTypes.length)],
    breed: breeds[Math.floor(Math.random() * breeds.length)],
  }
}

// Helper function to generate a random medical record
const generateRandomMedicalRecord = (animalId, animalName) => {
  const recordTypes = ["Vaccination", "Check-up", "Injury", "Medication", "Surgery", "Diagnosis"]
  const notes = [
    "Annual vaccine administered.",
    "Routine check-up, healthy overall.",
    "Minor paw injury, treated and bandaged.",
    "Prescribed antibiotics for respiratory infection.",
    "Successful spay/neuter surgery.",
    "Diagnosed with mild allergies.",
  ]
  const diagnoses = ["Allergies", "Parasites", "Dental Issues", "Respiratory Infection", "Arthritis"]
  const treatments = ["Antibiotics", "Pain Medication", "Dietary Change", "Surgery", "Vaccine"]

  const randomDiagnoses = Array.from({ length: Math.floor(Math.random() * 3) }).map(
    () => diagnoses[Math.floor(Math.random() * diagnoses.length)],
  )
  const randomTreatments = Array.from({ length: Math.floor(Math.random() * 3) }).map(
    () => treatments[Math.floor(Math.random() * treatments.length)],
  )

  return {
    id: Date.now() + Math.random(), // Unique ID
    animalId: animalId,
    animalName: animalName,
    recordType: recordTypes[Math.floor(Math.random() * recordTypes.length)],
    date: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0], // Last 30 days
    note: notes[Math.floor(Math.random() * notes.length)],
    diagnoses: [...new Set(randomDiagnoses)], // Ensure unique diagnoses
    treatments: [...new Set(randomTreatments)], // Ensure unique treatments
  }
}

export default function NewMedicalRecordForm() {
  const navigate = useNavigate()
  const [medicalRecords, setMedicalRecords] = useState([])
  const [formData, setFormData] = useState({
    animalId: "",
    recordType: "",
    date: "",
    note: "",
    diagnoses: [],
    treatments: [],
  })

  const [availableAnimals, setAvailableAnimals] = useState([])

  useEffect(() => {
    // Generate a few random animals for the dropdown selection
    const animals = Array.from({ length: 5 }).map((_, i) => generateRandomAnimal(i + 1))
    setAvailableAnimals(animals)
    if (animals.length > 0) {
      setFormData((prev) => ({ ...prev, animalId: animals[0].id.toString() })) // Select first animal by default
    }
  }, [])

  const recordTypes = ["Vaccination", "Check-up", "Injury", "Medication", "Surgery", "Diagnosis", "Other"]
  const allDiagnoses = [
    "Allergies",
    "Parasites",
    "Dental Issues",
    "Respiratory Infection",
    "Arthritis",
    "Obesity",
    "Skin Condition",
  ]
  const allTreatments = [
    "Antibiotics",
    "Pain Medication",
    "Dietary Change",
    "Surgery",
    "Vaccine",
    "Physical Therapy",
    "Topical Cream",
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleMultiSelectChange = (e, fieldName, availableOptions) => {
    const selectedValue = e.target.value
    if (selectedValue && !formData[fieldName].includes(selectedValue)) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: [...prev[fieldName], selectedValue],
      }))
      e.target.value = "" // Reset select after adding
    }
  }

  const removeMultiSelectItem = (itemToRemove, fieldName) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((item) => item !== itemToRemove),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const selectedAnimal = availableAnimals.find((a) => a.id.toString() === formData.animalId)
    if (!selectedAnimal) {
      alert("Please select an animal.")
      return
    }

    // Generate a new random medical record based on the selected animal
    const newRecord = generateRandomMedicalRecord(selectedAnimal.id, selectedAnimal.name)

    setMedicalRecords((prev) => [newRecord, ...prev]) // Add to the top of the list
    alert("Medical record added successfully (simulated)!")

    // Reset form, keeping the selected animal
    setFormData((prev) => ({
      ...prev,
      recordType: "",
      date: "",
      note: "",
      diagnoses: [],
      treatments: [],
    }))
  }

  return (
    <div className="flex flex-col min-h-screen bg-blue-light">
      <main className="flex-1 p-6 md:p-10">
        <div className="mb-6 flex justify-end">
          <Link
            to="/vetdashboard"
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-md text-base font-semibold"
          >
            <ArrowLeft className="h-5 w-5" /> Volver al Dashboard
          </Link>
        </div>
        <div className="task-container">
          <div className="task-header">
            <h1 className="task-title">Add New Medical Record</h1>
            <p className="task-subtitle">Create and manage medical records for animals</p>
          </div>
          <div className="task-grid">
            {/* Medical Record Creation Form */}
            <div className="task-card">
              <div className="card-header">
                <h2 className="card-title">
                  <Stethoscope className="icon" />
                  New Record Details
                </h2>
                <p className="card-description">Fill out the details to add a new medical record.</p>
              </div>
              <div className="card-content">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="animalId" className="form-label">
                      Select Animal
                    </label>
                    <select
                      id="animalId"
                      name="animalId"
                      className="form-select"
                      value={formData.animalId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select an animal</option>
                      {availableAnimals.map((animal) => (
                        <option key={animal.id} value={animal.id}>
                          {animal.name} ({animal.type} - {animal.breed})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="recordType" className="form-label">
                      Record Type
                    </label>
                    <select
                      id="recordType"
                      name="recordType"
                      className="form-select"
                      value={formData.recordType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select record type</option>
                      {recordTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label htmlFor="date" className="form-label">
                        Date
                      </label>
                      <input
                        id="date"
                        type="date"
                        name="date"
                        className="form-input"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="note" className="form-label">
                      Notes
                    </label>
                    <textarea
                      id="note"
                      name="note"
                      className="form-textarea"
                      placeholder="Detailed notes about the medical record..."
                      value={formData.note}
                      onChange={handleChange}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Diagnoses</label>
                    <div className="skills-container">
                      {formData.diagnoses.map((diagnosis) => (
                        <span
                          key={diagnosis}
                          className="badge badge-secondary badge-removable"
                          onClick={() => removeMultiSelectItem(diagnosis, "diagnoses")}
                          title="Click to remove"
                        >
                          {diagnosis} ×
                        </span>
                      ))}
                    </div>
                    <select
                      className="form-select"
                      onChange={(e) => handleMultiSelectChange(e, "diagnoses", allDiagnoses)}
                      value="" // Reset value after selection
                    >
                      <option value="">Add diagnoses</option>
                      {allDiagnoses
                        .filter((diag) => !formData.diagnoses.includes(diag))
                        .map((diag) => (
                          <option key={diag} value={diag}>
                            {diag}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Treatments</label>
                    <div className="skills-container">
                      {formData.treatments.map((treatment) => (
                        <span
                          key={treatment}
                          className="badge badge-secondary badge-removable"
                          onClick={() => removeMultiSelectItem(treatment, "treatments")}
                          title="Click to remove"
                        >
                          {treatment} ×
                        </span>
                      ))}
                    </div>
                    <select
                      className="form-select"
                      onChange={(e) => handleMultiSelectChange(e, "treatments", allTreatments)}
                      value="" // Reset value after selection
                    >
                      <option value="">Add treatments</option>
                      {allTreatments
                        .filter((treat) => !formData.treatments.includes(treat))
                        .map((treat) => (
                          <option key={treat} value={treat}>
                            {treat}
                          </option>
                        ))}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary btn-full">
                    Add Medical Record
                  </button>
                </form>
              </div>
            </div>

            {/* Recent Medical Records List */}
            <div className="task-card">
              <div className="card-header">
                <h2 className="card-title">Recent Medical Records</h2>
                <p className="card-description">
                  {medicalRecords.length} record{medicalRecords.length !== 1 ? "s" : ""} added
                </p>
              </div>
              <div className="card-content">
                <div className="task-list">
                  {medicalRecords.length === 0 ? (
                    <div className="empty-state">
                      <p>No medical records added yet. Add your first record using the form.</p>
                    </div>
                  ) : (
                    medicalRecords.map((record) => (
                      <div key={record.id} className="task-item">
                        <div className="task-item-header">
                          <h3 className="task-item-title">
                            {record.recordType} for {record.animalName}
                          </h3>
                        </div>
                        <p className="task-item-description">{record.note}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                          {record.diagnoses.map((diag) => (
                            <span key={diag} className="badge badge-secondary">
                              <Tag className="h-3 w-3 mr-1" />
                              {diag}
                            </span>
                          ))}
                          {record.treatments.map((treat) => (
                            <span key={treat} className="badge badge-secondary">
                              <Plus className="h-3 w-3 mr-1" />
                              {treat}
                            </span>
                          ))}
                        </div>
                        <div className="task-separator"></div>
                        <div className="task-item-meta">
                          <div className="task-item-meta-item">
                            <Calendar className="icon-sm" />
                            {record.date}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
