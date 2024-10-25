const serverUrl = 'https://jsonplaceholder.typicode.com/posts';
let quotes = [];

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
      category: "General"
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

// Display quotes on the page
function displayQuotes(filteredQuotes = quotes) {
  const quoteContainer = document.getElementById("quoteContainer");
  quoteContainer.innerHTML = "";

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
  const categories = ["General", "Motivational", "Funny"];
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
  const filteredQuotes = category === "All"
    ? quotes
    : quotes.filter(quote => quote.category === category);

  displayQuotes(filteredQuotes);
}

loadQuotes();
displayQuotes();
populateCategories();
setInterval(syncQuotesWithServer, 10000);
