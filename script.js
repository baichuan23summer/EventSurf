const OPENAI_API_KEY = "*";

// Function to send preferences to ChatGPT and get matched events
async function getRecommendationsFromGPT(preferences, eventData) {
  const prompt = `
  Match the following user preferences to the event tags and provide reasons for the matches.

  User Preferences: ${preferences}

  Event Data:
  ${eventData.tags.map((tags, i) => `Event ${i}: ${tags.join(", ")}`).join("; ")}

  Respond with a JSON array of objects where each object contains:
  - "index" (event index)
  - "reason" (why this event matches the preferences).
  Example: [{"index": 0, "reason": "This event matches because it includes 'Data Analysis' and 'Python', which are in the user's preferences."}]
  `;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error("Error Response:", await response.text());
      throw new Error(`ChatGPT API Error: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content); // Expecting an array of { index, reason }
  } catch (error) {
    console.error("Error with API:", error);
    return [];
  }
}

const eventData = {
  name: [
    "CS Talk: Adam Blank",
    "Introduction to Data Analysis with Python",
    "Gauchos in Tech 3.0",
    "Working with Geospatial Data in R",
    "Research Computing - What to do when your work gets too big for your laptop",
    "Container-driven Reproducible Research Made Simple",
    "Intermediate data analysis with R",
    "Machine Learning"
  ],
  tags: [
    ["CS", "Talk", "Adam Blank"],
    ["Data Analysis", "Python"],
    ["Tech", "Gauchos", "Physics"],
    ["Data Science", "R"],
    ["CPU", "GPU", "RAM", "hard drive", "computer clusters"],
    ["Visual Studio Code", "R environment", "Python environments", "Jupyterlab", "RStudio", "Jetstream2"],
    ["data analysis", "R"],
    ["Machine Learning"]
  ],
  url: [
    "https://www.cs.ucsb.edu/happenings/announcement/cs-talk-adam-blank",
    "https://www.campuscalendar.ucsb.edu/event/introduction-to-data-analysis-with-python",
    "https://www.campuscalendar.ucsb.edu/event/gauchos-in-tech-3",
    "https://shoreline.ucsb.edu/library/rsvp_boot?id=2264303",
    "https://shoreline.ucsb.edu/library/rsvp_boot?id=2264676",
    "https://shoreline.ucsb.edu/library/rsvp_boot?id=2264302",
    "https://groups.google.com/u/1/a/library.ucsb.edu/g/carpentry/about?pli=1",
    "https://groups.google.com/u/1/a/library.ucsb.edu/g/carpentry/about"
  ],
  date: [
    "January 8, 2025",
    "January 14, 2025",
    "February 8th, 2025",
    "January 23th, 2025",
    "February 3rd, 2025",
    "February 5th, 2025",
    "February 18th, 2025",
    "week 8"
  ],
  location: [
    "Harold Frank Hall 1132",
    "UCSB Library Room 2509",
    "Henley Hall Auditorium",
    "UCSB Library Room 2509",
    "UCSB Library Room 2509",
    "UCSB Library Room 1312",
    "UCSB Library",
    "UCSB Library"
  ],
  time: [
    "10:00 AM - 11:00 AM",
    "10:00 AM - 12:30 PM",
    "9:00 AM - 12:30 PM",
    "1:30 PM – 4:30 PM",
    "12 PM – 1 PM",
    "1 PM – 4 PM",
    "TBD",
    "TBD"
  ]
};
var indexList = [];
var reasons = [];


// Update recommendEvents to integrate ChatGPT API
async function recommendEvents(text) {
  const eventList = document.getElementById("eventList");

  try {

    // Get matched events from GPT with reasons
    const recommendations = await getRecommendationsFromGPT(text, eventData);

    // Clear existing list
    eventList.innerHTML = "";

    if (recommendations.length === 0) {
      eventList.innerHTML = "<li>No events match your preferences.</li>";
    } else {
      var indexList = [];
      recommendations.forEach(({ index, reason }) => {
        indexList.push(index);
        reasons.push(reason);
        var postElement = document.createElement("div");
        postElement.classList.add("event-post");

        var imgElement = document.createElement("img");
        imgElement.src = `img0${Math.floor(Math.random() * 4)+1}.jpg`; // Use a default image if none is provided
        imgElement.alt = "Event Image";
        imgElement.classList.add("event-post-image");

        var contentElement = document.createElement("div");
        contentElement.classList.add("event-post-content");
        contentElement.innerHTML = `
            <h3><a href="${eventData.url[index]}" target="_blank">${eventData.name[index]}</a></h3>
            <p><strong>Date:</strong> ${eventData.date[index]}</p>
            <p><strong>Time:</strong> ${eventData.time[index]}</p>
            <p><strong>Location:</strong> ${eventData.location[index]}</p>
            <p><strong>Reason for recommendation:</strong> ${reason}</p>
        `;

        var actionsElement = document.createElement("div");
        actionsElement.classList.add("event-post-actions");
        actionsElement.innerHTML = `
            <button class="action-button" data-action="like" data-post-id="${Date.now()}", data-index="${index}">Like</button>
        `;

        postElement.appendChild(imgElement);
        postElement.appendChild(contentElement);
        postElement.appendChild(actionsElement);
        document.getElementById("eventList").appendChild(postElement);

        // Clear the form
        document.getElementById("eventForm").reset();
      });
    }
  } catch (error) {
    console.error("Error processing recommendations:", error);
    eventList.innerHTML = `<li>Failed to load recommendations. ${error.message}</li>`;
  }
}

async function fetchWithRetry(url, options, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options);
    if (response.ok) {
      return response.json();
    }
    if (response.status === 429 && i < retries - 1) {
      console.warn(`Rate limit hit. Retrying in ${backoff}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
      backoff *= 2; // Exponential backoff
    } else {
      throw new Error(`API Error: ${response.status}`);
    }
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

    var myEventsListItem = document.createElement("div");
    myEventsListItem.appendChild(postElement.cloneNode(true));
    document.getElementById("myEventsList").appendChild(myEventsListItem);

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


document.getElementById("eventList").addEventListener("click", function (event) {
  // Check if the clicked element is a "Like" button
  if (event.target.classList.contains("action-button")) {
    const postElement = event.target.closest(".event-post");
    const index = event.target.getAttribute("data-index");
    const reason = reasons[indexList.indexOf(index)];
    if (postElement) {
      var postElements = document.createElement("div");
      postElements.classList.add("event-post");

      var imgElement = document.createElement("img");
      imgElement.src = `img0${Math.floor(Math.random() * 4)+1}.jpg`; // Use a default image if none is provided
      imgElement.alt = "Event Image";
      imgElement.classList.add("event-post-image");

      var contentElement = document.createElement("div");
      contentElement.classList.add("event-post-content");
      contentElement.innerHTML = `
          <h3><a href="${eventData.url[index]}" target="_blank">${eventData.name[index]}</a></h3>
          <p><strong>Date:</strong> ${eventData.date[index]}</p>
          <p><strong>Time:</strong> ${eventData.time[index]}</p>
          <p><strong>Location:</strong> ${eventData.location[index]}</p>
          <p><strong>Reason for recommendation:</strong> ${reason}</p>
      `;


      postElements.appendChild(imgElement);
      postElements.appendChild(contentElement);
      document.getElementById("myEventsList").appendChild(postElements);

      // Clear the form
      document.getElementById("eventForm").reset();
    }
  }
});