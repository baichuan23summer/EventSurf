let isSignedIn = false;

function updateAuthButtons() {
  const signInButton = document.getElementById("signInButton");
  const myEventsButton = document.getElementById("myEventsButton");

  if (isSignedIn) {
    signInButton.style.display = "none";
    myEventsButton.style.display = "inline-block"; // 显示 My Events
  } else {
    signInButton.style.display = "inline-block";
    myEventsButton.style.display = "none"; // 隐藏 My Events
  }
}

async function processPdf() {
  const fileInput = document.getElementById("pdfUpload");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please upload a PDF file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async function (event) {
    const arrayBuffer = event.target.result;

    try {
      let text = "";
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n";
      }

      recommendEvents(text);
    } catch (error) {
      console.error("Error reading the PDF:", error);
      alert("Failed to process the PDF. Please try again.");
    }
  };

  reader.readAsArrayBuffer(file);
}

function recommendEvents(text) {
  const eventList = document.getElementById("eventList");
  const events = [
    { name: "Concert XYZ", tags: ["music", "concert"] },
    { name: "Art Exhibition ABC", tags: ["art", "exhibition"] },
    { name: "Tech Conference 2023", tags: ["tech", "conference"] }
  ];

  const recommendations = events.filter((event) =>
    event.tags.some((tag) => text.toLowerCase().includes(tag))
  );

  eventList.innerHTML = "";
  if (recommendations.length === 0) {
    eventList.innerHTML = "<li>No events match your preferences.</li>";
  } else {
    recommendations.forEach((event) => {
      const li = document.createElement("li");
      li.textContent = event.name;
      eventList.appendChild(li);
    });
  }
}

// Function to show a specific page and hide others
function showPage(pageId) {
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => {
    page.style.display = "none"; // 隐藏所有页面
  });

  const selectedPage = document.getElementById(pageId);
  if (selectedPage) {
    selectedPage.style.display = "block"; // 显示选定页面
  }
}


// Simulated "database" to store registered users
let users = [];

// Show Page Function
function showPage(pageId) {
  // Hide all pages
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => {
    page.style.display = "none";
  });

  // Show the selected page
  const selectedPage = document.getElementById(pageId);
  if (selectedPage) {
    selectedPage.style.display = "block";
  }
}

// Handle Registration Form Submission
document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match. Please try again.");
    return;
  }

  // Store the new user in the "database"
  users.push({ username, email, password });
  alert("Registration successful!");

  // Clear the registration form fields
  document.getElementById("username").value = "";
  document.getElementById("registerEmail").value = "";
  document.getElementById("registerPassword").value = "";
  document.getElementById("confirmPassword").value = "";

  showPage("login"); // Redirect to the login page after successful registration
});

// Handle Login Form Submission
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // 验证用户登录（这里是模拟验证，替换为实际验证逻辑）
  const user1 = users.find((user) => user.email === email && user.password === password);

  if (user1) {
    alert("Login successful!");
    isSignedIn = true; // 更新登录状态
    updateAuthButtons(); // 更新按钮显示状态
    showPage("home"); // 跳转到主页
  } else {
    alert("Invalid email or password. Please try again.");
  }
});


// Redirect to Login Page from Sign In Button
document.getElementById("signInButton").addEventListener("click", function () {
  showPage("login");
});

// On page load, show the home page
window.onload = function () {
  showPage("home");
  updateAuthButtons();
};

  // Handle action button clicks (like, going, not going)
  document
    .getElementById("eventPostsContainer")
    .addEventListener("click", function (event) {
      if (event.target.classList.contains("action-button")) {
        var action = event.target.getAttribute("data-action");
        var postId = event.target.getAttribute("data-post-id");
        handleAction(action, postId);
        event.target.classList.toggle("active"); // Toggle active state
      }
    });

// Handle form submission for posting an event
document.getElementById("eventForm").addEventListener("submit", function (event) {
  event.preventDefault();

  // Get user input
  var title = document.getElementById("eventTitle").value;
  var date = document.getElementById("eventDate").value;
  var time = document.getElementById("eventTime").value;
  var venue = document.getElementById("eventVenue").value;
  var description = document.getElementById("eventDescription").value;
  var image = document.getElementById("eventImage").files[0];

  // Check which button was clicked
  const submitButton = event.submitter;

  if (submitButton.textContent === "Post Event") {
    // Handle "Post Event" functionality
    var postElement = document.createElement("div");
    postElement.classList.add("event-post");

    var imgElement = document.createElement("img");
    imgElement.src = image ? URL.createObjectURL(image) : "default-image.jpg"; // Use a default image if none is provided
    imgElement.alt = "Event Image";
    imgElement.classList.add("event-post-image");

    var contentElement = document.createElement("div");
    contentElement.classList.add("event-post-content");
    contentElement.innerHTML = `
        <h3>${title}</h3>
        <p><small>Posted on: ${new Date().toLocaleString()}</small></p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Venue:</strong> ${venue}</p>
        <p>${description}</p>
    `;

    var actionsElement = document.createElement("div");
    actionsElement.classList.add("event-post-actions");
    actionsElement.innerHTML = `
        <button class="action-button"  data-action="like" data-post-id="${Date.now()}">Like</button>
    `;

    postElement.appendChild(imgElement);
    postElement.appendChild(contentElement);
    postElement.appendChild(actionsElement);
    document.getElementById("eventList").appendChild(postElement);

    // Clear the form
    document.getElementById("eventForm").reset();
  } else if (submitButton.textContent === "Generate PDF Request") {
    // Handle "Generate PDF Request" functionality
    const eventDetails = {
      eventTitle: title,
      eventDate: date,
      eventTime: time,
      eventVenue: venue,
      eventDescription: description,
    };

    // Call the generatePdf function
    generatePdf(eventDetails);
  }
});

// Function to generate the PDF
async function generatePdf(eventDetails) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);

  // Set up fonts and styles
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const lineHeight = 15;
  let yPosition = 350;

  // Add content to the PDF
  const drawText = (text, x, y) => {
    page.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
  };

  // PDF Content
  drawText("Subject: Request to Host an Event at UCSB", 50, yPosition);
  yPosition -= lineHeight * 2;

  drawText(`Dear UCSB Event Coordinator,`, 50, yPosition);
  yPosition -= lineHeight * 2;

  drawText(`I am writing to request approval to host an event at UCSB. Below are the details:`, 50, yPosition);
  yPosition -= lineHeight * 2;

  drawText(`Event Title: ${eventDetails.eventTitle}`, 50, yPosition);
  yPosition -= lineHeight;

  drawText(`Event Date: ${eventDetails.eventDate}`, 50, yPosition);
  yPosition -= lineHeight;

  drawText(`Event Time: ${eventDetails.eventTime}`, 50, yPosition);
  yPosition -= lineHeight;

  drawText(`Event Venue: ${eventDetails.eventVenue}`, 50, yPosition);
  yPosition -= lineHeight;

  drawText(`Event Description: ${eventDetails.eventDescription}`, 50, yPosition);
  yPosition -= lineHeight * 2;

  drawText(`Thank you for considering my request. I look forward to your response.`, 50, yPosition);
  yPosition -= lineHeight * 2;

  drawText(`Sincerely,`, 50, yPosition);
  yPosition -= lineHeight;

  drawText(`Event Organizer`, 50, yPosition);

  // Save the PDF
  const pdfBytes = await pdfDoc.save();

  // Create a Blob and download link
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.getElementById("downloadLink");
  downloadLink.href = url;
  downloadLink.download = "Event_Request.pdf";

  // Show the download link
  document.getElementById("pdfDownloadLink").style.display = "block";
}

// Handle action button clicks (like, going, not going)
function handleAction(action, postId) {
  // Example: Send data to the server using Fetch API
  fetch("/api/post-action", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ action: action, postId: postId })
  })
    .then((response) => response.json())
    .then((data) => {
      // Update the count on the page based on the response
      updateCount(postId, action, data.count);
    })
    .catch((error) => console.error("Error:", error));
}

// Function to update the count of likes, going, or not going
function updateCount(postId, action, count) {
  var button = document.querySelector(
    `.action-button[data-post-id="${postId}"][data-action="${action}"]`
  );
  if (button) {
    button.textContent = `${action} (${count})`;
  }
}

// Initialize the map for the 'event-near-you' page
function initializeLeafletMap() {
  // 初始化地图，设置默认中心和缩放级别
  const map = L.map('map').setView([34.4140, -119.8489], 13); // UCSB 默认中心位置

  // 添加 OpenStreetMap 的 Tile Layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  // 搜索框功能
  const searchInput = document.getElementById('searchBox');
  searchInput.addEventListener('change', async () => {
      const address = searchInput.value;
      if (!address) return;

      try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
          const locations = await response.json();

          if (locations.length > 0) {
              const { lat, lon } = locations[0];
              const marker = L.marker([lat, lon]).addTo(map);
              map.setView([lat, lon], 14);
              alert(`Location found: ${address}`);
          } else {
              alert('Address not found. Please try again.');
          }
      } catch (error) {
          console.error('Error fetching location:', error);
          alert('Failed to fetch location. Try again later.');
      }
  });

  // 当前定位功能
  const locateButton = document.getElementById('locateButton');
  locateButton.addEventListener('click', () => {
      if (!navigator.geolocation) {
          alert('Geolocation is not supported by your browser.');
          return;
      }

      navigator.geolocation.getCurrentPosition(
          (position) => {
              const { latitude, longitude } = position.coords;
              const marker = L.marker([latitude, longitude]).addTo(map);
              map.setView([latitude, longitude], 14);
              alert('Your location has been marked!');
          },
          () => {
              alert('Unable to fetch your current location.');
          }
      );
  });
}

// 在页面加载完成后初始化地图
document.addEventListener('DOMContentLoaded', initializeLeafletMap);


document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("eventList").addEventListener("click", function (event) {
    if (event.target.classList.contains("action-button")) {
      alert("Like button clicked!");
    }
  });
});







