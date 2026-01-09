// Script to generate expanded mock data for testing pagination

const fs = require('fs');
const path = require('path');

// Arrays for generating realistic-looking book data
const firstNames = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Emma', 'Olivia', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn', 'Abigail',
  'Alexander', 'Benjamin', 'Daniel', 'Matthew', 'Andrew', 'Joshua', 'Ryan', 'Nicholas', 'Jacob', 'Tyler',
  'Emily', 'Hannah', 'Madison', 'Ashley', 'Kaitlyn', 'Lauren', 'Rachel', 'Samantha', 'Victoria', 'Grace'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris',
  'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres',
  'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell',
  'Mitchell', 'Carter', 'Roberts', 'Phillips', 'Evans', 'Turner', 'Parker', 'Collins', 'Edwards', 'Stewart'
];

const titleWords1 = [
  'The', 'A', 'An', 'My', 'Our', 'Their', 'His', 'Her', 'Last', 'First', 'Dark', 'Silent', 'Hidden',
  'Lost', 'Forgotten', 'Secret', 'Ancient', 'Modern', 'New', 'Old', 'Final', 'Eternal', 'Infinite'
];

const titleWords2 = [
  'Shadow', 'Light', 'Night', 'Day', 'Dawn', 'Dusk', 'Moon', 'Sun', 'Star', 'Sky', 'Ocean', 'Mountain',
  'River', 'Forest', 'Garden', 'Castle', 'Kingdom', 'Empire', 'City', 'House', 'Palace', 'Tower', 'Bridge',
  'Road', 'Path', 'Journey', 'Quest', 'Adventure', 'Mystery', 'Secret', 'Truth', 'Lie', 'Dream', 'Memory'
];

const titleWords3 = [
  'Keeper', 'Hunter', 'Seeker', 'Finder', 'Maker', 'Breaker', 'Warrior', 'Guardian', 'Protector', 'Defender',
  'Chronicles', 'Tales', 'Stories', 'Legends', 'Myths', 'Prophecy', 'Destiny', 'Fate', 'Song', 'Dance',
  'Game', 'Trial', 'Test', 'Challenge', 'Gift', 'Curse', 'Blessing', 'Promise', 'Oath', 'Vow'
];

const categories = [
  'Fiction', 'Mystery', 'Thriller', 'Romance', 'Science Fiction', 'Fantasy', 'Horror',
  'Historical Fiction', 'Contemporary Fiction', 'Literary Fiction', 'Young Adult',
  'Biography', 'Self-Help', 'Business', 'History', 'Science', 'Philosophy', 'Poetry'
];

const formats = [
  { name: 'Hardcover', code: 'HC' },
  { name: 'Paperback', code: 'MM' },
  { name: 'E-Book', code: 'EL' }
];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice() {
  return (Math.random() * 40 + 5).toFixed(2);
}

function randomDate() {
  const year = 2015 + Math.floor(Math.random() * 10);
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${month}/${day}/${year}`;
}

function generateISBN13(index) {
  const base = '978' + String(index + 10000).padStart(9, '0');
  return base + '0'; // Simplified check digit
}

function generateISBN10(index) {
  return String(index + 1000000).padStart(10, '0');
}

function generateTitle() {
  const pattern = Math.floor(Math.random() * 3);
  switch(pattern) {
    case 0:
      return `${randomElement(titleWords1)} ${randomElement(titleWords2)}`;
    case 1:
      return `${randomElement(titleWords1)} ${randomElement(titleWords2)} ${randomElement(titleWords3)}`;
    case 2:
      return `${randomElement(titleWords2)} of ${randomElement(titleWords3)}`;
    default:
      return `${randomElement(titleWords1)} ${randomElement(titleWords2)}`;
  }
}

// Generate authors (100 total, keeping first 20 as they are)
function generateAuthors() {
  const authors = [];
  const startId = 1021; // Start after existing 20 authors

  for (let i = 0; i < 80; i++) {
    const id = startId + i;
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const fullName = `${firstName} ${lastName}`;

    authors.push({
      authorid: String(id),
      authordisplay: fullName,
      authorfirst: firstName,
      authorlast: lastName,
      authorfirstlc: firstName.toLowerCase(),
      authorlastlc: lastName.toLowerCase(),
      authorlastfirst: `${lastName}, ${firstName}`,
      lastinitial: lastName[0],
      spotlight: `<p>${fullName} is an acclaimed author known for compelling storytelling and vivid characters.</p>`
    });
  }

  return authors;
}

// Generate titles (1000 total, keeping first 40 as they are)
function generateTitles() {
  const titles = [];
  const startIndex = 40; // Start after existing 40 titles

  // Create a pool of author names (mix of real and generated)
  const realAuthors = [
    'Stephen King', 'J.K. Rowling', 'George R.R. Martin', 'Agatha Christie', 'Neil Gaiman',
    'Margaret Atwood', 'Ernest Hemingway', 'Jane Austen', 'Mark Twain', 'Charles Dickens',
    'Leo Tolstoy', 'F. Scott Fitzgerald', 'Harper Lee', 'J.R.R. Tolkien', 'William Shakespeare',
    'Dan Brown', 'Gillian Flynn', 'Paula Hawkins', 'Andy Weir', 'Blake Crouch'
  ];

  const generatedAuthors = [];
  for (let i = 0; i < 80; i++) {
    generatedAuthors.push(`${randomElement(firstNames)} ${randomElement(lastNames)}`);
  }

  const allAuthors = [...realAuthors, ...generatedAuthors];

  for (let i = 0; i < 960; i++) {
    const index = startIndex + i;
    const format = randomElement(formats);
    const author = randomElement(allAuthors);
    const title = generateTitle();
    const category = randomElement(categories);

    titles.push({
      isbn: generateISBN13(index),
      isbn10: generateISBN10(index),
      titleweb: title,
      titleshort: title.length > 30 ? title.substring(0, 27) + '...' : title,
      authorweb: author,
      author: author,
      formatname: format.name,
      formatcode: format.code,
      priceusa: randomPrice(),
      onsaledate: randomDate(),
      workid: `W${1000 + index}`,
      subjectcategorydescription1: category,
      flapcopy: `<p>A compelling ${category.toLowerCase()} story that will keep you turning pages. ${title} is a must-read for fans of the genre.</p>`,
      authorbio: `<p>${author} is a talented writer whose works have captivated readers worldwide.</p>`
    });
  }

  return titles;
}

// Read existing files
const authorsPath = path.join(__dirname, 'angular-project', 'src', 'app', 'mocks', 'mock-authors.data.ts');
const titlesPath = path.join(__dirname, 'angular-project', 'src', 'app', 'mocks', 'mock-titles.data.ts');

let existingAuthorsContent = fs.readFileSync(authorsPath, 'utf8');
let existingTitlesContent = fs.readFileSync(titlesPath, 'utf8');

// Extract existing data (first 20 authors and 40 titles)
const authorsMatch = existingAuthorsContent.match(/export const MOCK_AUTHORS: Author\[\] = \[([\s\S]*?)\];/);
const titlesMatch = existingTitlesContent.match(/export const MOCK_TITLES: Title\[\] = \[([\s\S]*?)\];/);

// Generate new data
const newAuthors = generateAuthors();
const newTitles = generateTitles();

// Format as TypeScript
function formatAuthor(author) {
  return `  {
    authorid: '${author.authorid}',
    authordisplay: '${author.authordisplay}',
    authorfirst: '${author.authorfirst}',
    authorlast: '${author.authorlast}',
    authorfirstlc: '${author.authorfirstlc}',
    authorlastlc: '${author.authorlastlc}',
    authorlastfirst: '${author.authorlastfirst}',
    lastinitial: '${author.lastinitial}',
    spotlight: '${author.spotlight}'
  }`;
}

function formatTitle(title) {
  return `  {
    isbn: '${title.isbn}',
    isbn10: '${title.isbn10}',
    titleweb: '${title.titleweb}',
    titleshort: '${title.titleshort}',
    authorweb: '${title.authorweb}',
    author: '${title.author}',
    formatname: '${title.formatname}',
    formatcode: '${title.formatcode}',
    priceusa: '${title.priceusa}',
    onsaledate: '${title.onsaledate}',
    workid: '${title.workid}',
    subjectcategorydescription1: '${title.subjectcategorydescription1}',
    flapcopy: '${title.flapcopy}',
    authorbio: '${title.authorbio}'
  }`;
}

// Append new authors to file
const existingAuthorsData = authorsMatch[1].trim();
const newAuthorsData = newAuthors.map(formatAuthor).join(',\n');
const updatedAuthorsContent = existingAuthorsContent.replace(
  /export const MOCK_AUTHORS: Author\[\] = \[([\s\S]*?)\];/,
  `export const MOCK_AUTHORS: Author[] = [\n${existingAuthorsData},\n${newAuthorsData}\n];`
);

// Append new titles to file
const existingTitlesData = titlesMatch[1].trim();
const newTitlesData = newTitles.map(formatTitle).join(',\n');
const updatedTitlesContent = existingTitlesContent.replace(
  /export const MOCK_TITLES: Title\[\] = \[([\s\S]*?)\];/,
  `export const MOCK_TITLES: Title[] = [\n${existingTitlesData},\n${newTitlesData}\n];`
);

// Write updated files
fs.writeFileSync(authorsPath, updatedAuthorsContent, 'utf8');
fs.writeFileSync(titlesPath, updatedTitlesContent, 'utf8');

console.log(`✓ Generated 80 new authors (total: 100)`);
console.log(`✓ Generated 960 new titles (total: 1000)`);
console.log('Mock data files updated successfully!');
