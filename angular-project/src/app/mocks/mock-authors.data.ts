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
  }
];

export function getMockAuthorsResponse(authors: Author[]): AuthorsResponse {
  return { author: authors };
}
