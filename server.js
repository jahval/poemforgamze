require("dotenv").config();
const express = require('express');
const app = express();

const port = process.env.PORT || 8000; // Use port 8000 by default

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Initialize Notion client
const { Client } = require("@notionhq/client");
const notion = new Client({
  auth: process.env.NOTION_API_KEY // Use the environment variable for the Notion API key
});

// Define endpoint to fetch a random entry from the Notion database
app.get('/fetch-random-entry', async (req, res) => {
  try {
    // Make request to Notion API to fetch all data from the database
    const response = await notion.databases.query({
      database_id: '837d53239ec74b76b8d3fa32633c4c9f', // Replace with your Notion database ID
    });

    // Randomly select an entry from the results
    const randomIndex = Math.floor(Math.random() * response.results.length);
    const randomEntry = response.results[randomIndex];

    // Fetch the full page content using the page ID
    const content = await extractContentFromNotionPage(randomEntry.id);

    // Additional data extraction (title, author, book, etc.)
    const data = {
      id: randomEntry.id,
      title: randomEntry.properties.title?.title[0]?.text?.content || 'Untitled',
      content: content.trim(), // Trim leading and trailing whitespace
      author: randomEntry.properties.author?.select?.name || 'Unknown author',
      book: randomEntry.properties.book?.select?.name || 'Unknown book',
    };

    // Send data back to client
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Notion:', error);
    // Send a more descriptive error message
    res.status(500).json({ error: 'Error fetching data from Notion', details: error.message });
  }
});

// Define endpoint to fetch the poem of the day based on the current date
app.get('/fetch-poem-of-the-day', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const response = await notion.databases.query({
      database_id: '837d53239ec74b76b8d3fa32633c4c9f',
      filter: {
        property: 'date', // Assuming 'date' is the property name in your Notion database
        date: {
          equals: today,
        },
      },
    });

    if (response.results.length > 0) {
      const randomIndex = Math.floor(Math.random() * response.results.length);
      const randomEntry = response.results[randomIndex];

      // Fetch the full page content using the page ID
      const content = await extractContentFromNotionPage(randomEntry.id);

      // Additional data extraction (title, author, book, etc.)
      const data = {
        id: randomEntry.id,
        title: randomEntry.properties.title?.title[0]?.text?.content || 'Untitled',
        content: content.trim(), // Trim leading and trailing whitespace
        author: randomEntry.properties.author?.select?.name || 'Unknown author',
        book: randomEntry.properties.book?.select?.name || 'Unknown book',
      };

      res.json(data);
    } else {
      res.status(404).json({ error: 'No poem found for today' });
    }
  } catch (error) {
    console.error('Error fetching poem of the day:', error);
    res.status(500).json({ error: 'Error fetching poem of the day', details: error.message });
  }
});

// Function to extract content from a Notion page
async function extractContentFromNotionPage(pageId) {
  try {
    const pageResponse = await notion.pages.retrieve({
      page_id: pageId,
    });

    const blocksResponse = await notion.blocks.children.list({
      block_id: pageResponse.id,
    });

    // Initialize content
    let content = '';

    // Check if blocks response exists and has results
    if (blocksResponse && blocksResponse.results && blocksResponse.results.length > 0) {
      // Iterate through the blocks to find the text content
      blocksResponse.results.forEach(block => {
        // Check if block is a paragraph type
        if (block.type === 'paragraph' && block.paragraph && block.paragraph.rich_text) {
          // Extract content from the paragraph block
          const richTextArray = block.paragraph.rich_text;
          if (richTextArray) {
            const paragraphContent = richTextArray.map(textObj => textObj.text.content.trim()).join('\n');
            content += paragraphContent + '\n\n'; // Add two line breaks between paragraphs
          }
        }
      });
    }

    return content;
  } catch (error) {
    console.error('Error extracting content from Notion page:', error);
    return ''; // Return an empty string in case of an error
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
