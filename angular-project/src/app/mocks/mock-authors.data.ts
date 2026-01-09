import { Author, AuthorsResponse } from '../models/author.model';

export const MOCK_AUTHORS: Author[] = [
  {
    authorid: '1001',
    authordisplay: 'Stephen King',
    authorfirst: 'Stephen',
    authorlast: 'King',
    authorfirstlc: 'stephen',
    authorlastlc: 'king',
    authorlastfirst: 'King, Stephen',
    lastinitial: 'K',
    spotlight: '<p>Stephen King is a prolific American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels. He has published over 60 novels and 200 short stories.</p>'
  },
  {
    authorid: '1002',
    authordisplay: 'J.K. Rowling',
    authorfirst: 'J.K.',
    authorlast: 'Rowling',
    authorfirstlc: 'j.k.',
    authorlastlc: 'rowling',
    authorlastfirst: 'Rowling, J.K.',
    lastinitial: 'R',
    spotlight: '<p>J.K. Rowling is a British author, best known for writing the Harry Potter fantasy series. The books have won multiple awards and sold more than 500 million copies.</p>'
  },
  {
    authorid: '1003',
    authordisplay: 'George R.R. Martin',
    authorfirst: 'George',
    authorlast: 'Martin',
    authorfirstlc: 'george',
    authorlastlc: 'martin',
    authorlastfirst: 'Martin, George R.R.',
    lastinitial: 'M',
    spotlight: '<p>George R.R. Martin is an American novelist and short story writer in the fantasy, horror, and science fiction genres. He is best known for his series A Song of Ice and Fire.</p>'
  },
  {
    authorid: '1004',
    authordisplay: 'Agatha Christie',
    authorfirst: 'Agatha',
    authorlast: 'Christie',
    authorfirstlc: 'agatha',
    authorlastlc: 'christie',
    authorlastfirst: 'Christie, Agatha',
    lastinitial: 'C',
    spotlight: '<p>Agatha Christie was an English writer known for her 66 detective novels and 14 short story collections. She is one of the best-selling authors in history.</p>'
  },
  {
    authorid: '1005',
    authordisplay: 'Neil Gaiman',
    authorfirst: 'Neil',
    authorlast: 'Gaiman',
    authorfirstlc: 'neil',
    authorlastlc: 'gaiman',
    authorlastfirst: 'Gaiman, Neil',
    lastinitial: 'G',
    spotlight: '<p>Neil Gaiman is an English author of short fiction, novels, comic books, graphic novels, and films. His notable works include American Gods and Coraline.</p>'
  },
  {
    authorid: '1006',
    authordisplay: 'Dan Brown',
    authorfirst: 'Dan',
    authorlast: 'Brown',
    authorfirstlc: 'dan',
    authorlastlc: 'brown',
    authorlastfirst: 'Brown, Dan',
    lastinitial: 'B',
    spotlight: '<p>Dan Brown is an American author best known for his thriller novels, including the Robert Langdon series featuring The Da Vinci Code, Angels & Demons, and Inferno.</p>'
  },
  {
    authorid: '1007',
    authordisplay: 'Margaret Atwood',
    authorfirst: 'Margaret',
    authorlast: 'Atwood',
    authorfirstlc: 'margaret',
    authorlastlc: 'atwood',
    authorlastfirst: 'Atwood, Margaret',
    lastinitial: 'A',
    spotlight: '<p>Margaret Atwood is a Canadian poet, novelist, and literary critic. She is best known for her dystopian novel The Handmaid\'s Tale and its sequel The Testaments.</p>'
  },
  {
    authorid: '1008',
    authordisplay: 'Haruki Murakami',
    authorfirst: 'Haruki',
    authorlast: 'Murakami',
    authorfirstlc: 'haruki',
    authorlastlc: 'murakami',
    authorlastfirst: 'Murakami, Haruki',
    lastinitial: 'M',
    spotlight: '<p>Haruki Murakami is a Japanese writer whose works have been described as surrealist and postmodern. His notable works include Norwegian Wood, Kafka on the Shore, and 1Q84.</p>'
  },
  {
    authorid: '1009',
    authordisplay: 'Gillian Flynn',
    authorfirst: 'Gillian',
    authorlast: 'Flynn',
    authorfirstlc: 'gillian',
    authorlastlc: 'flynn',
    authorlastfirst: 'Flynn, Gillian',
    lastinitial: 'F',
    spotlight: '<p>Gillian Flynn is an American author and screenwriter. She is known for her thriller novels Gone Girl, Sharp Objects, and Dark Places.</p>'
  },
  {
    authorid: '1010',
    authordisplay: 'John Grisham',
    authorfirst: 'John',
    authorlast: 'Grisham',
    authorfirstlc: 'john',
    authorlastlc: 'grisham',
    authorlastfirst: 'Grisham, John',
    lastinitial: 'G',
    spotlight: '<p>John Grisham is an American novelist and attorney, best known for his popular legal thrillers including The Firm, A Time to Kill, and The Pelican Brief.</p>'
  },
  {
    authorid: '1011',
    authordisplay: 'Donna Tartt',
    authorfirst: 'Donna',
    authorlast: 'Tartt',
    authorfirstlc: 'donna',
    authorlastlc: 'tartt',
    authorlastfirst: 'Tartt, Donna',
    lastinitial: 'T',
    spotlight: '<p>Donna Tartt is an American writer who received critical acclaim for her novels The Secret History and The Goldfinch, which won the Pulitzer Prize for Fiction.</p>'
  },
  {
    authorid: '1012',
    authordisplay: 'James Patterson',
    authorfirst: 'James',
    authorlast: 'Patterson',
    authorfirstlc: 'james',
    authorlastlc: 'patterson',
    authorlastfirst: 'Patterson, James',
    lastinitial: 'P',
    spotlight: '<p>James Patterson is an American author known for his Alex Cross, Michael Bennett, and Women\'s Murder Club series. He holds the Guinness World Record for most #1 New York Times bestsellers.</p>'
  },
  {
    authorid: '1013',
    authordisplay: 'Nora Roberts',
    authorfirst: 'Nora',
    authorlast: 'Roberts',
    authorfirstlc: 'nora',
    authorlastlc: 'roberts',
    authorlastfirst: 'Roberts, Nora',
    lastinitial: 'R',
    spotlight: '<p>Nora Roberts is a bestselling American author of romance novels. She has written over 200 novels and is known for her In Death series written under the pseudonym J.D. Robb.</p>'
  },
  {
    authorid: '1014',
    authordisplay: 'Brandon Sanderson',
    authorfirst: 'Brandon',
    authorlast: 'Sanderson',
    authorfirstlc: 'brandon',
    authorlastlc: 'sanderson',
    authorlastfirst: 'Sanderson, Brandon',
    lastinitial: 'S',
    spotlight: '<p>Brandon Sanderson is an American author of epic fantasy and science fiction. He is known for the Mistborn series and for completing Robert Jordan\'s Wheel of Time series.</p>'
  },
  {
    authorid: '1015',
    authordisplay: 'Colleen Hoover',
    authorfirst: 'Colleen',
    authorlast: 'Hoover',
    authorfirstlc: 'colleen',
    authorlastlc: 'hoover',
    authorlastfirst: 'Hoover, Colleen',
    lastinitial: 'H',
    spotlight: '<p>Colleen Hoover is an American author who writes primarily romance and young adult fiction. Her novels It Ends with Us and Verity have become international bestsellers.</p>'
  },
  {
    authorid: '1016',
    authordisplay: 'Lee Child',
    authorfirst: 'Lee',
    authorlast: 'Child',
    authorfirstlc: 'lee',
    authorlastlc: 'child',
    authorlastfirst: 'Child, Lee',
    lastinitial: 'C',
    spotlight: '<p>Lee Child is a British author known for his Jack Reacher thriller series. The books follow a former U.S. Army military policeman who travels America as a drifter.</p>'
  },
  {
    authorid: '1017',
    authordisplay: 'Kazuo Ishiguro',
    authorfirst: 'Kazuo',
    authorlast: 'Ishiguro',
    authorfirstlc: 'kazuo',
    authorlastlc: 'ishiguro',
    authorlastfirst: 'Ishiguro, Kazuo',
    lastinitial: 'I',
    spotlight: '<p>Kazuo Ishiguro is a British novelist of Japanese origin. He won the Nobel Prize in Literature in 2017 for novels like The Remains of the Day and Never Let Me Go.</p>'
  },
  {
    authorid: '1018',
    authordisplay: 'Toni Morrison',
    authorfirst: 'Toni',
    authorlast: 'Morrison',
    authorfirstlc: 'toni',
    authorlastlc: 'morrison',
    authorlastfirst: 'Morrison, Toni',
    lastinitial: 'M',
    spotlight: '<p>Toni Morrison was an American novelist who won the Nobel Prize in Literature. Her novels, including Beloved and Song of Solomon, explore the African-American experience.</p>'
  },
  {
    authorid: '1019',
    authordisplay: 'Paulo Coelho',
    authorfirst: 'Paulo',
    authorlast: 'Coelho',
    authorfirstlc: 'paulo',
    authorlastlc: 'coelho',
    authorlastfirst: 'Coelho, Paulo',
    lastinitial: 'C',
    spotlight: '<p>Paulo Coelho is a Brazilian lyricist and novelist. His best-known work is The Alchemist, which has sold over 150 million copies worldwide.</p>'
  },
  {
    authorid: '1020',
    authordisplay: 'David Baldacci',
    authorfirst: 'David',
    authorlast: 'Baldacci',
    authorfirstlc: 'david',
    authorlastlc: 'baldacci',
    authorlastfirst: 'Baldacci, David',
    lastinitial: 'B',
    spotlight: '<p>David Baldacci is an American novelist known for his thriller and mystery novels. His first novel, Absolute Power, became a bestseller and was adapted into a film.</p>'
  }
];

export function getMockAuthorsResponse(authors: Author[]): AuthorsResponse {
  return { author: authors };
}
