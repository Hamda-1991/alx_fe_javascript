// URL of the mock API
const serverUrl = 'https://jsonplaceholder.typicode.com/posts';

// Simulate fetching quotes from a server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(serverUrl);
    const serverQuotes = await response.json();
    
    // Simulate transforming the API data to your quote structure
    const transformedQuotes = serverQuotes.map(item => ({
      text: item.title,
      category: "General"  // Example default category for mock data
    }));

    return transformedQuotes;
  } catch (error) {
    console.error("Failed to fetch quotes from server", error);
  }
}

// Simulate posting new quotes to the server (mock functionality)
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
        quotes = [...new Set([...quotes, ...serverQuotes])];  // Merge with existing quotes
        saveQuotes();  // Save updated quotes to local storage
        console.log("Quotes synced with server");
      }
    });
  }
  
  // Set up a periodic sync (e.g., every 10 seconds)
  setInterval(syncQuotesWithServer, 10000);  // Sync every 10 seconds

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
      // Inform the user about conflicts
      alert(`New quotes added from server: ${conflictQuotes.length}`);
      
      // Add server quotes to the local quotes
      quotes.push(...conflictQuotes);
      saveQuotes();
    }
  }
  