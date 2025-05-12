export interface MealSlot {
  _id: string;
  date: string; // ISO date string
  recipeId: string;
  mealType: string; // 'breakfast', 'lunch', 'dinner', etc.
}

export interface MealPlan {
  _id: string;
  userId: string;
  weekStartDate: string; // ISO date string for the Monday of the week
  slots: MealSlot[];
}