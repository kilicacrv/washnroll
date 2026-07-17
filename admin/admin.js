// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// 🚨 TODO: REPLACE WITH YOUR FIREBASE CONFIG
// ==========================================
const firebaseConfig = {
  // paste your config object here!
  // apiKey: "...",
  // authDomain: "...",
  // projectId: "...",
  // storageBucket: "...",
  // messagingSenderId: "...",
  // appId: "..."
};

let app, auth, db;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase not configured correctly yet.", e);
}

// UI Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const userEmailSpan = document.getElementById('user-email');
const bookingsBody = document.getElementById('bookings-body');
const refreshBtn = document.getElementById('refresh-btn');

// ==========================================
// AUTHENTICATION
// ==========================================
if (auth) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      loginSection.style.display = 'none';
      dashboardSection.style.display = 'block';
      userEmailSpan.textContent = user.email;
      loadBookings();
    } else {
      // User is signed out
      loginSection.style.display = 'flex';
      dashboardSection.style.display = 'none';
      userEmailSpan.textContent = '';
    }
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;

    signInWithEmailAndPassword(auth, email, password)
      .catch((error) => {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
      });
  });

  logoutBtn.addEventListener('click', () => {
    signOut(auth);
  });
}

// ==========================================
// DATABASE (FIRESTORE)
// ==========================================
function loadBookings() {
  if (!db) return;
  
  const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  
  // Real-time listener
  onSnapshot(q, (snapshot) => {
    bookingsBody.innerHTML = '';
    
    if (snapshot.empty) {
      bookingsBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No bookings found.</td></tr>';
      return;
    }

    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const id = docSnapshot.id;
      
      const tr = document.createElement('tr');
      
      const dateStr = data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleString() : 'N/A';
      
      tr.innerHTML = `
        <td>
          <div style="font-weight:700">${data.selectedDate || 'N/A'}</div>
          <div style="color:var(--text-muted); font-size:0.85rem">${data.selectedTime || ''}</div>
          <div style="color:var(--text-muted); font-size:0.75rem; margin-top:4px;">Booked: ${dateStr}</div>
        </td>
        <td>
          <div style="font-weight:700">${data.planName}</div>
          <div style="color:var(--text-muted); font-size:0.85rem">Addons: ${data.addons ? data.addons.join(', ') : 'None'}</div>
        </td>
        <td>${data.vehicleType}</td>
        <td style="font-weight:800; color:var(--navy)">AED ${data.grandTotal}</td>
        <td>
          <div style="font-weight:600">${data.emirate}</div>
          <div style="color:var(--text-muted); font-size:0.85rem">${data.address}</div>
        </td>
        <td>
          <span class="status-badge status-${data.status || 'pending'}">${(data.status || 'pending').toUpperCase()}</span>
        </td>
        <td>
          <button class="action-btn btn-complete" onclick="updateStatus('${id}', 'completed')">✓</button>
          <button class="action-btn btn-cancel" onclick="updateStatus('${id}', 'cancelled')">✕</button>
        </td>
      `;
      bookingsBody.appendChild(tr);
    });
  }, (error) => {
    console.error("Error fetching bookings: ", error);
  });
}

// Global function to update status from inline onclick
window.updateStatus = async (id, status) => {
  if (!db) return;
  try {
    const docRef = doc(db, "bookings", id);
    await updateDoc(docRef, { status: status });
  } catch (e) {
    console.error("Error updating document: ", e);
    alert("Could not update status.");
  }
};

if (refreshBtn) {
  refreshBtn.addEventListener('click', loadBookings);
}
