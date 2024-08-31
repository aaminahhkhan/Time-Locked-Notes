// Encrypt data with a password using the Web Crypto API
async function encryptData(data, password) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const passwordBuffer = encoder.encode(password);
  
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
  
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      dataBuffer
    );
  
    return { iv, salt, encryptedData: new Uint8Array(encryptedData) };
  }
  
  // Decrypt data with a password using the Web Crypto API
  async function decryptData(encryptedData, password, iv, salt) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
  
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
  
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  
    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encryptedData
    );
  
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  }
  
  // Save the note with encryption and start the timer
  async function saveNote() {
    const noteInputElement = document.getElementById("noteInput");
    const timerInput = document.getElementById("timerInput").value;
    const password = prompt("Please enter a password to secure your note:");
  
    if (!noteInputElement.value || !timerInput || !password) {
      alert("Please enter a note, set a timer, and provide a password.");
      return;
    }
  
    const note = noteInputElement.value;
    noteInputElement.value = ''; // Clear the text area to hide the note
  
    const currentTime = Date.now();
    const revealTime = currentTime + timerInput * 1000; // Convert timerInput to milliseconds
  
    // Encrypt note
    const { iv, salt, encryptedData } = await encryptData(note, password);
  
    // Store encrypted note, reveal time, IV, and salt in local storage
    localStorage.setItem("hiddenNote", JSON.stringify(Array.from(encryptedData)));
    localStorage.setItem("revealTime", revealTime.toString());
    localStorage.setItem("iv", JSON.stringify(Array.from(iv)));
    localStorage.setItem("salt", JSON.stringify(Array.from(salt)));
  
    startCountdown(revealTime); // Start the countdown timer
  
    alert(`Note saved! It will be visible in ${timerInput} seconds.`);
  }
  
  // Start the countdown timer
  function startCountdown(revealTime) {
    const countdownElement = document.getElementById("countdown");
    countdownElement.style.display = "block";
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const timeLeft = revealTime - currentTime;
  
      if (timeLeft <= 0) {
        clearInterval(interval);
        countdownElement.textContent = "Your note is now available!";
        checkNoteVisibility(); // Reveal the note when the countdown ends
      } else {
        const seconds = Math.floor((timeLeft / 1000) % 60);
        const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
        const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  
        countdownElement.textContent = `Time left: ${days}d ${hours}h ${minutes}m ${seconds}s`;
      }
    }, 1000);
  }
  
  // Check if the note should be revealed
  async function checkNoteVisibility() {
    const currentTime = Date.now();
    const revealTime = localStorage.getItem("revealTime");
  
    if (revealTime && currentTime >= parseInt(revealTime, 10)) {
      const encryptedDataArray = JSON.parse(localStorage.getItem("hiddenNote"));
      const ivArray = JSON.parse(localStorage.getItem("iv"));
      const saltArray = JSON.parse(localStorage.getItem("salt"));
  
      const encryptedData = new Uint8Array(encryptedDataArray);
      const iv = new Uint8Array(ivArray);
      const salt = new Uint8Array(saltArray);
  
      const password = prompt("Please enter the password to decrypt your note:");
      try {
        const decryptedNote = await decryptData(encryptedData, password, iv, salt);
        document.getElementById("noteText").textContent = decryptedNote;
        document.getElementById("note").style.display = "block";
  
        // Clean up local storage
        localStorage.removeItem("hiddenNote");
        localStorage.removeItem("revealTime");
        localStorage.removeItem("iv");
        localStorage.removeItem("salt");
      } catch (error) {
        alert("Incorrect password. Unable to decrypt the note.");
      }
    }
  }
  
  // Check if access to note should be unlocked
  function unlockAccess() {
    const accessPassword = document.getElementById("accessPassword").value;
    const storedAccessPassword = localStorage.getItem("accessPassword");
  
    if (accessPassword === storedAccessPassword) {
      document.getElementById("noteSection").style.display = "block";
      document.getElementById("passwordSection").style.display = "none";
      checkNoteVisibility();
    } else {
      alert("Incorrect password.");
    }
  }
  
  // Initialize the app
  document.addEventListener("DOMContentLoaded", () => {
    const revealTime = localStorage.getItem("revealTime");
    if (revealTime) {
      document.getElementById("passwordSection").style.display = "block";
    } else {
      document.getElementById("noteSection").style.display = "block";
    }
    checkNoteVisibility();
  });
  