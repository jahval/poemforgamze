require("dotenv").config();
const express = require('express');
const app = express();

const port = 80;

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
    const pageResponse = await notion.pages.retrieve({
      page_id: randomEntry.id,
    });

    // Fetch the children blocks of the page using the page ID
    const blocksResponse = await notion.blocks.children.list({
      block_id: randomEntry.id,
    });

    console.log('Page Response:', pageResponse);
    console.log('Blocks Response:', blocksResponse);

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
          console.log('Rich Text Array:', richTextArray); // Log the rich text array
          if (richTextArray) {
            const paragraphContent = richTextArray.map(textObj => textObj.text.content.trim()).join('\n');
            content += paragraphContent + '\n\n'; // Add two line breaks between paragraphs
          }
        }
      });
    } else {
      // If no content is available, set content to an empty string
      content = '';
    }

    // Extract relevant data from the random entry
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



