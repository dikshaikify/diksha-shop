const categories = ["Electronics", "Books", "Clothing", "Sports", "Home", "Toys"];

const adjectives = ["Premium", "Ultra", "Compact", "Wireless", "Smart", "Pro", "Classic", "Eco", "Deluxe", "Portable", "Quantum", "Aero"];

const nouns = {
  Electronics: ["Headphones", "Speaker", "Charger", "Keyboard", "Monitor", "Camera", "Tablet", "Mouse", "Router"],
  Books: ["Novel", "Guide", "Cookbook", "Biography", "Manual", "Anthology", "Atlas", "Journal"],
  Clothing: ["Jacket", "T-Shirt", "Sneakers", "Hoodie", "Jeans", "Cap", "Socks", "Scarf"],
  Sports: ["Dumbbell", "Yoga Mat", "Bicycle", "Tennis Racket", "Basketball", "Jump Rope", "Helmet"],
  Home: ["Lamp", "Chair", "Blender", "Pillow", "Rug", "Vase", "Clock", "Mirror"],
  Toys: ["Puzzle", "Drone", "Lego Set", "Action Figure", "Board Game", "RC Car", "Kite"]
};

const brands = ["TechNova", "HomeBasic", "LuxeCraft", "VividLine", "NorthPeak", "UrbanCore", "ZenLine"];
const colors = ["Black", "White", "Silver", "Blue", "Red", "Green", "Grey"];

/* ═══════════════════════════════════════════════════════════════
   20 UNIQUE IMAGES PER DEPARTMENT — NO CROSS-DEPARTMENT SHARING
   ═══════════════════════════════════════════════════════════════ */

const departmentImages = {
  Electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop"
  ],

  Books: [
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=300&fit=crop"
  ],

  Clothing: [
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400&h=300&fit=crop"
  ],

  Sports: [
    "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1617339860293-6a9f47a5a0f5?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1573497491765-dccce02b29df?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&h=300&fit=crop"
  ],

  Home: [
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1600166898405-da9535204843?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1495856458515-0637185db551?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=300&fit=crop"
  ],

  Toys: [
    "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1560963689-b5682b6440f8?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1601645191163-3fc0d5d64e35?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1520376932094-2d63b1f3c1c3?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=300&fit=crop"
  ]
};

/* Deterministic assignment: index cycles through the 20 images for its department */
function pickImage(category, index) {
  const pool = departmentImages[category] || departmentImages.Electronics;
  return pool[index % pool.length];
}

const products = [];
let id = 1;

/* Track per-category index so each new product gets the NEXT image in that department's pool */
const categoryCounter = {};

for (let i = 0; i < 120; i++) {
  const category = categories[i % categories.length];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[category][Math.floor(Math.random() * nouns[category].length)];

  const catIdx = categoryCounter[category] || 0;
  categoryCounter[category] = catIdx + 1;

  const price = +(Math.random() * 220 + 15).toFixed(2);
  const discountPct = Math.floor(Math.random() * 40);
  const originalPrice = +(price / (1 - discountPct / 100)).toFixed(2);
  const reviewCount = Math.floor(Math.random() * 480) + 12;
  const rating = +(Math.random() * 2 + 3).toFixed(1);
  const stock = Math.floor(Math.random() * 40) + 2;

  products.push({
    id: id++,
    title: `${adj} ${noun}`,
    description: `High-quality ${noun.toLowerCase()} engineered for ${adj.toLowerCase()} performance. Crafted with precision materials for daily reliability and long-lasting comfort.`,
    category,
    price,
    originalPrice: discountPct > 0 ? originalPrice : null,
    discountPercent: discountPct > 0 ? discountPct : 0,
    rating,
    reviewCount,
    stock,
    image: pickImage(category, catIdx),
    brand: brands[Math.floor(Math.random() * brands.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    specs: {
      Brand: brands[Math.floor(Math.random() * brands.length)],
      Color: colors[Math.floor(Math.random() * colors.length)],
      Warranty: "1 Year Manufacturer",
      "Country of Origin": "India"
    },
    reviews: [
      { author: "Rahul S.", rating: 5, title: "Excellent quality", body: "Exceeded expectations. Would buy again.", date: "2026-08-12" },
      { author: "Priya M.", rating: 4, title: "Good value", body: "Solid product for the price. Delivery was quick.", date: "2026-08-03" },
      { author: "Arjun K.", rating: 3, title: "Decent", body: "Works as described. Nothing extraordinary.", date: "2026-07-22" }
    ]
  });
}

export { products, categories };