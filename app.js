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

  const updatePricing = (vehicleType) => {
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

    // 2. Update WhatsApp CTA buttons with pre-filled message including vehicle type
    const selectPlanButtons = document.querySelectorAll('a[href*="wa.me"]');
    selectPlanButtons.forEach(btn => {
      let href = btn.getAttribute('href');
      
      // We only want to rewrite plan CTAs, leaving Header and general buttons clean
      if (href.includes('subscribe')) {
        let planName = 'Membership';
        if (href.includes('Essential')) planName = 'Essential Care Membership';
        if (href.includes('Premium')) planName = 'Premium Care Membership';
        if (href.includes('Elite')) planName = 'Elite Care Membership';
        if (href.includes('Signature') || href.includes('Maintenance')) planName = 'Signature Detail';

        const encodedMsg = encodeURIComponent(`Hello Wash N Roll, I would like to subscribe to the ${planName} for my ${vehicleLabel}. Please assist me with the booking.`);
        btn.setAttribute('href', `https://wa.me/971568300248?text=${encodedMsg}`);
      }
    });
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active from all tabs
      tabButtons.forEach(button => {
        button.classList.remove('active');
        button.setAttribute('aria-selected', 'false');
      });

      // Add active to current
      const activeTab = e.currentTarget;
      activeTab.classList.add('active');
      activeTab.setAttribute('aria-selected', 'true');

      // Get vehicle and trigger update
      const vehicleType = activeTab.getAttribute('data-vehicle');
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
  scrollSpy(); // Initial call
});
