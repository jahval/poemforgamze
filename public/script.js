// Function to fetch poem of the day based on today's date
async function fetchPoemOfTheDay() {
  try {
    const response = await fetch('/fetch-poem-of-the-day');
    const data = await response.json();
    console.log('Fetched poem of the day:', data);
    return data;
  } catch (error) {
    console.error('Error fetching poem of the day:', error);
    return {};
  }
}

// Function to update HTML content with poem of the day
async function updatePoemOfTheDay() {
  try {
    // Show loader
    $('.word').show();
    $('.box').hide();

    const data = await fetchPoemOfTheDay();
    if (data) {
      console.log('Poem of the day:', data);
      document.querySelector('span.title').textContent = data.title;
      document.querySelector('h2.title').textContent = data.title;
      document.querySelector('.author').textContent = data.author;
      document.querySelector('.book').textContent = data.book;

      // Process poem content and add line breaks
      const poemLines = data.content.split('\n');
      const poemContainer = document.querySelector('.poem');
      poemContainer.innerHTML = '';
      poemLines.forEach(line => {
        const lineElement = document.createElement('p');
        lineElement.textContent = line;
        poemContainer.appendChild(lineElement);
      });

      // Hide loader and show poem content
      $('.word').hide();
      $('.box').show();
    }
  } catch (error) {
    console.error('Error updating poem of the day:', error);
  }
}

// Function to fetch and display a random poem on button click
async function fetchAndDisplayRandomPoem() {
  try {
    // Show loader
    $('.word').show();
    $('.box').hide();

    const response = await fetch('/fetch-random-entry');
    const data = await response.json();
    console.log('Fetched random poem:', data);
    // Update HTML content with fetched random poem
    document.querySelector('span.title').textContent = data.title;
    document.querySelector('h2.title').textContent = data.title;
    document.querySelector('.author').textContent = data.author;
    document.querySelector('.book').textContent = data.book;

    // Process poem content and add line breaks
    const poemLines = data.content.split('\n');
    const poemContainer = document.querySelector('.poem');
    poemContainer.innerHTML = '';
    poemLines.forEach(line => {
      const lineElement = document.createElement('p');
      lineElement.textContent = line;
      poemContainer.appendChild(lineElement);
    });

    // Hide loader and show poem content
    $('.word').hide();
    $('.box').show();
  } catch (error) {
    console.error('Error fetching random poem:', error);
  }
}

// Function to update the date and time
function updateTime() {
  const now = new Date();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const day = days[now.getDay()];
  const date = now.getDate().toString().padStart(2, '0');
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timeString = `${day} ${date} ${month} ${year} (${hours}:${minutes})`;

  document.querySelector('.date').textContent = timeString;
}

// Call updatePoemOfTheDay function when the page loads
window.onload = function () {
  updateTime(); // Update time immediately
  // Update time every minute
  setInterval(updateTime, 60000);

  updatePoemOfTheDay();
};

// Event listener for the "New Poem" button
document.getElementById('new-poem-button').addEventListener('click', async function() {
  // Fetch and display a random poem
  await fetchAndDisplayRandomPoem();
});

function Ticker( elem ) {
  elem.lettering();
  this.done = false;
  this.cycleCount = 5;
  this.cycleCurrent = 0;
  this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()-_=+{}|[]\\;\':"<>?,./`~'.split('');
  this.charsCount = this.chars.length;
  this.letters = elem.find( 'span' );
  this.letterCount = this.letters.length;
  this.letterCurrent = 0;

  this.letters.each( function() {
    var $this = $( this );
    $this.attr( 'data-orig', $this.text() );
    $this.text( '-' );
  });
}

Ticker.prototype.getChar = function() {
  return this.chars[ Math.floor( Math.random() * this.charsCount ) ];
};

Ticker.prototype.reset = function() {
  this.done = false;
  this.cycleCurrent = 0;
  this.letterCurrent = 0;
  this.letters.each( function() {
    var $this = $( this );
    $this.text( $this.attr( 'data-orig' ) );
    $this.removeClass( 'done' );
  });
  this.loop();
};

Ticker.prototype.loop = function() {
  var self = this;

  this.letters.each( function( index, elem ) {
    var $elem = $( elem );
    if( index >= self.letterCurrent ) {
      if( $elem.text() !== ' ' ) {
        $elem.text( self.getChar() );
        $elem.css( 'opacity', Math.random() );
      }
    }
  });

  if( this.cycleCurrent < this.cycleCount ) {
    this.cycleCurrent++;
  } else if( this.letterCurrent < this.letterCount ) {
    var currLetter = this.letters.eq( this.letterCurrent );
    this.cycleCurrent = 0;
    currLetter.text( currLetter.attr( 'data-orig' ) ).css( 'opacity', 1 ).addClass( 'done' );
    this.letterCurrent++;
  } else {
    this.done = true;
  }

  if( !this.done ) {
    requestAnimationFrame( function() {
      self.loop();
    });
  } else {
    setTimeout( function() {
      self.reset();
    }, 750 );
  }
};

$words = $( '.word' );

$words.each( function() {
  var $this = $( this ),
    ticker = new Ticker( $this ).reset();
  $this.data( 'ticker', ticker  );
});
