
export enum Category {
  EVENING = 'Evening Wear',
  ROYAL = 'Royal Occasions',
  LUXE = 'Casual Luxe',
  BUSINESS = 'Business Elite',
  BRIDAL = 'Imperial Bridal'
}

export enum AgeGroup {
  JUNIOR = 'Junior Royalty',
  YOUNG_ADULT = 'Graceful Youth',
  MATURE = 'Majestic Elegance',
  TIMELESS = 'Timeless Legacy'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  ageGroup: AgeGroup;
  image: string;
  rating: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface FilterState {
  category: Category | 'All';
  ageGroup: AgeGroup | 'All';
  minPrice: number;
  maxPrice: number;
}
