export type PostData = {
  title: string;
  author: string;
  description: string;
  pubDate: Date;
  tags: string[];
  comments?: number;
  image?: {
    url: string;
    alt: string;
  };
  updatedDate?: Date;
}
