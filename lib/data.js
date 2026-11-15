export const CATEGORIES = [
  "Vehicles",
  "Property Rentals",
  "Apparel",
  "Classifieds",
  "Electronics",
  "Entertainment",
  "Family",
  "Free Stuff",
  "Garden & Outdoor",
  "Hobbies",
  "Home Goods",
  "Home Improvement",
  "Home Sales",
  "Musical Instruments",
  "Office Supplies",
  "Pet Supplies",
  "Sporting Goods",
  "Toys & Games",
  "Buy and sell groups",
];

export const LISTING_TYPES = [
  { id: "item", title: "Item for sale", description: "Create a single listing for one or more items to sell.", category: "" },
  { id: "multiple", title: "Create multiple listings", description: "Quickly list several items at once.", category: "" },
  { id: "vehicle", title: "Vehicle for sale", description: "Sell a car, truck or other type of vehicle.", category: "Vehicles" },
  { id: "home", title: "Home for sale or rent", description: "List a house or apartment for sale or rent.", category: "Property Rentals" },
];

export const CURRENT_USER = { name: "You", email: "" };

const HOUR = 60 * 60 * 1000;
const now = Date.now();

// Sample listings so the grid isn't empty on first run. Images are optional:
// put files in /public and reference them as "/bike.jpg".
export const SEED_LISTINGS = [
  { id: "seed-1", title: "Bike 24 inch", price: 99, category: "Sporting Goods", location: "Palo Alto, CA", seller: "Jordan Lee", description: "Kids' 24\" mountain bike, 21 speeds. Tires recently replaced.", image: "", createdAt: now - 1 * HOUR },
  { id: "seed-2", title: "Wooden dining table", price: 180, category: "Home Goods", location: "Mountain View, CA", seller: "Sam Patel", description: "Solid oak table, seats six. A few light scratches.", image: "", createdAt: now - 3 * HOUR },
  { id: "seed-3", title: "Acoustic guitar", price: 140, category: "Musical Instruments", location: "Menlo Park, CA", seller: "Chris Morgan", description: "Full-size acoustic with soft case and spare strings.", image: "", createdAt: now - 5 * HOUR },
  { id: "seed-4", title: "27\" monitor", price: 120, category: "Electronics", location: "Palo Alto, CA", seller: "Alex Kim", description: "1440p, HDMI and DisplayPort. Works perfectly.", image: "", createdAt: now - 8 * HOUR },
  { id: "seed-5", title: "Office chair", price: 75, category: "Office Supplies", location: "Sunnyvale, CA", seller: "Taylor Nguyen", description: "Adjustable mesh office chair with lumbar support.", image: "", createdAt: now - 12 * HOUR },
  { id: "seed-6", title: "Board game bundle", price: 40, category: "Toys & Games", location: "Los Altos, CA", seller: "Jamie Rivera", description: "Five family board games, all pieces included.", image: "", createdAt: now - 20 * HOUR },
  { id: "seed-7", title: "2012 Honda Civic", price: 6500, category: "Vehicles", location: "San Jose, CA", seller: "Morgan Davis", description: "128k miles, clean title, new brakes.", image: "", createdAt: now - 26 * HOUR },
  { id: "seed-8", title: "Patio set", price: 0, category: "Free Stuff", location: "Palo Alto, CA", seller: "Riley Chen", description: "Free patio table and four chairs. Must pick up.", image: "", createdAt: now - 30 * HOUR },
  { id: "seed-9", title: "Dog crate (large)", price: 35, category: "Pet Supplies", location: "Redwood City, CA", seller: "Casey Brooks", description: "Folding metal crate with divider and tray.", image: "", createdAt: now - 40 * HOUR },
  { id: "seed-10", title: "Winter jacket", price: 45, category: "Apparel", location: "Palo Alto, CA", seller: "Drew Wilson", description: "Men's size M, waterproof, worn one season.", image: "", createdAt: now - 50 * HOUR },
];
