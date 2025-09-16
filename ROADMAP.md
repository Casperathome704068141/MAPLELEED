# VisaPilot: Feature Roadmap & Pre-Launch Checklist

This document outlines the key features, improvements, and action items required to prepare the VisaPilot application for launch. It serves as our strategic guide to ensure a robust, polished, and successful product.

---

## 1. Core Functionality (Needs Implementation)

These are the essential features that are currently placeholders and require full backend implementation.

### 1.1. Appointment Booking System
-   **Current State:** Frontend UI allows users to select a date/time and enter details. A success toast is shown.
-   **Required Implementation:**
    -   **[ ] Backend Logic:** Create a database schema (e.g., in Firestore) to store appointment details (student name, email, date, time, status).
    -   **[ ] Server Action:** Update the `handleBookingSubmit` function in `src/app/study/page.tsx` to save the appointment data to the database instead of just showing a toast.
    -   **[ ] Confirmation Emails:** Integrate an email service (e.g., SendGrid, Resend) to automatically send confirmation emails to both the student and the admin/expert upon successful booking.
    -   **[ ] Calendar Sync:** (Future Goal) Allow experts to sync their Google Calendar to manage availability dynamically.

### 1.2. Payment Processing (Tiers & Add-Ons)
-   **Current State:** Pricing tiers are displayed, but there is no payment functionality.
-   **Required Implementation:**
    -   **[ ] Stripe & Paystack/Flutterwave Integration:**
        -   Set up API keys in environment variables.
        -   Create a server action to generate payment links or checkout sessions for selected tiers/add-ons.
        -   Build a payment confirmation page or a success modal.
    -   **[ ] Database Tracking:** Record successful payments against a student's record or appointment.

### 1.3. Travel Booking Integration
-   **Current State:** Search forms exist on the `/travel` page but are not functional.
-   **Required Implementation:**
    -   **[ ] Flight & Accommodation API Integration:**
        -   Choose and integrate with a travel affiliate API (e.g., Skyscanner, Kiwi, Amadeus).
        -   Implement the search logic in a server action to call the external API.
    -   **[ ] Display Search Results:** Create a component to display flight and accommodation search results returned from the API.
    -   **[ ] Commission Logic:** Implement logic to track commissions earned from referred bookings.

---

## 2. Admin Panel Enhancements

Making the admin dashboard a powerful tool for managing the business.

### 2.1. Dynamic Data
-   **Current State:** All data in the admin panel is static (hard-coded arrays).
-   **Required Implementation:**
    -   **[ ] Appointments:** Fetch and display real appointment data from the database on the `/admin/appointments` page.
    -   **[ ] Travel Bookings:** Fetch and display travel booking/commission data on the `/admin/travel` page.
    -   **[ ] Dashboard Metrics:** Update the main dashboard (`/admin`) to calculate and display real-time metrics (Total Revenue, Upcoming Appointments, etc.) from the database.
    -   **[ ] Actionable Menus:** Implement functionality for the dropdown menus on the appointments table (e.g., "View Details", "Generate Summary").

### 2.2. Content Management
-   **Current State:** The "Study & Visa Administration" page (`/admin/study`) shows a static list.
-   **Required Implementation:**
    -   **[ ] CRUD for Resources:** Build a form for admins to add, edit, and delete guides and checklists.
    -   **[ ] Dynamic Resource Display:** Create a public-facing "Resources" page where users can view the guides and checklists managed by the admin.

---

## 3. AI Feature Enhancements

Improving the intelligence and usability of the AI-powered tools.

### 3.1. Saving & Editing Generated Content
-   **Current State:** AI-generated summaries and checklists are displayed once and then disappear on page reload.
-   **Required Implementation:**
    -   **[ ] Save to Database:** Add a "Save" button to store the generated text in the database, associated with a specific student or appointment.
    -   **[ ] Edit & Review:** Allow experts to edit the generated text in the text area and save the changes.
    -   **[ ] History:** (Future Goal) Keep a history of generated content for each student.

### 3.2. Refining AI Prompts
-   **Current State:** Prompts are functional but could be more robust.
-   **Required Implementation:**
    -   **[ ] Contextual Refinement:** Iteratively test and refine the prompts in `src/ai/flows/` to handle a wider range of inputs and produce more accurate, well-formatted outputs.
    -   **[ ] Example-Driven Prompts:** Consider adding few-shot examples to the prompts to guide the model's output structure more effectively.

---

## 4. UI/UX Polish & Final Touches

Final improvements for a professional, launch-ready application.

### 4.1. Responsive Design Review
-   **[ ] Thorough Testing:** Test every page and component on various screen sizes (mobile, tablet, desktop) to ensure a seamless experience. Pay close attention to forms, tables, and dialogs.

### 4.2. Accessibility (a11y)
-   **[ ] ARIA Attributes:** Review all interactive elements (buttons, inputs, menus) and ensure they have appropriate ARIA labels and roles.
-   **[ ] Keyboard Navigation:** Ensure the entire application is navigable and usable with only a keyboard.

### 4.3. Authentication
-   **[ ] Secure Admin Login:** Implement a secure authentication system (e.g., using NextAuth.js or Firebase Auth) for the entire `/admin` section. The current panel is publicly accessible.

### 4.4. Placeholder Content
-   **[ ] Images:** Replace all placeholder images from `picsum.photos` with professional, relevant imagery from a service like Unsplash or with custom graphics.
-   **[ ] Text:** Review all copy, including footer links (Terms of Service, Privacy Policy), and ensure it is final.

---

## 5. Pre-Launch Checklist

The final steps before going live.

-   [ ] **Final End-to-End Testing:**
    -   [ ] User books an appointment.
    -   [ ] Admin sees the appointment.
    -   [ ] Payment is processed successfully.
    -   [ ] AI tools are used on an appointment.
    -   [ ] User successfully searches for a flight/hotel.
-   [ ] **Environment Variables:** Ensure all API keys and secrets are correctly set up in the production environment.
-   [ ] **Domain & Hosting:** Configure the custom domain and ensure the production deployment is stable.
-   [ ] **Analytics:** Integrate an analytics tool (e.g., Vercel Analytics, Google Analytics) to monitor user behavior.
