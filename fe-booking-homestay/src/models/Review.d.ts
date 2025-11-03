export interface ReviewItem {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    avatar: string | null;
  };
}
