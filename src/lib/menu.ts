export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
};

export type MenuCategory = {
  name: string;
  items: MenuItem[];
};

export const CAFE_77_MENU: MenuCategory[] = [
  {
    name: 'Breakfast',
    items: [
      { id: 'b1', name: 'Sunrise Sandwich', price: 4.0, category: 'Breakfast' },
      { id: 'b2', name: 'Breakfast Burrito', price: 6.0, category: 'Breakfast' },
      { id: 'b3', name: 'Breakfast Platter', price: 9.0, category: 'Breakfast' },
    ],
  },
  {
    name: 'Classics',
    items: [
      { id: 'c1', name: 'Hamburger', price: 8.0, category: 'Classics' },
      { id: 'c2', name: 'Cheeseburger', price: 8.5, category: 'Classics' },
      { id: 'c3', name: 'Black Bean Burger', price: 7.0, category: 'Classics' },
      { id: 'c4', name: 'Grilled Chicken Sandwich', price: 7.5, category: 'Classics' },
      { id: 'c5', name: 'Fried Chicken Sandwich', price: 7.5, category: 'Classics' },
      { id: 'c6', name: 'Chicken Tenders', price: 7.5, category: 'Classics' },
      { id: 'c7', name: 'Buffalo Bites', price: 9.0, category: 'Classics' },
      { id: 'c8', name: 'Black Bean Quesadilla', price: 7.0, category: 'Classics' },
      { id: 'c9', name: 'Grilled Cheese', price: 6.0, category: 'Classics' },
    ],
  },
  {
    name: 'Sides',
    items: [
      { id: 's1', name: 'Waffle Fries', price: 4.0, category: 'Sides' },
      { id: 's2', name: 'Crinkle Cut Fries', price: 3.0, category: 'Sides' },
      { id: 's3', name: 'Cheese Fries', price: 7.0, category: 'Sides' },
      { id: 's4', name: 'Mozzarella Sticks', price: 6.0, category: 'Sides' },
      { id: 's5', name: 'Brussels Sprouts', price: 7.0, category: 'Sides' },
      { id: 's6', name: 'Soup', price: 4.0, category: 'Sides' },
    ],
  },
  {
    name: 'Shakes',
    items: [
      { id: 'm1', name: 'Vanilla Milkshake', price: 8.0, category: 'Shakes' },
      { id: 'm2', name: 'Chocolate Milkshake', price: 8.0, category: 'Shakes' },
      { id: 'm3', name: 'Strawberry Milkshake', price: 8.0, category: 'Shakes' },
      { id: 'm4', name: 'Oreo Milkshake', price: 9.0, category: 'Shakes' },
      { id: 'm5', name: 'Espresso Milkshake', price: 9.0, category: 'Shakes' },
    ],
  },
  {
    name: 'Bakery',
    items: [
      { id: 'k1', name: 'Brownie', price: 3.5, category: 'Bakery' },
      { id: 'k2', name: 'Cinnamon Roll', price: 4.5, category: 'Bakery' },
      { id: 'k3', name: 'Muffin', price: 3.5, category: 'Bakery' },
      { id: 'k4', name: 'Croissant', price: 4.0, category: 'Bakery' },
    ],
  },
  {
    name: 'Drinks',
    items: [
      { id: 'd1', name: 'Fountain Drink', price: 1.75, category: 'Drinks' },
      { id: 'd2', name: 'Drip Coffee', price: 2.25, category: 'Drinks' },
      { id: 'd3', name: 'Latte', price: 4.5, category: 'Drinks' },
      { id: 'd4', name: 'Cappuccino', price: 4.5, category: 'Drinks' },
      { id: 'd5', name: 'Specialty Drink', price: 5.5, category: 'Drinks' },
    ],
  },
];
