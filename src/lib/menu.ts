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

export type LocationKey = 'coop' | 'ecafe';

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

export const ECAFE_MENU: MenuCategory[] = [
  {
    name: 'Bagels',
    items: [
      { id: 'e-bg1', name: 'Plain Bagel', price: 2.0, category: 'Bagels' },
      { id: 'e-bg2', name: 'Multi-Grain Bagel', price: 2.0, category: 'Bagels' },
      { id: 'e-bg3', name: 'Cinnamon Raisin Bagel', price: 2.0, category: 'Bagels' },
      { id: 'e-bg4', name: 'Everything Bagel', price: 2.0, category: 'Bagels' },
      { id: 'e-bg5', name: 'Sesame Bagel', price: 2.0, category: 'Bagels' },
      { id: 'e-bg6', name: 'Chocolate Chip Bagel', price: 2.0, category: 'Bagels' },
      { id: 'e-bg7', name: 'GF Bagel', price: 2.0, category: 'Bagels' },
      { id: 'e-bg8', name: 'Bagel w/ Cream Cheese', price: 2.25, category: 'Bagels' },
      { id: 'e-bg9', name: 'Bagel w/ Spread', price: 2.25, category: 'Bagels' },
    ],
  },
  {
    name: 'Baked Goods',
    items: [
      { id: 'e-bk1', name: "David's Muffin", price: 4.0, category: 'Baked Goods' },
      { id: 'e-bk2', name: 'Cinnamon Roll', price: 4.0, category: 'Baked Goods' },
      { id: 'e-bk3', name: 'Frittata', price: 7.0, category: 'Baked Goods' },
    ],
  },
  {
    name: 'Soup & Salad',
    items: [
      { id: 'e-ss1', name: 'Creamy Tomato Basil Soup', price: 4.0, category: 'Soup & Salad' },
      { id: 'e-ss2', name: 'Smoked Salmon Avocado Salad', price: 12.5, category: 'Soup & Salad' },
    ],
  },
  {
    name: 'Sandwiches',
    items: [
      { id: 'e-sw1', name: 'Egg & Cheese', price: 5.5, category: 'Sandwiches' },
      { id: 'e-sw2', name: 'The Hillel', price: 11.5, category: 'Sandwiches' },
      { id: 'e-sw3', name: 'Caprese', price: 8.5, category: 'Sandwiches' },
      { id: 'e-sw4', name: 'Tuna Melt', price: 8.5, category: 'Sandwiches' },
      { id: 'e-sw5', name: 'Margherita', price: 8.5, category: 'Sandwiches' },
      { id: 'e-sw6', name: "General's Grilled Cheese", price: 8.5, category: 'Sandwiches' },
    ],
  },
  {
    name: 'Smoothies',
    items: [
      { id: 'e-sm1', name: 'Tree Frog', price: 6.5, category: 'Smoothies' },
      { id: 'e-sm2', name: 'Tropical Passion', price: 6.5, category: 'Smoothies' },
      { id: 'e-sm3', name: 'Twisted Berry', price: 6.5, category: 'Smoothies' },
      { id: 'e-sm4', name: 'Strawberry Banana', price: 6.5, category: 'Smoothies' },
      { id: 'e-sm5', name: 'Mango Bay', price: 6.5, category: 'Smoothies' },
      { id: 'e-sm6', name: 'Blue Banana', price: 6.5, category: 'Smoothies' },
    ],
  },
  {
    name: 'Falafel Bar',
    items: [
      { id: 'e-fb1', name: 'Falafel Wrap', price: 11.5, category: 'Falafel Bar' },
      { id: 'e-fb2', name: 'Falafel Bowl', price: 11.5, category: 'Falafel Bar' },
    ],
  },
  {
    name: 'Beverages',
    items: [
      { id: 'e-dv1', name: 'Orange Juice', price: 6.0, category: 'Beverages' },
      { id: 'e-dv2', name: 'Cold Brew', price: 5.75, category: 'Beverages' },
      { id: 'e-dv3', name: 'Coffee', price: 2.25, category: 'Beverages' },
      { id: 'e-dv4', name: 'Tea', price: 2.0, category: 'Beverages' },
      { id: 'e-dv5', name: 'Fountain Drink', price: 1.75, category: 'Beverages' },
      { id: 'e-dv6', name: 'Hot Chocolate', price: 4.0, category: 'Beverages' },
    ],
  },
];

export const LOCATIONS: Record<LocationKey, { label: string; menu: MenuCategory[] }> = {
  coop: { label: 'Coop (Cafe 77)', menu: CAFE_77_MENU },
  ecafe: { label: 'E-Cafe (Hillel)', menu: ECAFE_MENU },
};
