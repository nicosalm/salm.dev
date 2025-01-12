export interface Book {
  title: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  year: number;
  tags: string[];
  description: string;
  link?: string;
}
