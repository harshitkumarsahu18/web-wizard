const defaultEvents = [];

let events = JSON.parse(localStorage.getItem("cc_events")) || defaultEvents;
let applications = JSON.parse(localStorage.getItem("cc_applications")) || [];
let studentProfile = JSON.parse(localStorage.getItem("cc_studentProfile")) || {};
let currentRole = "student";
let currentPage = "explore";
let editingEventId = null;

const $ = (id) => document.getElementById(id);

function saveData() {
    localStorage.setItem("cc_events", JSON.stringify(events));
    localStorage.setItem("cc_applications", JSON.stringify(applications));
    localStorage.setItem("cc_studentProfile", JSON.stringify(studentProfile));
}

function showToast(message) {
    const toast = $("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function switchRole(role) {
    currentRole = role;
    renderApp();
}

function navigate(page) {
    currentPage = page;
    renderApp();
}

function getPageInfo() {
    const pages = {
        explore: ["Explore Events", "Discover events happening on your campus."],
        applications: ["My Registrations", "Track your event registrations."],
        passes: ["My Passes", "View your approved event passes."],
        dashboard: ["Organizer Dashboard", "Manage your college events."],
        manage: ["Manage Events", "Create and manage your events."],
        profile: ["My Profile", "Manage your personal information."]
    };

    return pages[currentPage] || pages.explore;
}

function renderApp() {
    const roleLabel = $("roleLabel");
    const pageLabel = $("pageLabel");
    const pageTitle = $("pageTitle");
    const pageDescription = $("pageDescription");
    const pageContent = $("pageContent");
    const currentRoleElement = $("currentRole");

    if (!pageContent) return;

    if (roleLabel) roleLabel.textContent = currentRole === "student" ? "Student" : "Organizer";
    if (currentRoleElement) currentRoleElement.textContent = currentRole;

    const [title, description] = getPageInfo();

    if (pageLabel) pageLabel.textContent = currentRole === "student" ? "STUDENT PORTAL" : "ORGANIZER PORTAL";
    if (pageTitle) pageTitle.textContent = title;
    if (pageDescription) pageDescription.textContent = description;

    updateNavigation();

    if (currentRole === "student") {
        if (currentPage === "applications") renderApplications();
        else if (currentPage === "passes") renderPasses();
        else if (currentPage === "profile") renderProfile();
        else renderExplore();
    } else {
        if (currentPage === "manage") renderManageEvents();
        else if (currentPage === "profile") renderProfile();
        else renderDashboard();
    }
}

function updateNavigation() {
    const navigation = $("navigation");
    if (!navigation) return;

    if (currentRole === "student") {
        navigation.innerHTML = `
            <button onclick="navigate('explore')">Explore Events</button>
            <button onclick="navigate('applications')">My Registrations</button>
            <button onclick="navigate('passes')">My Passes</button>
            <button onclick="navigate('profile')">My Profile</button>
            <button onclick="switchRole('organizer')">Switch to Organizer</button>
        `;
    } else {
        navigation.innerHTML = `
            <button onclick="navigate('dashboard')">Dashboard</button>
            <button onclick="navigate('manage')">Manage Events</button>
            <button onclick="navigate('profile')">My Profile</button>
            <button onclick="switchRole('student')">Switch to Student</button>
        `;
    }
}

function renderExplore() {
    const pageContent = $("pageContent");
    const categories = ["All", "Technical", "Cultural", "Sports", "Workshop", "Other"];

    pageContent.innerHTML = `
        <div class="event-toolbar">
            <input type="text" id="eventSearch" placeholder="Search events..." oninput="filterEvents()">
            <select id="categoryFilter" onchange="filterEvents()">
                ${categories.map(c => `<option value="${c}">${c}</option>`).join("")}
            </select>
        </div>
        <div class="event-grid" id="eventGrid"></div>
    `;

    filterEvents();
}

function filterEvents() {
    const search = ($("eventSearch")?.value || "").toLowerCase();
    const category = $("categoryFilter")?.value || "All";

    const filtered = events.filter(event => {
        const matchesSearch =
            event.title.toLowerCase().includes(search) ||
            event.description.toLowerCase().includes(search) ||
            event.organizer.toLowerCase().includes(search);

        const matchesCategory = category === "All" || event.category === category;

        return matchesSearch && matchesCategory;
    });

    const grid = $("eventGrid");
    if (!grid) return;

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>No events available</h3>
                <p>New events will appear here when organizers publish them.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(event => `
        <div class="event-card">
            <div class="event-card-top">
                <span>${escapeHTML(event.category)}</span>
                <span>${escapeHTML(event.status || "Open")}</span>
            </div>
            <h3>${escapeHTML(event.title)}</h3>
            <p>${escapeHTML(event.description)}</p>
            <div class="event-meta">
                <p>📅 ${escapeHTML(event.date)}</p>
                <p>📍 ${escapeHTML(event.venue)}</p>
                <p>👥 ${event.registrations?.length || 0} registered</p>
            </div>
            <button onclick="viewEvent('${event.id}')">View Details</button>
        </div>
    `).join("");
}

function viewEvent(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;

    const modal = $("modal");
    const modalContent = $("modalContent");

    modalContent.innerHTML = `
        <h2>${escapeHTML(event.title)}</h2>
        <p>${escapeHTML(event.description)}</p>
        <p><strong>Category:</strong> ${escapeHTML(event.category)}</p>
        <p><strong>Date:</strong> ${escapeHTML(event.date)}</p>
        <p><strong>Time:</strong> ${escapeHTML(event.time)}</p>
        <p><strong>Venue:</strong> ${escapeHTML(event.venue)}</p>
        <p><strong>Organizer:</strong> ${escapeHTML(event.organizer)}</p>
        <button onclick="showRegistrationForm('${event.id}')">Register Now</button>
        <button onclick="closeModal()">Close</button>
    `;

    modal?.classList.add("active");
}

function showRegistrationForm(eventId) {
    const modalContent = $("modalContent");

    modalContent.innerHTML = `
        <h2>Event Registration</h2>
        <p>Please enter your details to register.</p>

        <form onsubmit="submitRegistration(event, '${eventId}')">
            <input type="text" id="regName" placeholder="Full Name" required>
            <input type="email" id="regEmail" placeholder="College Email" required>
            <input type="text" id="regCollege" placeholder="College Name" required>
            <input type="text" id="regBranch" placeholder="Branch (e.g. CSE)" required>
            <select id="regSemester" required>
                <option value="">Select Semester</option>
                ${[1,2,3,4,5,6,7,8].map(n => `<option value="${n}">${n} Semester</option>`).join("")}
            </select>
            <input type="tel" id="regPhone" placeholder="Phone Number" pattern="[0-9]{10}" required>
            <button type="submit">Submit Registration</button>
            <button type="button" onclick="closeModal()">Cancel</button>
        </form>
    `;
}

function submitRegistration(event, eventId) {
    event.preventDefault();

    const name = $("regName").value.trim();
    const email = $("regEmail").value.trim().toLowerCase();
    const college = $("regCollege").value.trim();
    const branch = $("regBranch").value.trim();
    const semester = $("regSemester").value;
    const phone = $("regPhone").value.trim();

    if (!name || !email || !college || !branch || !semester || !phone) {
        showToast("Please fill all details.");
        return;
    }

    const selectedEvent = events.find(e => e.id === eventId);
    if (!selectedEvent) {
        showToast("Event not found.");
        return;
    }

    selectedEvent.registrations = selectedEvent.registrations || [];

    const alreadyRegistered = selectedEvent.registrations.some(
        r => r.email.toLowerCase() === email
    );

    if (alreadyRegistered) {
        showToast("You have already registered for this event.");
        return;
    }

    const registration = {
        id: Date.now().toString(),
        eventId,
        name,
        email,
        college,
        branch,
        semester,
        phone,
        status: "Pending",
        registeredAt: new Date().toLocaleDateString()
    };

    selectedEvent.registrations.push(registration);
    applications.push(registration);

    studentProfile = { name, email, college, branch, semester, phone };

    saveData();
    closeModal();
    showToast("Registration submitted successfully!");
    renderApp();
}

function renderApplications() {
    const pageContent = $("pageContent");

    if (applications.length === 0) {
        pageContent.innerHTML = `<div class="empty-state"><h3>No registrations yet</h3><p>Your registered events will appear here.</p></div>`;
        return;
    }

    pageContent.innerHTML = `
        <div class="event-grid">
            ${applications.map(app => {
                const event = events.find(e => e.id === app.eventId);
                return `
                    <div class="event-card">
                        <h3>${escapeHTML(event?.title || "Event")}</h3>
                        <p>Registered as: ${escapeHTML(app.name)}</p>
                        <p>Status: <strong>${escapeHTML(app.status)}</strong></p>
                        <p>Date: ${escapeHTML(event?.date || "N/A")}</p>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}

function renderPasses() {
    const approved = applications.filter(app => app.status === "Approved");
    const pageContent = $("pageContent");

    if (approved.length === 0) {
        pageContent.innerHTML = `<div class="empty-state"><h3>No passes available</h3><p>Your approved event passes will appear here.</p></div>`;
        return;
    }

    pageContent.innerHTML = approved.map(app => {
        const event = events.find(e => e.id === app.eventId);
        return `
            <div class="event-card">
                <h3>${escapeHTML(event?.title || "Event")}</h3>
                <p>Name: ${escapeHTML(app.name)}</p>
                <p>Email: ${escapeHTML(app.email)}</p>
                <p>Registration ID: ${escapeHTML(app.id)}</p>
                <h3>APPROVED PASS</h3>
            </div>
        `;
    }).join("");
}

function renderDashboard() {
    const pageContent = $("pageContent");

    const totalRegistrations = events.reduce(
        (sum, event) => sum + (event.registrations?.length || 0), 0
    );

    pageContent.innerHTML = `
        <div class="dashboard-stats">
            <div class="stat-card"><h2>${events.length}</h2><p>Total Events</p></div>
            <div class="stat-card"><h2>${totalRegistrations}</h2><p>Total Registrations</p></div>
            <div class="stat-card"><h2>${applications.filter(a => a.status === "Pending").length}</h2><p>Pending Requests</p></div>
        </div>

        <button onclick="navigate('manage')">Create New Event</button>

        <h3>Recent Events</h3>
        <div class="event-grid">
            ${events.length ? events.map(event => `
                <div class="event-card">
                    <h3>${escapeHTML(event.title)}</h3>
                    <p>${escapeHTML(event.date)}</p>
                    <p>${event.registrations?.length || 0} participants</p>
                </div>
            `).join("") : `<p>No events created yet.</p>`}
        </div>
    `;
}

function renderManageEvents() {
    const pageContent = $("pageContent");

    pageContent.innerHTML = `
        <button onclick="showEventForm()">+ Create New Event</button>
        <div class="event-grid">
            ${events.length ? events.map(event => `
                <div class="event-card">
                    <h3>${escapeHTML(event.title)}</h3>
                    <p>${escapeHTML(event.date)} | ${escapeHTML(event.venue)}</p>
                    <p>Participants: ${event.registrations?.length || 0}</p>
                    <button onclick="showEventForm('${event.id}')">Edit</button>
                    <button onclick="deleteEvent('${event.id}')">Delete</button>
                    <button onclick="viewParticipants('${event.id}')">Participants</button>
                </div>
            `).join("") : `<div class="empty-state"><h3>No events created</h3><p>Create your first event to get started.</p></div>`}
        </div>
    `;
}

function showEventForm(id = null) {
    editingEventId = id;
    const event = id ? events.find(e => e.id === id) : {};

    $("modalContent").innerHTML = `
        <h2>${id ? "Edit Event" : "Create New Event"}</h2>
        <form onsubmit="saveEvent(event)">
            <input id="eventTitle" placeholder="Event Title" value="${escapeHTML(event.title || "")}" required>
            <textarea id="eventDescription" placeholder="Event Description" required>${escapeHTML(event.description || "")}</textarea>
            <select id="eventCategory" required>
                <option value="">Select Category</option>
                ${["Technical","Cultural","Sports","Workshop","Other"].map(c => `<option value="${c}" ${event.category === c ? "selected" : ""}>${c}</option>`).join("")}
            </select>
            <input type="date" id="eventDate" value="${escapeHTML(event.date || "")}" required>
            <input type="time" id="eventTime" value="${escapeHTML(event.time || "")}" required>
            <input id="eventVenue" placeholder="Venue" value="${escapeHTML(event.venue || "")}" required>
            <input id="eventOrganizer" placeholder="Organizer Name" value="${escapeHTML(event.organizer || "")}" required>
            <button type="submit">${id ? "Update Event" : "Publish Event"}</button>
            <button type="button" onclick="closeModal()">Cancel</button>
        </form>
    `;

    $("modal")?.classList.add("active");
}

function saveEvent(event) {
    event.preventDefault();

    const eventData = {
        id: editingEventId || Date.now().toString(),
        title: $("eventTitle").value.trim(),
        description: $("eventDescription").value.trim(),
        category: $("eventCategory").value,
        date: $("eventDate").value,
        time: $("eventTime").value,
        venue: $("eventVenue").value.trim(),
        organizer: $("eventOrganizer").value.trim(),
        status: "Open",
        registrations: editingEventId
            ? events.find(e => e.id === editingEventId).registrations || []
            : []
    };

    if (editingEventId) {
        events = events.map(e => e.id === editingEventId ? eventData : e);
        showToast("Event updated successfully!");
    } else {
        events.push(eventData);
        showToast("Event published successfully!");
    }

    saveData();
    closeModal();
    renderApp();
}

function deleteEvent(id) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    events = events.filter(e => e.id !== id);
    applications = applications.filter(a => a.eventId !== id);

    saveData();
    showToast("Event deleted.");
    renderApp();
}

function viewParticipants(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const participants = event.registrations || [];

    $("modalContent").innerHTML = `
        <h2>Participants - ${escapeHTML(event.title)}</h2>
        ${participants.length ? participants.map(p => `
            <div class="participant-card">
                <h3>${escapeHTML(p.name)}</h3>
                <p>Email: ${escapeHTML(p.email)}</p>
                <p>College: ${escapeHTML(p.college)}</p>
                <p>Branch: ${escapeHTML(p.branch)}</p>
                <p>Semester: ${escapeHTML(p.semester)}</p>
                <p>Phone: ${escapeHTML(p.phone)}</p>
                <p>Status: ${escapeHTML(p.status)}</p>
                ${p.status === "Pending" ? `
                    <button onclick="updateRegistration('${eventId}','${p.id}','Approved')">Approve</button>
                    <button onclick="updateRegistration('${eventId}','${p.id}','Rejected')">Reject</button>
                ` : ""}
            </div>
        `).join("") : `<p>No registrations yet.</p>`}
        <button onclick="closeModal()">Close</button>
    `;

    $("modal")?.classList.add("active");
}

function updateRegistration(eventId, registrationId, status) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const registration = event.registrations.find(r => r.id === registrationId);
    if (!registration) return;

    registration.status = status;

    const app = applications.find(a => a.id === registrationId);
    if (app) app.status = status;

    saveData();
    showToast(`Registration ${status.toLowerCase()}.`);
    viewParticipants(eventId);
}

function renderProfile() {
    const pageContent = $("pageContent");

    pageContent.innerHTML = `
        <div class="profile-card">
            <h2>My Profile</h2>
            <form onsubmit="saveProfile(event)">
                <input id="profileNameInput" placeholder="Full Name" value="${escapeHTML(studentProfile.name || "")}" required>
                <input id="profileEmailInput" type="email" placeholder="Email" value="${escapeHTML(studentProfile.email || "")}" required>
                <input id="profileCollegeInput" placeholder="College" value="${escapeHTML(studentProfile.college || "")}">
                <input id="profileBranchInput" placeholder="Branch" value="${escapeHTML(studentProfile.branch || "")}">
                <input id="profileSemesterInput" placeholder="Semester" value="${escapeHTML(studentProfile.semester || "")}">
                <input id="profilePhoneInput" placeholder="Phone Number" value="${escapeHTML(studentProfile.phone || "")}">
                <button type="submit">Save Profile</button>
            </form>
        </div>
    `;
}

function saveProfile(event) {
    event.preventDefault();

    studentProfile = {
        name: $("profileNameInput").value.trim(),
        email: $("profileEmailInput").value.trim(),
        college: $("profileCollegeInput").value.trim(),
        branch: $("profileBranchInput").value.trim(),
        semester: $("profileSemesterInput").value.trim(),
        phone: $("profilePhoneInput").value.trim()
    };

    saveData();

    const profileName = $("profileName");
    const profileEmail = $("profileEmail");

    if (profileName) profileName.textContent = studentProfile.name;
    if (profileEmail) profileEmail.textContent = studentProfile.email;

    showToast("Profile saved successfully!");
}

function closeModal() {
    $("modal")?.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", () => {
    // Clear older sample events once so the event list starts empty.
    if (!localStorage.getItem("cc_empty_events_initialized")) {
        events = [];
        localStorage.setItem("cc_events", JSON.stringify(events));
        localStorage.setItem("cc_empty_events_initialized", "true");
    }

    if (!Array.isArray(events)) events = [];
    if (!Array.isArray(applications)) applications = [];

    if ($("profileName")) $("profileName").textContent = studentProfile.name || "Student User";
    if ($("profileEmail")) $("profileEmail").textContent = studentProfile.email || "student@campus.edu";

    renderApp();
});