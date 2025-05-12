export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Rating {
  userId: string;
  value: number; // 1-5
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Recipe {
  _id: string;
  title: string;
  imageUrl: string;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
  ownerId: string;
  isPublic: boolean;
  ratings: Rating[];
  comments: Comment[];
  createdAt: string;
}