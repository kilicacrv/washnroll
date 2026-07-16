document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Sticky Header Scroll Effect
  // ==========================================
  const header = document.getElementById('main-header');
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Init on page load


  // ==========================================
  // 2. Mobile Menu Toggle
  // ==========================================
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNavMenu = document.getElementById('mobile-nav-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  const toggleMenu = () => {
    menuToggle.classList.toggle('open');
    mobileNavMenu.classList.toggle('open');
  };

  const closeMenu = () => {
    menuToggle.classList.remove('open');
    mobileNavMenu.classList.remove('open');
  };

  menuToggle.addEventListener('click', toggleMenu);
  
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });


  // ==========================================
  // 3. Dynamic Pricing Toggles (Sedan | Mid SUV | Lrg SUV)
  // ==========================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  // Price Database
  const pricingData = {
    sedan: {
      essential: '219',
      premium: '349',
      elite: '549',
      maintenance: '399'
    },
    midsuv: {
      essential: '269',
      premium: '449',
      elite: '649',
      maintenance: '499'
    },
    lrgsuv: {
      essential: '319',
      premium: '549',
      elite: '749',
      maintenance: '599'
    }
  };

  // Human-readable labels for WhatsApp CTA text
  const vehicleLabels = {
    sedan: 'Sedan',
    midsuv: 'Mid-Size SUV',
    lrgsuv: 'Large SUV'
  };

  let currentVehicleType = 'sedan';

  const updatePricing = (vehicleType) => {
    currentVehicleType = vehicleType;
    const selectedPrices = pricingData[vehicleType];
    const vehicleLabel = vehicleLabels[vehicleType];
    
    // 1. Update all price value text nodes (Desktop table & Mobile cards)
    const priceElements = document.querySelectorAll('.price-val');
    priceElements.forEach(elem => {
      const plan = elem.getAttribute('data-plan');
      if (selectedPrices[plan]) {
        elem.textContent = selectedPrices[plan];
      }
    });
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const activeTab = e.currentTarget;
      const vehicleType = activeTab.getAttribute('data-vehicle');

      // Update active state for all tabs
      tabButtons.forEach(button => {
        if (button.getAttribute('data-vehicle') === vehicleType) {
          button.classList.add('active');
          button.setAttribute('aria-selected', 'true');
        } else {
          button.classList.remove('active');
          button.setAttribute('aria-selected', 'false');
        }
      });

      // Update prices and links
      updatePricing(vehicleType);
    });
  });

  // Initial pricing update on load (Sedan selected by default)
  updatePricing('sedan');


  // ==========================================
  // 4. Scroll Spy: Active Link Highlighting
  // ==========================================
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  const scrollSpy = () => {
    let currentId = 'home';
    
    // Find active section
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120; // accounting for sticky header height
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    // Highlight corresponding navigation links
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', scrollSpy);
  scrollSpy(); // init


  // ==========================================
  // 5. Checkout & Add-ons Modal Logic
  // ==========================================
  let currentPlanBasePrice = 0;
  let currentPlanName = '';
  let selectedAddons = [];

  const checkoutBtns = document.querySelectorAll('.checkout-btn');
  const modal = document.getElementById('checkout-modal');
  
  if (modal) {
    const closeBtn = document.getElementById('close-modal-btn');
    const addonsContainer = document.getElementById('modal-addons-container');
    const modalVehicleDisplay = document.getElementById('modal-vehicle-display');
    const modalPlanName = document.getElementById('modal-plan-name');
    const modalPlanPrice = document.getElementById('modal-plan-price');
    const modalBaseTotal = document.getElementById('modal-base-total');
    const modalAddonsTotal = document.getElementById('modal-addons-total');
    const modalGrandTotal = document.getElementById('modal-grand-total');
    const confirmBtn = document.getElementById('confirm-booking-btn');

    // Parse add-ons from the DOM
    const availableAddons = [];
    document.querySelectorAll('.addon-item').forEach(item => {
      const nameElem = item.querySelector('.addon-name');
      const priceElem = item.querySelector('.addon-price');
      if (nameElem && priceElem) {
        const name = nameElem.textContent.trim();
        const price = parseInt(priceElem.textContent.replace(/[^0-9]/g, ''), 10);
        availableAddons.push({ name, price });
      }
    });

    const renderAddons = () => {
      addonsContainer.innerHTML = '';
      availableAddons.forEach((addon, index) => {
        const label = document.createElement('label');
        label.className = 'addon-checkbox-item';
        label.innerHTML = `
          <input type="checkbox" data-index="${index}" value="${addon.price}">
          <div class="addon-details">
            <span class="name">${addon.name}</span>
            <span class="price">AED ${addon.price}</span>
          </div>
        `;
        
        const checkbox = label.querySelector('input');
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            selectedAddons.push(addon);
          } else {
            selectedAddons = selectedAddons.filter(a => a.name !== addon.name);
          }
          updateTotals();
        });
        
        addonsContainer.appendChild(label);
      });
    };

    const updateTotals = () => {
      const addonsSum = selectedAddons.reduce((sum, item) => sum + item.price, 0);
      const grandSum = currentPlanBasePrice + addonsSum;

      modalBaseTotal.textContent = `AED ${currentPlanBasePrice}`;
      modalAddonsTotal.textContent = `AED ${addonsSum}`;
      modalGrandTotal.textContent = `AED ${grandSum}`;
    };

    const openModal = (planId, planName) => {
      currentPlanName = planName;
      currentPlanBasePrice = parseInt(pricingData[currentVehicleType][planId], 10);
      selectedAddons = []; // Reset selections
      
      modalVehicleDisplay.textContent = vehicleLabels[currentVehicleType];
      modalPlanName.textContent = planName;
      modalPlanPrice.textContent = `AED ${currentPlanBasePrice}`;
      
      renderAddons();
      updateTotals();
      
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    };

    checkoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const planId = btn.getAttribute('data-plan-id');
        const planName = btn.getAttribute('data-plan-name');
        openModal(planId, planName);
      });
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    confirmBtn.addEventListener('click', () => {
      const addonsSum = selectedAddons.reduce((sum, item) => sum + item.price, 0);
      const grandSum = currentPlanBasePrice + addonsSum;
      
      let msg = `Hello Wash N Roll,\n\nI would like to book the *${currentPlanName}* for my *${vehicleLabels[currentVehicleType]}*.\n\n`;
      
      if (selectedAddons.length > 0) {
        msg += `*Selected Add-ons:*\n`;
        selectedAddons.forEach(a => {
          msg += `- ${a.name} (AED ${a.price})\n`;
        });
        msg += `\n`;
      }
      
      msg += `*Total Price:* AED ${grandSum}\n\nPlease assist me with the booking.`;
      
      const url = `https://wa.me/971568300248?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
      closeModal();
    });
  }
});
