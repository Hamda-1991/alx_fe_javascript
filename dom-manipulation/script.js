const serverUrl = 'https://jsonplaceholder.typicode.com/posts';
let quotes = [];
let selectedCategory = "All"; // Track the currently selected category

// Load existing quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [];
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Fetch quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(serverUrl);
    const serverQuotes = await response.json();

    const transformedQuotes = serverQuotes.map(item => ({
      text: item.title,
      category: "General" // Default category for mock data
    }));

    return transformedQuotes;
  } catch (error) {
    console.error("Failed to fetch quotes from server", error);
  }
}

// Post new quotes to the server
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(serverUrl, {
      method: 'POST',
      body: JSON.stringify(quote),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Posted to server:', data);
  } catch (error) {
    console.error("Failed to post quote to server", error);
  }
}

// Sync quotes with the server
function syncQuotesWithServer() {
  fetchQuotesFromServer().then(serverQuotes => {
    if (serverQuotes) {
      resolveConflicts(serverQuotes);

      quotes = [...new Set([...quotes, ...serverQuotes])];
      saveQuotes();
      displayQuotes();
      alert("Quotes synced with server!");
    }
  });
}

// Resolve conflicts with server data
function resolveConflicts(serverQuotes) {
  const conflictQuotes = serverQuotes.filter(serverQuote => 
    !quotes.some(localQuote => localQuote.text === serverQuote.text)
  );

  if (conflictQuotes.length > 0) {
    alert(`New quotes added from server: ${conflictQuotes.length}`);
    quotes.push(...conflictQuotes);
    saveQuotes();
  }
}

// Display quotes based on selected category
function displayQuotes() {
  const quoteContainer = document.getElementById("quoteContainer");
  quoteContainer.innerHTML = "";

  const filteredQuotes = selectedCategory === "All" 
    ? quotes 
    : quotes.filter(quote => quote.category === selectedCategory);

  filteredQuotes.forEach(quote => {
    const quoteElement = document.createElement("p");
    quoteElement.textContent = `${quote.category}: ${quote.text}`;
    quoteContainer.appendChild(quoteElement);
  });
}

// Display a random quote
function displayRandomQuote() {
  if (quotes.length === 0) return;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.textContent = `${randomQuote.category}: ${randomQuote.text}`;
}

// Populate category dropdown
function populateCategories() {
  const categories = ["All", "General", "Motivational", "Funny"];
  const categoryFilter = document.getElementById("categoryFilter");

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Filter quotes by category
function filterQuotesByCategory(category) {
  selectedCategory = category; // Update selected category
  displayQuotes(); // Display quotes based on the selected category
}

// Event listener for category filter change
document.getElementById("categoryFilter").addEventListener("change", (event) => {
  filterQuotesByCategory(event.target.value);
});

// Event listener for random quote button
document.getElementById("randomQuoteBtn").addEventListener("click", displayRandomQuote);

// Initialize application
loadQuotes();
displayQuotes();
populateCategories();
setInterval(syncQuotesWithServer, 10000);
