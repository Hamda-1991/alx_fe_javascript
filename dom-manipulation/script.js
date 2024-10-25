// URL of the mock API
const serverUrl = 'https://jsonplaceholder.typicode.com/posts';
let quotes = []; // Array to hold quotes

// Load existing quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [];
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Simulate fetching quotes from a server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(serverUrl);
    const serverQuotes = await response.json();

    // Transform API data to quote structure
    const transformedQuotes = serverQuotes.map(item => ({
      text: item.title,
      category: "General" // Example default category for mock data
    }));

    return transformedQuotes;
  } catch (error) {
    console.error("Failed to fetch quotes from server", error);
  }
}

// Simulate posting new quotes to the server
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

// Periodically fetch quotes from the server and sync with local storage
function syncQuotesWithServer() {
  fetchQuotesFromServer().then(serverQuotes => {
    if (serverQuotes) {
      resolveConflicts(serverQuotes);

      // Merge server quotes with local quotes
      quotes = [...new Set([...quotes, ...serverQuotes])];
      saveQuotes();
      displayQuotes(); // Refresh displayed quotes
      alert("Quotes synced with server!");
    }
  });
}

// Conflict resolution: Server data takes precedence
function resolveConflicts(serverQuotes) {
  const localQuotes = quotes;
  const conflictQuotes = [];

  serverQuotes.forEach(serverQuote => {
    if (!localQuotes.some(localQuote => localQuote.text === serverQuote.text)) {
      conflictQuotes.push(serverQuote);
    }
  });

  if (conflictQuotes.length > 0) {
    alert(`New quotes added from server: ${conflictQuotes.length}`);
    quotes.push(...conflictQuotes);
    saveQuotes();
  }
}

// Display quotes on the page
function displayQuotes(filteredQuotes = quotes) {
  const quoteContainer = document.getElementById("quoteContainer");
  quoteContainer.innerHTML = ""; // Clear existing content

  filteredQuotes.forEach(quote => {
    const quoteElement = document.createElement("p");
    quoteElement.textContent = `${quote.category}: ${quote.text}`;
    quoteContainer.appendChild(quoteElement);
  });
}

// Populate category options in a dropdown
function populateCategories() {
  const categories = ["General", "Motivational", "Funny"]; // Example categories
  const categoryFilter = document.getElementById("categoryFilter");

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Filter quotes by selected category
function filterQuotesByCategory(category) {
  const filteredQuotes = category === "All"
    ? quotes
    : quotes.filter(quote => quote.category === category);

  displayQuotes(filteredQuotes); // Display only filtered quotes
}

// Initialize the application
loadQuotes(); // Load from local storage on start
displayQuotes(); // Display quotes on start
populateCategories(); // Populate filter options on start
setInterval(syncQuotesWithServer, 10000); // Sync every 10 seconds