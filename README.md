# ZethetaProjects
# 🏦 SmartLoan — Multi-Step Loan Application

A production-grade, multi-step loan application built with React, React Hook Form, Zod, and Tailwind CSS. Designed to mirror real-world banking workflows with live EMI calculations, KYC verification, auto-save drafts, document uploads, e-signature, and full Cypress test coverage.

---

## 📸 Screenshots

> _Replace the placeholder paths below with your actual screenshot files._

| Screen | Preview |
|---|---|
| 🏠 **Step 1 — Loan Type & EMI Calculator** | `screenshots/step1-loan-type.png` |
| 👤 **Step 2 — Personal Information** | `screenshots/step2-personal-info.png` |
| 🪪 **Step 3 — KYC Verification** | `screenshots/step3-kyc.png` |
| 🗺️ **Step 4 — Address & PIN Auto-fill** | `screenshots/step4-address.png` |
| 💼 **Step 5 — Employment & Income** | `screenshots/step5-employment.png` |
| 👨‍👩‍👧 **Step 6 — Co-Applicant** | `screenshots/step6-co-applicant.png` |
| 📁 **Step 7 — Documents & Signature** | `screenshots/step7-documents.png` |
| 📋 **Step 8 — Review & Submit** | `screenshots/step8-review.png` |
| ✅ **Success Screen** | `screenshots/success.png` |

---

## ✨ Features

### 🔄 Multi-Step Form Flow
- 8 guided steps from loan selection to final submission
- Step-by-step navigation with forward/back controls
- Progress indicator across all steps

### 💰 Step 1 — Loan Requirements
- 6 loan types: 🏠 Home, 👤 Personal, 🚗 Car, 🎓 Education, 💼 Business, 💎 Gold
- Live EMI calculator using the standard reducing-balance formula
- Interactive range slider for loan amount
- Principal vs. interest ratio progress bar
- Loan category badge (Micro / Small / Medium / High Value)

### 👤 Step 2 — Personal Information
- Age validation (21–65 years) from date-of-birth picker
- 📱 Indian mobile number regex validation
- 📧 Real-time email format validation
- OTP simulation flow

### 🪪 Step 3 — KYC Verification
- PAN card format validation (`ABCDE1234F`)
- Aadhaar number validation with masked display (`XXXX XXXX 9012`)
- ⏳ Simulated API verification with loading spinner
- ✅ Form blocked until both PAN and Aadhaar are verified
- KYC consent checkbox

### 🗺️ Step 4 — Address Information
- 📮 PIN code auto-fill — city and state populate instantly from a built-in database of 35+ Indian PIN codes
- Current + permanent address with "same as current" toggle
- Copy current → permanent button
- Residence type selector (🏠 Owned / 🔑 Rented / 👨‍👩‍👧 Family / 🏢 Company)
- Years at address picker

### 💼 Step 5 — Employment & Income
- Conditional form rendering: 🏢 Salaried / 🧑‍💼 Self-Employed / 👔 Business Owner
- GST number validation for business applicants
- Financial eligibility and DTI ratio calculation
- Income category classification

### 👨‍👩‍👧 Step 6 — Co-Applicant _(Conditional)_
- Only appears for 🏠 Home Loans or amounts above ₹10 lakh
- Combined income recalculates loan eligibility
- ⏭️ Skipped automatically when not required

### 📁 Step 7 — Documents & Signature
- 📂 Drag-and-drop file upload (JPG, PNG, PDF — max 5 MB)
- Required documents: PAN, Aadhaar, salary slips, bank statements
- ✍️ Canvas-based e-signature pad with save/clear controls
- Signature stored as base64 image in sessionStorage

### 📋 Step 8 — Review & Submit
- Full application summary across all sections
- ✏️ Edit buttons to jump back to any step
- EMI breakdown: monthly EMI, total interest, total repayment
- Three consent checkboxes (T&C, Credit Check, Data Processing)
- 🚀 Simulated API submission with loading state
- Generated application reference ID (e.g. `ZF-10482931`)
- 🎉 Success screen with animation

### 💾 Auto-Save
- Form state serialised to `localStorage` continuously
- ♻️ Restores draft automatically on page refresh

### 🧪 Cypress Testing
- 🔀 Navigation flow tests
- ✅ Form validation tests
- 🪪 KYC verification tests
- 📁 File upload tests
- 💾 Auto-save tests
- 🚀 Submission flow tests

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| ⚛️ Framework | React 18 |
| 📋 Form Management | React Hook Form |
| 🔍 Validation Schema | Zod |
| 🎨 Styling | Tailwind CSS |
| 🖼️ Icons | Lucide React |
| ✍️ Canvas / Signature | HTML5 Canvas API |
| 🧪 Testing | Cypress |
| ⚡ Build Tool | Vite |
| 💾 State Persistence | localStorage / sessionStorage |

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js ≥ 18
- npm or yarn

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/smartloan.git
cd smartloan

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

### 🧪 Run Cypress Tests

```bash
# Open Cypress Test Runner (interactive)
npx cypress open

# Run all tests headlessly
npx cypress run
```

### 📦 Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Step1LoanType.jsx       # 💰 Loan selection + EMI calculator
│   ├── Step2PersonalInfo.jsx   # 👤 Applicant personal details
│   ├── Step3KYC.jsx            # 🪪 PAN / Aadhaar KYC verification
│   ├── Step4Address.jsx        # 🗺️ Address with PIN auto-fill
│   ├── Step5Employment.jsx     # 💼 Employment & income details
│   ├── Step6CoApplicant.jsx    # 👨‍👩‍👧 Co-applicant (conditional)
│   ├── Step7Documents.jsx      # 📁 File upload + e-signature
│   └── Step8Review.jsx         # 📋 Final review & submit
cypress/
├── e2e/
│   ├── loan-navigation.cy.js   # 🔀 Navigation tests
│   ├── loan-validation.cy.js   # ✅ Validation tests
│   ├── loan-kyc.cy.js          # 🪪 KYC tests
│   ├── loan-upload.cy.js       # 📁 Upload tests
│   ├── loan-autosave.cy.js     # 💾 Auto-save tests
│   └── loan-submit.cy.js       # 🚀 Submission tests
```

---

## 🏗️ Architecture

```
👤 User Input
   ↓
📋 React Hook Form  (central form state, all 8 steps share context)
   ↓
🔍 Zod Validation   (schema-based, field-level and step-level)
   ↓
🔀 Conditional Rendering  (co-applicant, business fields, permanent address)
   ↓
💾 Auto Save        (localStorage on every change)
   ↓
📋 Review Page      (read-only summary, edit navigation)
   ↓
🚀 Submission       (simulated API, application ID generated)
   ↓
🎉 Success Screen
```

---

## 📮 Supported PIN Codes (Auto-fill)

Built-in lookup for 35+ Indian cities including Hyderabad, Mumbai, Delhi, Bengaluru, Chennai, Kolkata, Pune, Ahmedabad, Visakhapatnam, Jaipur, and more.

---

## 📄 License

MIT — free to use and modify for personal and commercial projects.
## 📄 License

MIT — free to use and modify for personal and commercial projects.
