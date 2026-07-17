import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'


const supabaseUrl = 'https://fwdlzijqvcalwmibkdsk.supabase.co'
const supabaseKey = 'sb_publishable_ATWyF8mF33kenQoVQvnejA_kQFfAveW'

let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey)
} catch (e) {
  console.error("Supabase not configured correctly yet.", e);
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
async function checkUser() {
  if (!supabase) return;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    userEmailSpan.textContent = session.user.email;
    loadBookings();
  } else {
    loginSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
    userEmailSpan.textContent = '';
  }
}

// Listen for auth changes
if (supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    checkUser();
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      loginError.textContent = error.message;
      loginError.style.display = 'block';
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
  });

  // Initial check
  checkUser();
}

// ==========================================
// DATABASE (FIRESTORE -> SUPABASE)
// ==========================================
async function loadBookings() {
  if (!supabase) return;
  
  // Fetch initial data
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching bookings: ", error);
    return;
  }

  renderTable(bookings);

  // Set up Real-time subscription
  supabase
    .channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'bookings' },
      (payload) => {
        console.log('Change received!', payload);
        // Quick and dirty: just reload everything on any change
        // In a large app, you'd patch the specific row in the DOM
        loadBookingsSilently();
      }
    )
    .subscribe();
}

async function loadBookingsSilently() {
  if (!supabase) return;
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (!error) {
    renderTable(bookings);
  }
}

function renderTable(bookings) {
  bookingsBody.innerHTML = '';
  
  if (!bookings || bookings.length === 0) {
    bookingsBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No bookings found.</td></tr>';
    return;
  }

  bookings.forEach((data) => {
    const tr = document.createElement('tr');
    
    // Supabase returns dates as ISO strings
    const dateObj = new Date(data.created_at);
    const dateStr = dateObj.toLocaleString();
    
    tr.innerHTML = `
      <td>
        <div style="font-weight:700">${data.selected_date || 'N/A'}</div>
        <div style="color:var(--text-muted); font-size:0.85rem">${data.selected_time || ''}</div>
        <div style="color:var(--text-muted); font-size:0.75rem; margin-top:4px;">Booked: ${dateStr}</div>
      </td>
      <td>
        <div style="font-weight:700">${data.plan_name}</div>
        <div style="color:var(--text-muted); font-size:0.85rem">Addons: ${data.addons && data.addons.length ? data.addons.join(', ') : 'None'}</div>
      </td>
      <td>${data.vehicle_type}</td>
      <td style="font-weight:800; color:var(--navy)">AED ${data.grand_total}</td>
      <td>
        <div style="font-weight:600">${data.emirate}</div>
        <div style="color:var(--text-muted); font-size:0.85rem">${data.address}</div>
      </td>
      <td>
        <span class="status-badge status-${data.status || 'pending'}">${(data.status || 'pending').toUpperCase()}</span>
      </td>
      <td>
        <button class="action-btn btn-complete" onclick="updateStatus('${data.id}', 'completed')">✓</button>
        <button class="action-btn btn-cancel" onclick="updateStatus('${data.id}', 'cancelled')">✕</button>
      </td>
    `;
    bookingsBody.appendChild(tr);
  });
}

// Global function to update status from inline onclick
window.updateStatus = async (id, status) => {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: status })
      .eq('id', id);

    if (error) throw error;
  } catch (e) {
    console.error("Error updating document: ", e);
    alert("Could not update status.");
  }
};

if (refreshBtn) {
  refreshBtn.addEventListener('click', loadBookingsSilently);
}
