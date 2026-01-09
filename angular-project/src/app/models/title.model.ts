export interface Title {
  isbn: string;
  isbn10: string;
  titleweb: string;
  titleshort: string;
  authorweb: string;
  author: string;
  formatname: string;
  formatcode: string;
  priceusa?: string;
  pricecanada?: string;
  priceeur?: string;
  pages?: string;
  onsaledate?: string;
  flapcopy?: string;
  authorbio?: string;
  workid: string;
  division?: string;
  imprint?: string;
  subjectcategorydescription1?: string;
}
export interface TitlesResponse {
  title: Title[];
}
