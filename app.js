const API_URL = '/api';
let allCampaigns = [];

const campaignGrid = document.getElementById('campaignGrid');
const categoryFilter = document.getElementById('categoryFilter');
const campaignForm = document.getElementById('campaignForm');
const modal = document.getElementById('volunteerModal');
const volunteerForm = document.getElementById('volunteerForm');

// Fetch campaigns on page load
async function fetchCampaigns() {
  try {
    const res = await fetch(`${API_URL}/campaigns`);
    allCampaigns = await res.json();
    renderCampaigns(allCampaigns);
  } catch (err) {
    console.error('Error fetching campaigns:', err);
  }
}

// Render campaign cards
function renderCampaigns(campaigns) {
  campaignGrid.innerHTML = '';

  if (campaigns.length === 0) {
    campaignGrid.innerHTML = '<p>No outreach campaigns found. Create one below!</p>';
    return;
  }

  campaigns.forEach(c => {
    const spotsLeft = c.volunteersNeeded - c.volunteersRegistered;
    const progressPercent = Math.min(100, (c.volunteersRegistered / c.volunteersNeeded) * 100);
    const isFull = spotsLeft <= 0;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div>
        <span class="badge">${c.category}</span>
        <h3>${c.title}</h3>
        <div class="meta">
          <strong>${c.organization}</strong> • ${c.location} • ${c.date}
        </div>
        <p>${c.description}</p>
      </div>
      <div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        <div class="meta">
          ${c.volunteersRegistered} / ${c.volunteersNeeded} volunteers registered
        </div>
        <button 
          class="btn btn-primary" 
          style="width: 100%;" 
          ${isFull ? 'disabled' : ''} 
          onclick="openModal('${c._id}', '${c.title.replace(/'/g, "\\'")}')">
          ${isFull ? 'Spots Filled' : 'Join as Volunteer'}
        </button>
      </div>
    `;
    campaignGrid.appendChild(card);
  });
}

// Filter by category
categoryFilter.addEventListener('change', (e) => {
  const selected = e.target.value;
  if (selected === 'All') {
    renderCampaigns(allCampaigns);
  } else {
    renderCampaigns(allCampaigns.filter(c => c.category === selected));
  }
});

// Create new campaign
campaignForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    title: document.getElementById('title').value,
    organization: document.getElementById('organization').value,
    category: document.getElementById('category').value,
    location: document.getElementById('location').value,
    date: document.getElementById('date').value,
    volunteersNeeded: Number(document.getElementById('volunteersNeeded').value),
    description: document.getElementById('description').value
  };

  const res = await fetch(`${API_URL}/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    campaignForm.reset();
    fetchCampaigns();
  }
});

// Modal Controls
window.openModal = (id, title) => {
  document.getElementById('modalCampaignId').value = id;
  document.getElementById('modalTitle').innerText = `Join: ${title}`;
  modal.classList.remove('hidden');
};

document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');

// Submit Volunteer Registration
volunteerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    campaignId: document.getElementById('modalCampaignId').value,
    name: document.getElementById('volName').value,
    email: document.getElementById('volEmail').value,
    phone: document.getElementById('volPhone').value
  };

  const res = await fetch(`${API_URL}/volunteer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (res.ok) {
    alert(data.message);
    volunteerForm.reset();
    modal.classList.add('hidden');
    fetchCampaigns();
  } else {
    alert(data.error);
  }
});

// Initialize
fetchCampaigns();
