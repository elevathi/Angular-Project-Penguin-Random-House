export interface Author {
  authorid: string;
  authordisplay: string;
  authorfirst: string;
  authorlast: string;
  authorfirstlc: string;
  authorlastlc: string;
  authorlastfirst: string;
  lastinitial: string;
  spotlight?: string;
  photocredit?: string;
  approved?: string;
}

export interface AuthorsResponse {
  author: Author[];
}