// ===== Global Firebase Variables =====
let auth, db; // Declare at top level

// ===== Firebase Setup =====
function initializeFirebase() {
  try {
    // Use window.env for both production and development
    const firebaseConfig = {
      apiKey: window.env.FIREBASE_API_KEY,
      authDomain: window.env.FIREBASE_AUTH_DOMAIN,
      projectId: window.env.FIREBASE_PROJECT_ID,
      storageBucket: window.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: window.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: window.env.FIREBASE_APP_ID
    };

    // Rest of your function remains the same...
    if (Object.values(firebaseConfig).some(v => !v)) {
      console.error("Missing Firebase config values", firebaseConfig);
      return false;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log("🔥 Firebase initialized");
    }

    auth = firebase.auth();
    db = firebase.firestore();
    return true;
  } catch (error) {
    console.error("Firebase init failed:", error);
    return false;
  }
}

// ===== Enhanced Auth Management =====
let authPopupOpen = false;

async function handleGoogleLogin() {
  const loginBtn = document.getElementById('google-login');
  
  if (authPopupOpen) {
    console.log("Login popup already open");
    return;
  }

  try {
    // Set loading state
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    authPopupOpen = true;

    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
      login_hint: '' // Force fresh account selection
    });

    // Timeout for popup completion
    const authTimeout = setTimeout(() => {
      if (authPopupOpen) {
        console.log("Auth timeout reached");
        handleAuthError(loginBtn, { code: 'auth/timeout', message: 'Login timed out' });
      }
    }, 60000); // 1 minute timeout

    const result = await auth.signInWithPopup(provider);
    clearTimeout(authTimeout);
    
    console.log("Login success:", result.user);
    updateUIAfterLogin(result.user);
    renderPosts();
    
  } catch (error) {
    handleAuthError(loginBtn, error);
  } finally {
    authPopupOpen = false;
  }
}

function updateAuthUI(user) {
  const adminPanel = document.getElementById('blog-admin');
  const loginBtn = document.getElementById('google-login');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (user) {
    // User is logged in
    adminPanel.style.display = 'block';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    loginBtn.textContent = `Hi ${user.displayName?.split(' ')[0] || 'Admin'}`;
  } else {
    // User is logged out
    adminPanel.style.display = 'none';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    loginBtn.textContent = 'Admin Login';
  }
}

function handleAuthError(loginBtn, error) {
  console.error("Auth error:", error);
  loginBtn.disabled = false;
  
  if (error.code === 'auth/popup-closed-by-user') {
    loginBtn.textContent = 'Login interrupted - Try again';
  } else if (error.code === 'auth/timeout') {
    loginBtn.textContent = 'Login timed out - Retry';
    showErrorAlert("Login took too long. Please try again.");
  } else {
    loginBtn.textContent = 'Login failed - Retry';
    showErrorAlert(`Login error: ${error.message}`);
  }
  
  setTimeout(() => {
    if (!auth.currentUser) {
      loginBtn.textContent = 'Admin Login';
    }
  }, 3000);
}

function setupAuthHandlers() {
  // Persistent auth state
  auth.onAuthStateChanged(user => {
    updateAuthUI(user);
    if (user) renderPosts(); // Refresh posts if logged in
  });

  // Login button
  document.getElementById('google-login').addEventListener('click', handleGoogleLogin);
  
  // New logout button
  document.getElementById('logout-btn').addEventListener('click', () => {
    auth.signOut().catch(error => {
      console.error("Logout error:", error);
      showErrorAlert("Logout failed. Please try again.");
    });
  });
}

// ===== Blog Functions =====
function renderPosts() {
  db.collection("posts")
    .orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {
      const postsContainer = document.getElementById('blog-posts');
      postsContainer.innerHTML = '';
      
      snapshot.forEach(doc => {
        const post = doc.data();
        const postDate = post.createdAt?.toDate().toLocaleDateString() || 'Just now';
        
        postsContainer.innerHTML += `
          <div class="post-card">
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <div class="post-footer">
              <small>By ${post.author || 'Anonymous'}</small>
              <small>${postDate}</small>
            </div>
          </div>
        `;
      });
    }, error => {
      console.error("Posts error:", error);
      showErrorAlert("Error loading posts - please refresh");
    });
}

function setupPostForm() {
  document.getElementById('post-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      showErrorAlert('Please login first!');
      return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';

    db.collection("posts").add({
      title: document.getElementById('post-title').value,
      content: document.getElementById('post-content').value,
      author: auth.currentUser.displayName || 'Admin',
      authorId: auth.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      document.getElementById('post-form').reset();
      submitBtn.textContent = 'Published!';
      setTimeout(() => {
        submitBtn.textContent = 'Publish';
        submitBtn.disabled = false;
      }, 2000);
    })
    .catch(error => {
      console.error("Post error:", error);
      submitBtn.textContent = 'Error - Try Again';
      submitBtn.disabled = false;
    });
  });
}

// ===== Carousel Functions ===== 
function setupCarousel() {
  const thumbnails = document.querySelectorAll('.thumbnail');
  const carouselImage = document.querySelector('.carousel-image img');
  const projectInfo = document.querySelector('.project-info');

  const projects = [
    {
      img: 'images/medanywhere.png',
      title: 'MEDANYWHERE - Telemedicine Platform',
      description: 'Developed a full-featured telemedicine web app that reduced patient wait times by 65% and increased doctor efficiency by 40%. Features include:',
      features: [
          "Secure video consultations",
          "Patient records management",
          "Prescription system",
          "Responsive design for all devices"
      ],
      result: "Helps clinics handle 30% more patients"
    },
    {
      img: 'images/cloudshamba.PNG',
      title: 'CLOUD SHAMBA - Agricultural Solution',
      description: 'Built a farmer-vet connection platform that enables:',
      features: [
          "Photo/video uploads for diagnosis",
          "Instant prescription system",
          "Disease database",
          "Multi-language support"
      ],
      result: "Reduces animal mortality by 25% in pilot regions"
    },
    {
      img: 'images/skill-match.png',
      title: 'SKILL-MATCH - Job Matching Platform',
      description: 'Developed a job portal that intelligently connects candidates with opportunities matching their exact skill sets:',
      features: [
          "Advanced skill-based matching algorithm",
          "User-friendly job seeker dashboard",
          "Employer talent search tools",
          "Real-time application tracking",
          "Secure login and profile management"
      ],
      result: "Increases successful job matches by 40% compared to traditional job boards"
    },
  ];

  let currentIndex = 0;

  function updateCarousel(index) {
    const project = projects[index];
    carouselImage.src = project.img;
    
    projectInfo.innerHTML = `
        <h2>${project.title}</h2>
        <p>${project.description}</p>
        <ul class="project-features">
            ${project.features.map(feat => `<li>${feat}</li>`).join('')}
        </ul>
        <div class="project-result">
            <strong>Result:</strong> ${project.result}
        </div>
        <a href="#contact" class="project-cta">Build something similar for me</a>
    `;
    
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnails[index].classList.add('active');
  }

  document.getElementById('prev-button').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + projects.length) % projects.length;
    updateCarousel(currentIndex);
  });

  document.getElementById('next-button').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % projects.length;
    updateCarousel(currentIndex);
  });

  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', () => {
      currentIndex = index;
      updateCarousel(currentIndex);
    });
  });

  updateCarousel(currentIndex);
}

// ===== Contact Form =====
function setupContactForm() {
  document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    if (!name || !email || !message) {
      showErrorAlert('Please fill all fields');
      return;
    }

    const whatsappLink = `https://wa.me/254715135257?text=Name:${encodeURIComponent(name)}%0AEmail:${encodeURIComponent(email)}%0AMessage:${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
  });
}

// ===== Main Initialization =====
window.addEventListener('DOMContentLoaded', () => {
  if (!initializeFirebase()) return;
  
  setupAuthHandlers();
  renderPosts();
  setupPostForm();
  setupCarousel();
  setupContactForm();
});

function showErrorAlert(message) {
  const alert = document.createElement('div');
  alert.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #ff4444;
    color: white;
    padding: 15px 25px;
    border-radius: 5px;
    z-index: 9999;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    animation: fadeIn 0.3s ease-out;
  `;
  
  alert.textContent = message;
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 300);
  }, 5000);
}