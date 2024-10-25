const serverUrl = 'https://jsonplaceholder.typicode.com/posts';
let quotes = [];
let selectedCategory = "All";

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
function showRandomQuote() {
  if (quotes.length === 0) return;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.textContent = `${randomQuote.category}: ${randomQuote.text}`;
}

// Create a form for adding new quotes
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");
  const form = document.createElement("form");

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "Enter your quote";
  textInput.required = true;

  const categoryInput = document.createElement("select");
  const categories = ["General", "Motivational", "Funny"];
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryInput.appendChild(option);
  });

  const submitButton = document.createElement("button");
  submitButton.textContent = "Add Quote";
  submitButton.type = "submit";

  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(submitButton);
  
  // Add an event listener for the form submission
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const newQuote = {
      text: textInput.value,
      category: categoryInput.value
    };
    quotes.push(newQuote);
    saveQuotes();
    displayQuotes();
    postQuoteToServer(newQuote);
    form.reset(); // Clear the form after submission
  });

  formContainer.appendChild(form);
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
  selectedCategory = category;
  displayQuotes();
}

// Event listener for category filter change
document.getElementById("categoryFilter").addEventListener("change", (event) => {
  filterQuotesByCategory(event.target.value);
});

// Event listener for random quote button
document.getElementById("randomQuoteBtn").addEventListener("click", showRandomQuote);

// Export quotes to JSON file using Blob
function exportQuotes() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file using FileReader
function importQuotes(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedQuotes = JSON.parse(e.target.result);
        quotes = [...quotes, ...importedQuotes];
        saveQuotes();
        displayQuotes();
        alert("Quotes imported successfully!");
      } catch (error) {
        console.error("Failed to import quotes", error);
        alert("Invalid file format. Please upload a valid JSON file.");
      }
    };
    reader.readAsText(file);
  }
}

// Event listener for export button
document.getElementById("exportBtn").addEventListener("click", exportQuotes);

// Event listener for import file input
document.getElementById("importFile").addEventListener("change", importQuotes);

// Initialize application
loadQuotes();
displayQuotes();
populateCategories();
createAddQuoteForm(); // Create the form for adding quotes
setInterval(syncQuotesWithServer, 10000);
