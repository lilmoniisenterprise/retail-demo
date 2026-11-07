/* ==========================================================================
   Orbit Lane — General store demonstration · Built by Virellion Apex
   Vanilla JavaScript. No dependencies, no API keys, no tracking.

   DEMO MODE: the cart lives in this browser's localStorage. Checkout never
   asks for card numbers, never contacts a payment processor, and never
   places a real order. Forms validate in the browser and send nothing.
   See README.md → "Going live" to connect Shopify / Stripe / a backend.
   ========================================================================== */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  /* ------------------------------------------------------------------
     1. Configuration
     ------------------------------------------------------------------ */
  var CONFIG = {
    storeName: "Orbit Lane",
    currency: "USD",
    locale: "en-US",
    taxRate: 0.0825,            // demo sales-tax estimate
    freeShipThreshold: 7500,    // cents, after discounts
    storageKey: "orbitlane_v1",
    demoMode: true,
    // Shipping methods (cents). "standard" becomes free over the threshold.
    shipping: {
      standard: { label: "Standard", eta: "4–6 business days", price: 599 },
      express:  { label: "Express", eta: "2–3 business days", price: 1499 },
      nextday:  { label: "Next day", eta: "Order by 2 pm, arrives tomorrow", price: 2499 },
      pickup:   { label: "Store pickup", eta: "Ready in 2 hours (demo location)", price: 0 }
    }
  };

  /* Demonstration promo codes — validated here for the demo only.
     In production, validate discounts on the server / commerce platform. */
  var PROMOS = {
    WELCOME10: { label: "10% off your order", type: "percent", value: 10 },
    ORBIT20:   { label: "20% off orders $100+", type: "percent", value: 20, min: 10000 },
    GAMER15:   { label: "15% off gaming", type: "percent", value: 15, cat: "gaming" },
    FREESHIP:  { label: "Free standard shipping", type: "ship" }
  };

  /* ------------------------------------------------------------------
     2. Catalog (fictional products · photos from Unsplash, hotlinked)
     ------------------------------------------------------------------ */
  var CATS = [
    { id: "electronics", name: "Electronics", blurb: "Audio, wearables and smart gear", subs: ["Headphones", "Speakers", "Wearables"], img: "1638803782506-d975a6809f43" },
    { id: "home", name: "Home & Living", blurb: "Ceramics, textiles and calm corners", subs: ["Decor", "Textiles", "Candles", "Tableware"], img: "1610635966675-f6fcaaf9b833" },
    { id: "fashion", name: "Fashion & Accessories", blurb: "Everyday carry, finished well", subs: ["Bags", "Eyewear", "Wallets"], img: "1622560480605-d83c853bc5c3" },
    { id: "beauty", name: "Beauty & Personal Care", blurb: "Skin care and tools that earn their spot", subs: ["Face oils", "Serums", "Brushes"], img: "1596462502278-27bfdc403348" },
    { id: "gaming", name: "Gaming", blurb: "Controllers, keyboards and headsets", subs: ["Controllers", "Keyboards", "Mice", "Headsets"], img: "1612287230202-1ff1d85d1bdf" },
    { id: "fitness", name: "Fitness & Lifestyle", blurb: "Train at home, hydrate on the go", subs: ["Weights", "Hydration", "Kits"], img: "1638536532686-d610adfc8e5c" },
    { id: "toys", name: "Toys & Everyday Essentials", blurb: "Play, learn and gift", subs: ["Plush", "Blocks", "Learning"], img: "1638802538115-041e14d28d6a" }
  ];

  var COLLECTIONS = {
    cozy: { name: "The Cozy Season Edit", blurb: "Knits, candlelight and soft things for shorter days.", test: function (p) { return p.tags.indexOf("cozy") > -1; } },
    "gaming-week": { name: "Gaming Week", blurb: "Use code GAMER15 for 15% off every gaming item.", test: function (p) { return p.cat === "gaming"; } },
    "under-50": { name: "Gifts under $50", blurb: "Thoughtful finds that keep the budget happy.", test: function (p) { return unitBase(p) < 5000; } },
    gifts: { name: "Gift Guide", blurb: "Our most-gifted picks across every department.", test: function (p) { return p.tags.indexOf("gift") > -1; } },
    sale: { name: "On Sale", blurb: "Limited-time markdowns across the store.", test: function (p) { return !!p.sale; } },
    new: { name: "New Arrivals", blurb: "Fresh in this month.", test: function (p) { return p.isNew; } },
    best: { name: "Best Sellers", blurb: "The things people come back for.", test: function (p) { return p.best; } }
  };

  // price/sale in cents. stock: in | low | out | pre. options: price "delta" in cents.
  var PRODUCTS = [
    { id: "pulse-anc-headphones", cat: "electronics", sub: "Headphones", name: "Pulse ANC Over-Ear Headphones", price: 14900, sale: 11900, stock: "in", pop: 98, best: true, isNew: false, tags: ["gift"],
      img: "1638803782506-d975a6809f43", by: ["Stefan Riedl", "steve_volt"], alt: "Black over-ear headphones resting on a white surface",
      short: "Adaptive noise cancelling, 40-hour battery and memory-foam cushions.",
      desc: "Pulse blocks the commute and keeps the detail. Adaptive noise cancelling tunes itself to your surroundings, while 40 mm drivers deliver a warm, balanced sound you can listen to all day.",
      features: ["Adaptive active noise cancelling with transparency mode", "Up to 40 hours of playback; 10-minute quick charge for 5 hours", "Multipoint Bluetooth 5.3 pairing with two devices", "Fold-flat design with travel case"],
      specs: [["Driver", "40 mm dynamic"], ["Battery", "Up to 40 h (ANC off), 30 h (ANC on)"], ["Charging", "USB-C, quick charge"], ["Weight", "254 g"], ["Warranty", "2-year limited (demo)"]],
      options: [{ name: "Color", values: [{ v: "Midnight" }, { v: "Chalk" }, { v: "Sage" }] }] },
    { id: "ember-mini-speaker", cat: "electronics", sub: "Speakers", name: "Ember Mini Bluetooth Speaker", price: 5900, sale: null, stock: "in", pop: 84, best: false, isNew: true, tags: ["gift"],
      img: "1665672629999-0994c3f052a9", by: ["Ian Talmacs", "iantalmacs"], alt: "Red portable Bluetooth speaker on a wooden table",
      short: "Room-filling sound in a splash-proof, palm-sized body.",
      desc: "Ember punches far above its size with a passive bass radiator and 360° sound. It's IP67 rated against water and dust, so it's happy by the pool, in the shower or on the trail.",
      features: ["360° sound with passive bass radiator", "IP67 water and dust resistance", "12-hour battery", "Pair two for stereo"],
      specs: [["Output", "10 W"], ["Battery", "Up to 12 h"], ["Rating", "IP67"], ["Connectivity", "Bluetooth 5.3"], ["Weight", "380 g"]],
      options: [{ name: "Color", values: [{ v: "Ember Red" }, { v: "Slate" }, { v: "Ocean" }] }] },
    { id: "stride-smartwatch", cat: "electronics", sub: "Wearables", name: "Stride S2 Fitness Smartwatch", price: 19900, sale: 16900, stock: "low", pop: 91, best: true, isNew: false, tags: ["gift"],
      img: "1586568650353-529020f53985", by: ["Ștefan Iancu", "iiiiiancu"], alt: "Person wearing a black smartwatch", fy: 0.45,
      short: "Heart rate, GPS and sleep tracking with a 7-day battery.",
      desc: "Stride S2 tracks the workouts you do and the recovery you need. Built-in GPS, continuous heart rate and sleep staging sit behind a bright always-on display.",
      features: ["Built-in GPS and 100+ workout modes", "Continuous heart rate and sleep tracking", "Always-on AMOLED display", "Water resistant to 50 m"],
      specs: [["Display", "1.4\" AMOLED"], ["Battery", "Up to 7 days"], ["Water rating", "5 ATM"], ["Sensors", "Optical HR, accelerometer, GPS"], ["Compatibility", "iOS and Android"]],
      options: [{ name: "Case size", values: [{ v: "41 mm" }, { v: "45 mm", d: 3000 }] }, { name: "Band", values: [{ v: "Black sport" }, { v: "Stone sport" }] }] },
    { id: "hush-gaming-headset", cat: "gaming", sub: "Headsets", name: "Hush Pro Wireless Gaming Headset", price: 8900, sale: null, stock: "pre", pop: 77, best: false, isNew: true, tags: [],
      img: "1778257911549-d83c1698bde9", by: ["Moment InFocus", "momentinfocus"], alt: "Black over-ear headset lit by glowing blue light",
      short: "Low-latency 2.4 GHz wireless with a detachable boom mic.",
      desc: "Hush Pro is tuned for footsteps and dialogue alike. A 2.4 GHz dongle keeps latency low, and the detachable boom mic sounds clear on every squad call.",
      features: ["2.4 GHz low-latency wireless + Bluetooth", "Detachable noise-reducing boom mic", "Memory-foam ear cushions", "Ships late next month (pre-order demo)"],
      specs: [["Connection", "2.4 GHz USB-C dongle, Bluetooth 5.2"], ["Battery", "Up to 30 h"], ["Drivers", "50 mm"], ["Compatibility", "PC, console, mobile"]],
      options: [{ name: "Color", values: [{ v: "Carbon" }, { v: "Arctic" }] }] },
    { id: "neon-wireless-controller", cat: "gaming", sub: "Controllers", name: "Neon Wireless Game Controller", price: 5900, sale: 4900, stock: "in", pop: 95, best: true, isNew: false, tags: ["gift"],
      img: "1612287230202-1ff1d85d1bdf", by: ["Javier Martínez", "cjdante"], alt: "Wireless game controller lit by cyan and magenta neon light",
      short: "Hall-effect sticks, textured grips and 20-hour battery.",
      desc: "Neon's hall-effect thumbsticks resist drift, and the textured grips stay put through long sessions. Remap the two rear paddles in seconds.",
      features: ["Hall-effect thumbsticks resist drift", "Two remappable rear paddles", "20-hour rechargeable battery", "Wired or wireless play"],
      specs: [["Connection", "Bluetooth, USB-C wired"], ["Battery", "Up to 20 h"], ["Weight", "235 g"], ["Compatibility", "PC, mobile, selected consoles"]],
      options: [{ name: "Color", values: [{ v: "Graphite" }, { v: "Glacier White" }] }] },
    { id: "tkl-rgb-keyboard", cat: "gaming", sub: "Keyboards", name: "Orbit TKL RGB Mechanical Keyboard", price: 10900, sale: null, stock: "in", pop: 88, best: false, isNew: false, tags: [],
      img: "1626958390943-a70309376444", by: ["Michelle Ding", "michelleding"], alt: "Tenkeyless mechanical keyboard with red RGB backlighting",
      short: "Hot-swappable switches, per-key RGB and a compact tenkeyless frame.",
      desc: "A tenkeyless layout frees up desk space for wider mouse swipes. Hot-swap sockets let you change switches without soldering, and per-key RGB sets the mood.",
      features: ["Hot-swappable 3- and 5-pin sockets", "Per-key RGB with on-board profiles", "Wired USB-C and Bluetooth", "Double-shot keycaps"],
      specs: [["Layout", "Tenkeyless (87 keys)"], ["Connection", "USB-C, Bluetooth 5.1"], ["Polling rate", "1000 Hz wired"], ["Frame", "ABS with steel plate"]],
      options: [{ name: "Switch", values: [{ v: "Brown (tactile)" }, { v: "Red (linear)" }, { v: "Blue (clicky)" }] }] },
    { id: "phantom-gaming-mouse", cat: "gaming", sub: "Mice", name: "Phantom Lightweight Gaming Mouse", price: 4900, sale: null, stock: "low", pop: 80, best: false, isNew: false, tags: ["gift"],
      img: "1660334742848-cc8113467932", by: ["Rezwan Ahmed", "rezwanahmed"], alt: "Black gaming mouse on a dark surface",
      short: "58 g shell, 26K DPI optical sensor and PTFE feet.",
      desc: "Phantom weighs almost nothing and tracks everything. A 26,000 DPI optical sensor and pure PTFE feet make flicks feel effortless.",
      features: ["58 g ultralight shell", "26,000 DPI optical sensor", "Five programmable buttons", "Paracord-style flexible cable"],
      specs: [["Weight", "58 g"], ["Sensor", "Optical, 26K DPI"], ["Polling rate", "1000 Hz"], ["Buttons", "5 programmable"]],
      options: [{ name: "Color", values: [{ v: "Black" }, { v: "White" }] }] },
    { id: "matte-ceramic-planter", cat: "home", sub: "Decor", name: "Matte Ceramic Planter", price: 3400, sale: null, stock: "in", pop: 70, best: false, isNew: false, tags: ["cozy", "gift"],
      img: "1610635966675-f6fcaaf9b833", by: ["Shashi Chaturvedula", "thephotographermom"], alt: "Green plant in a white matte ceramic planter",
      short: "Hand-finished stoneware with a drainage hole and cork saucer.",
      desc: "A soft matte glaze and gently tapered profile let your plant take centre stage. Each planter has a drainage hole and comes with a cork saucer to protect surfaces.",
      features: ["Hand-finished stoneware", "Drainage hole with cork saucer", "Plant not included"],
      specs: [["Material", "Stoneware, matte glaze"], ["Small", "12 cm wide"], ["Medium", "16 cm wide"], ["Large", "21 cm wide"], ["Care", "Wipe clean"]],
      options: [{ name: "Size", values: [{ v: "Small" }, { v: "Medium", d: 800 }, { v: "Large", d: 1600 }] }] },
    { id: "stoneware-vase-trio", cat: "home", sub: "Decor", name: "Stoneware Vase Trio", price: 4800, sale: 3900, stock: "in", pop: 74, best: false, isNew: true, tags: ["gift"],
      img: "1734107640189-4974176150f9", by: ["Roshan Chakkeeri", "roshmohd"], alt: "Three stoneware vases of different shapes side by side",
      short: "Three sculptural vases for stems, dried flowers or nothing at all.",
      desc: "Group them or spread them out. This trio of sculptural vases mixes heights and silhouettes, so they look considered on a shelf, mantel or dining table.",
      features: ["Set of three", "Watertight interior glaze", "Felt pads on base"],
      specs: [["Heights", "14 cm, 18 cm, 24 cm"], ["Material", "Stoneware"], ["Finish", "Raw exterior, glazed interior"]],
      options: [] },
    { id: "harbor-knit-throw", cat: "home", sub: "Textiles", name: "Harbor Chunky Knit Throw", price: 6900, sale: 5500, stock: "in", pop: 89, best: true, isNew: false, tags: ["cozy", "gift"],
      img: "1600369672770-985fd30004eb", by: ["Jordan Bigelow", "jordanbigs"], alt: "White and blue chunky knit textile", fy: 0.4,
      short: "Soft cotton-blend knit, generously sized for the sofa or bed.",
      desc: "Harbor is knit in a soft cotton blend that's warm without the weight. At 130 × 170 cm it covers two on the sofa or adds texture at the foot of the bed.",
      features: ["Cotton-acrylic blend", "Machine washable, cool cycle", "130 × 170 cm"],
      specs: [["Size", "130 × 170 cm"], ["Material", "70% cotton, 30% acrylic"], ["Care", "Machine wash cold, lay flat to dry"]],
      options: [{ name: "Color", values: [{ v: "Harbor Blue" }, { v: "Oat" }] }] },
    { id: "amber-candle-set", cat: "home", sub: "Candles", name: "Amber Jar Candle Set", price: 2900, sale: null, stock: "in", pop: 86, best: false, isNew: false, tags: ["cozy", "gift"],
      img: "1643122966676-29e8597257f7", by: ["pmv chamara", "pmvch"], alt: "Group of amber glass candle jars",
      short: "Three soy-blend candles in reusable amber glass.",
      desc: "Three soy-blend candles poured into reusable amber glass, each with a cotton wick and roughly 30 hours of burn time.",
      features: ["Set of three, 30 h burn each", "Soy-coconut wax blend", "Reusable amber glass jars"],
      specs: [["Burn time", "~30 h per candle"], ["Wax", "Soy-coconut blend"], ["Jar", "Amber glass, 200 ml"]],
      options: [{ name: "Scent", values: [{ v: "Cedar & Smoke" }, { v: "Fig Leaf" }, { v: "Sea Salt" }] }] },
    { id: "speckled-bowl-set", cat: "home", sub: "Tableware", name: "Speckled Stoneware Bowl Set", price: 4200, sale: null, stock: "out", pop: 62, best: false, isNew: false, tags: [],
      img: "1660721671073-e139688fa3cf", by: ["OMK", "whyomywhy"], alt: "Stack of speckled stoneware bowls beside a vase",
      short: "Four everyday bowls with a warm speckled glaze.",
      desc: "Four generously sized bowls for cereal, noodles and salads, glazed in a warm speckle that hides everyday wear.",
      features: ["Set of four", "Dishwasher and microwave safe", "Restocking soon (demo)"],
      specs: [["Diameter", "16 cm"], ["Capacity", "700 ml"], ["Material", "Stoneware"]],
      options: [] },
    { id: "noir-classic-sunglasses", cat: "fashion", sub: "Eyewear", name: "Noir Classic Sunglasses", price: 6400, sale: null, stock: "in", pop: 79, best: false, isNew: true, tags: ["gift"],
      img: "1610136649349-0f646f318053", by: ["Lucas George Wendt", "lucasgwendt"], alt: "Black-framed sunglasses on a white table",
      short: "Acetate frames with polarized UV400 lenses.",
      desc: "A timeless square silhouette in hand-polished acetate, fitted with polarized lenses that cut glare and block 100% of UVA and UVB.",
      features: ["Polarized UV400 lenses", "Hand-polished acetate", "Includes case and cloth"],
      specs: [["Lens width", "52 mm"], ["Bridge", "20 mm"], ["Temple", "145 mm"], ["Protection", "UV400, polarized"]],
      options: [{ name: "Lens", values: [{ v: "Grey" }, { v: "Green" }, { v: "Brown" }] }] },
    { id: "saddle-leather-backpack", cat: "fashion", sub: "Bags", name: "Saddle Leather Backpack", price: 15900, sale: 12900, stock: "in", pop: 83, best: false, isNew: false, tags: ["gift"],
      img: "1622560480605-d83c853bc5c3", by: ["Wiser by the Mile", "wiserbythemile"], alt: "Brown leather backpack on a white surface",
      short: "Full-grain leather with a padded 15\" laptop sleeve.",
      desc: "Cut from full-grain leather that softens with every commute, Saddle carries a 15-inch laptop, a change of clothes and the day's essentials.",
      features: ["Full-grain leather", "Padded 15\" laptop sleeve", "Magnetic strap closures", "Interior zip pocket"],
      specs: [["Capacity", "18 L"], ["Dimensions", "42 × 30 × 14 cm"], ["Material", "Full-grain leather, cotton lining"]],
      options: [{ name: "Color", values: [{ v: "Saddle Brown" }, { v: "Oxblood" }] }] },
    { id: "slim-bifold-wallet", cat: "fashion", sub: "Wallets", name: "Slim Bifold Leather Wallet", price: 3900, sale: null, stock: "in", pop: 72, best: false, isNew: false, tags: ["gift"],
      img: "1614260938313-a7fc1a7ad0d2", by: ["Emil Kalibradov", "emkal"], alt: "Hands holding a slim leather bifold wallet and a phone", fx: 0.45,
      short: "Six cards, folded bills, nothing bulky.",
      desc: "A slim bifold with six card slots and a full-length bill pocket — everything you need, nothing that makes your pocket bulge.",
      features: ["6 card slots + bill pocket", "Vegetable-tanned leather", "Less than 1 cm thick"],
      specs: [["Size", "11 × 9 cm folded"], ["Material", "Vegetable-tanned leather"]],
      options: [{ name: "Color", values: [{ v: "Tan" }, { v: "Black" }] }] },
    { id: "botanical-face-oil", cat: "beauty", sub: "Face oils", name: "Botanical Facial Oil", price: 3200, sale: null, stock: "in", pop: 81, best: false, isNew: true, tags: ["gift"],
      img: "1671493235081-5842463637cd", by: ["Denise Chan", "elchan"], alt: "Amber glass dropper bottle on natural linen",
      short: "Lightweight squalane and rosehip oil for an overnight glow.",
      desc: "A fast-absorbing blend of squalane, rosehip and jojoba that leaves skin soft and comfortable without a greasy finish. (Fictional product — not a real formulation.)",
      features: ["Squalane, rosehip and jojoba blend", "Fragrance-free", "30 ml amber glass dropper"],
      specs: [["Size", "30 ml"], ["Skin type", "All, including dry"], ["Use", "2–3 drops, evening"]],
      options: [] },
    { id: "vitamin-c-glow-drops", cat: "beauty", sub: "Serums", name: "Vitamin C Glow Drops", price: 2800, sale: 2200, stock: "in", pop: 87, best: true, isNew: false, tags: [],
      img: "1713768704571-6aeb0d0e5105", by: ["Point Normal", "normals"], alt: "Dropper bottle of serum on a yellow background",
      short: "Brightening serum for a morning routine.",
      desc: "A light, water-based serum designed for mornings, layered under moisturiser and SPF. (Fictional product — not a real formulation.)",
      features: ["Water-light texture", "Layers under SPF", "Recyclable glass bottle"],
      specs: [["Size", "30 ml"], ["Use", "3–4 drops, morning"]],
      options: [{ name: "Size", values: [{ v: "30 ml" }, { v: "50 ml", d: 1200 }] }] },
    { id: "blush-brush-set", cat: "beauty", sub: "Brushes", name: "Blush Pro Makeup Brush Set", price: 3600, sale: null, stock: "in", pop: 68, best: false, isNew: false, tags: ["gift"],
      img: "1596462502278-27bfdc403348", by: ["Shamblen Studios", "shamblenstudios"], alt: "Pink and brown makeup brush set",
      short: "Eight soft synthetic brushes for face and eyes.",
      desc: "Eight cruelty-free synthetic brushes that cover foundation to fine liner, with a roll-up case for travel.",
      features: ["8 brushes for face and eyes", "Soft synthetic bristles", "Roll-up travel case"],
      specs: [["Pieces", "8 brushes + case"], ["Bristles", "Synthetic"], ["Handles", "Birch wood"]],
      options: [] },
    { id: "hex-dumbbell-pair", cat: "fitness", sub: "Weights", name: "Hex Rubber Dumbbell Pair", price: 5400, sale: null, stock: "in", pop: 76, best: false, isNew: false, tags: [],
      img: "1638536532686-d610adfc8e5c", by: ["VD Photography", "vdphotography"], alt: "Pair of black hex dumbbells on the floor",
      short: "Anti-roll hex heads with knurled steel handles.",
      desc: "Rubber-coated hex heads won't roll away or scuff floors, and the knurled chrome handles give a secure grip from warm-up to last rep.",
      features: ["Sold as a pair", "Anti-roll hex shape", "Knurled chrome handle"],
      specs: [["Material", "Rubber-coated cast iron"], ["Weights", "5, 10 or 15 lb each"]],
      options: [{ name: "Weight (each)", values: [{ v: "5 lb" }, { v: "10 lb", d: 1600 }, { v: "15 lb", d: 3200 }] }] },
    { id: "trail-steel-bottle", cat: "fitness", sub: "Hydration", name: "Trail Insulated Steel Bottle", price: 2600, sale: 1900, stock: "in", pop: 90, best: true, isNew: false, tags: ["gift"],
      img: "1602143407151-7111542de6e8", by: ["Joan Tran", "joanofarts"], alt: "Green stainless steel water bottle on a white table",
      short: "Cold for 24 hours, hot for 12, leak-proof lid.",
      desc: "Double-wall vacuum insulation keeps drinks icy all day. The powder-coated finish resists sweat and scratches, and the leak-proof lid has a carry loop.",
      features: ["Double-wall vacuum insulation", "Leak-proof lid with loop", "BPA-free, dishwasher-safe lid"],
      specs: [["Capacity", "750 ml"], ["Material", "18/8 stainless steel"], ["Cold / hot", "24 h / 12 h"]],
      options: [{ name: "Color", values: [{ v: "Fern" }, { v: "Sand" }, { v: "Ink" }] }] },
    { id: "home-studio-kit", cat: "fitness", sub: "Kits", name: "Home Studio Workout Kit", price: 8900, sale: null, stock: "in", pop: 73, best: false, isNew: true, tags: [],
      img: "1746796751590-a8c0f15d4900", by: ["Andrea Stuart", "andreastuart"], alt: "Yoga mat, small weights and a towel ready for a workout",
      short: "Mat, light weights and towel — a full studio in one box.",
      desc: "Everything for low-impact strength and mobility sessions at home: a 6 mm non-slip mat, a pair of 2 lb weights and a quick-dry towel.",
      features: ["6 mm non-slip mat", "Pair of 2 lb neoprene weights", "Quick-dry microfibre towel"],
      specs: [["Mat", "183 × 61 cm, 6 mm"], ["Weights", "2 × 2 lb"], ["Towel", "Microfibre, 100 × 50 cm"]],
      options: [] },
    { id: "clover-plush-bear", cat: "toys", sub: "Plush", name: "Clover Plush Teddy Bear", price: 2400, sale: null, stock: "in", pop: 85, best: false, isNew: false, tags: ["cozy", "gift"],
      img: "1652501595862-1d06fe543544", by: ["Izabelly Marques", "izamarques"], alt: "Soft stuffed bear wearing a green ribbon bow",
      short: "Ultra-soft plush with a green ribbon bow.",
      desc: "Clover is huggably soft, with embroidered features and a satin bow. Surface washable and tested to toy-safety standards (demo claim).",
      features: ["Embroidered eyes and nose", "Surface washable", "30 cm tall"],
      specs: [["Height", "30 cm"], ["Material", "Polyester plush"], ["Age", "0+"]],
      options: [] },
    { id: "rainbow-block-builder", cat: "toys", sub: "Blocks", name: "Rainbow Wooden Block Builder", price: 3800, sale: 2900, stock: "in", pop: 78, best: false, isNew: false, tags: ["gift"],
      img: "1638802538115-041e14d28d6a", by: ["Karl Abuid", "spongzy"], alt: "Colourful building made of wooden blocks", fy: 0.45,
      short: "60 solid-wood blocks in bright, child-safe colours.",
      desc: "Sixty solid beech blocks in arches, pillars and cubes. Water-based paints, rounded edges and a canvas storage bag.",
      features: ["60 solid wood pieces", "Water-based paint", "Canvas storage bag"],
      specs: [["Pieces", "60"], ["Material", "Beech wood"], ["Age", "18 months+"]],
      options: [] },
    { id: "heirloom-abc-blocks", cat: "toys", sub: "Learning", name: "Heirloom ABC Letter Blocks", price: 3200, sale: null, stock: "in", pop: 66, best: false, isNew: true, tags: ["gift"],
      img: "1558907353-ceb54f3882ed", by: ["Susan Holt Simpson", "shs521"], alt: "Wooden letter blocks",
      short: "Classic embossed letter blocks for spelling and stacking.",
      desc: "Twenty-eight embossed blocks with letters, numbers and pictures — the kind that get handed down.",
      features: ["28 embossed blocks", "Letters, numbers and pictures", "Wooden keepsake box"],
      specs: [["Pieces", "28"], ["Block size", "4.5 cm"], ["Age", "2+"]],
      options: [] }
  ];

  var HERO_IMG = { id: "1664455340023-214c33a9d0bd", by: ["Shutter Speed", "shutter_speed_"] };

  /* ------------------------------------------------------------------
     3. Helpers
     ------------------------------------------------------------------ */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var fmt = new Intl.NumberFormat(CONFIG.locale, { style: "currency", currency: CONFIG.currency });
  function money(c) { return fmt.format(Math.round(c) / 100); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function byId(id) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; return null; }
  function catById(id) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i]; return null; }
  function unitBase(p) { return p.sale || p.price; }
  function params() { return new URLSearchParams(location.search); }
  function store(k, v) {
    try {
      if (v === undefined) return JSON.parse(localStorage.getItem(CONFIG.storageKey + ":" + k));
      localStorage.setItem(CONFIG.storageKey + ":" + k, JSON.stringify(v));
    } catch (e) { return null; }
  }
  function storeDel(k) { try { localStorage.removeItem(CONFIG.storageKey + ":" + k); } catch (e) {} }

  /* Unsplash image URL (imgix parameters). view: 0 full, 1 close-up, 2 detail */
  function img(id, w, h, view, p) {
    var u = "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&q=72&w=" + w + "&h=" + (h || w);
    var fx = (p && p.fx) || 0.5, fy = (p && p.fy) || 0.5;
    if (view === 1) u += "&crop=focalpoint&fp-x=" + fx + "&fp-y=" + fy + "&fp-z=1.7";
    else if (view === 2) u += "&crop=focalpoint&fp-x=" + Math.max(0.3, fx - 0.12) + "&fp-y=" + Math.min(0.7, fy + 0.1) + "&fp-z=2.6";
    else if (p && (p.fx || p.fy)) u += "&crop=focalpoint&fp-x=" + fx + "&fp-y=" + fy;
    else u += "&crop=entropy";
    return u;
  }
  function credit(by) { return '<a href="https://unsplash.com/@' + by[1] + '?utm_source=orbit_lane_demo&utm_medium=referral" target="_blank" rel="noopener">' + esc(by[0]) + '</a> on <a href="https://unsplash.com/?utm_source=orbit_lane_demo&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a>'; }

  /* Placeholder if a remote photo fails to load (offline, blocked, etc.) */
  function placeholder(label) {
    var t = (label || "Orbit Lane").replace(/[^A-Za-z0-9 &]/g, "").slice(0, 22);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#ecebff"/><ellipse cx="200" cy="185" rx="92" ry="40" fill="none" stroke="#3b2bf5" stroke-width="10" transform="rotate(-24 200 185)"/><circle cx="200" cy="185" r="34" fill="#3b2bf5"/><circle cx="276" cy="150" r="12" fill="#d6f35b"/><text x="200" y="300" font-family="Arial" font-size="22" font-weight="700" fill="#15122e" text-anchor="middle">' + t + "</text></svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG" && !t.dataset.fallback) { t.dataset.fallback = "1"; t.src = placeholder(t.getAttribute("data-label") || t.alt); }
  }, true);

  var ICON = {
    plus: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    x: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    left: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    right: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
  };

  var STOCK_LABEL = { "in": "In stock", low: "Only a few left", out: "Out of stock", pre: "Pre-order" };

  /* ------------------------------------------------------------------
     4. Cart state & pricing
     ------------------------------------------------------------------ */
  var Cart = {
    items: [],
    promo: null,
    load: function () {
      var raw = store("cart") || [];
      this.items = raw.filter(function (it) { var p = byId(it.id); return p && p.stock !== "out" && it.qty > 0; });
      var pr = store("promo");
      this.promo = pr && PROMOS[pr] ? pr : null;
    },
    save: function () { store("cart", this.items); if (this.promo) store("promo", this.promo); else storeDel("promo"); emit(); },
    key: function (id, opts) { return id + "|" + (opts || []).join("|"); },
    add: function (id, opts, qty) {
      var p = byId(id); if (!p || p.stock === "out") return false;
      opts = opts || defaultOpts(p);
      var k = this.key(id, opts), found = null;
      this.items.forEach(function (it) { if (it.key === k) found = it; });
      if (found) found.qty = Math.min(99, found.qty + (qty || 1));
      else this.items.push({ key: k, id: id, opts: opts, qty: Math.min(99, qty || 1) });
      this.save(); return true;
    },
    setQty: function (k, q) {
      q = Math.max(0, Math.min(99, parseInt(q, 10) || 0));
      this.items = this.items.filter(function (it) { if (it.key === k) it.qty = q; return it.qty > 0; });
      this.save();
    },
    remove: function (k) { this.items = this.items.filter(function (it) { return it.key !== k; }); this.save(); },
    clear: function () { this.items = []; this.promo = null; this.save(); },
    count: function () { return this.items.reduce(function (n, it) { return n + it.qty; }, 0); }
  };

  function defaultOpts(p) { return (p.options || []).map(function (o) { return o.values[0].v; }); }
  function unitPrice(p, opts) {
    var u = unitBase(p);
    (p.options || []).forEach(function (o, i) { o.values.forEach(function (val) { if (opts && val.v === opts[i] && val.d) u += val.d; }); });
    return u;
  }
  function wasPrice(p, opts) {
    if (!p.sale) return null;
    var u = p.price;
    (p.options || []).forEach(function (o, i) { o.values.forEach(function (val) { if (opts && val.v === opts[i] && val.d) u += val.d; }); });
    return u;
  }

  /* Totals for the current cart. method = shipping method key. */
  function totals(method, promoCode) {
    method = method || "standard";
    var code = promoCode === undefined ? Cart.promo : promoCode;
    var promo = code ? PROMOS[code] : null;
    var subtotal = 0, gamingSub = 0, savings = 0;
    Cart.items.forEach(function (it) {
      var p = byId(it.id), u = unitPrice(p, it.opts), w = wasPrice(p, it.opts);
      subtotal += u * it.qty;
      if (p.cat === "gaming") gamingSub += u * it.qty;
      if (w) savings += (w - u) * it.qty;
    });
    var discount = 0, promoNote = "";
    if (promo) {
      if (promo.type === "percent") {
        if (promo.min && subtotal < promo.min) promoNote = "Add " + money(promo.min - subtotal) + " more to use " + code + ".";
        else if (promo.cat) { discount = Math.round(gamingSub * promo.value / 100); if (!discount) promoNote = code + " applies to gaming items only."; }
        else discount = Math.round(subtotal * promo.value / 100);
      }
    }
    var afterDisc = subtotal - discount;
    var m = CONFIG.shipping[method] || CONFIG.shipping.standard;
    var ship = m.price;
    var freeStd = method === "standard" && (afterDisc >= CONFIG.freeShipThreshold || (promo && promo.type === "ship"));
    if (freeStd) ship = 0;
    if (subtotal === 0) ship = 0;
    var tax = Math.round(afterDisc * CONFIG.taxRate);
    return { subtotal: subtotal, discount: discount, savings: savings, ship: ship, tax: tax, total: afterDisc + ship + tax, promoNote: promoNote, toFree: Math.max(0, CONFIG.freeShipThreshold - afterDisc), afterDisc: afterDisc };
  }

  var listeners = [];
  function onCart(fn) { listeners.push(fn); }
  function emit() { listeners.forEach(function (fn) { fn(); }); }
  window.addEventListener("storage", function (e) { if (e.key && e.key.indexOf(CONFIG.storageKey) === 0) { Cart.load(); emit(); } });

  /* ------------------------------------------------------------------
     5. Shared UI: cards, toasts, header, drawer
     ------------------------------------------------------------------ */
  function priceHTML(p, opts) {
    var u = unitPrice(p, opts), w = wasPrice(p, opts);
    return '<span class="price"><span class="now' + (w ? " sale" : "") + '">' + money(u) + "</span>" + (w ? '<span class="was"><span class="sr-only">Was </span>' + money(w) + "</span>" : "") + "</span>";
  }
  function badgesHTML(p) {
    var b = "";
    if (p.sale) b += '<span class="badge badge-sale">−' + Math.round((1 - p.sale / p.price) * 100) + "%</span>";
    if (p.isNew) b += '<span class="badge badge-new">New</span>';
    if (p.best) b += '<span class="badge badge-best">Best seller</span>';
    if (p.stock === "pre") b += '<span class="badge">Pre-order</span>';
    return b ? '<div class="badges">' + b + "</div>" : "";
  }
  function cardHTML(p, list) {
    var c = catById(p.cat), dis = p.stock === "out";
    return '<article class="card' + (list ? " list" : "") + '">' +
      '<a class="card-media" href="product.html?id=' + p.id + '" tabindex="-1" aria-hidden="true">' + badgesHTML(p) +
      '<img src="' + img(p.img, 600, 600, 0, p) + '" alt="' + esc(p.alt) + '" data-label="' + esc(p.name) + '" loading="lazy" width="600" height="600"></a>' +
      '<div class="card-body"><span class="card-cat">' + esc(c.name) + "</span>" +
      '<a class="card-title" href="product.html?id=' + p.id + '">' + esc(p.name) + "</a>" +
      '<p class="card-desc">' + esc(p.short) + "</p>" +
      '<span class="stock stock-' + p.stock + '">' + STOCK_LABEL[p.stock] + "</span>" +
      '<div class="card-foot">' + priceHTML(p) +
      '<button class="add-btn" type="button" data-add="' + p.id + '"' + (dis ? " disabled" : "") + ' aria-label="' + (dis ? "Out of stock: " : "Add to cart: ") + esc(p.name) + '">' + ICON.plus + "</button></div></div></article>";
  }

  function toast(html, ms) {
    var wrap = $(".toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; wrap.setAttribute("role", "status"); wrap.setAttribute("aria-live", "polite"); document.body.appendChild(wrap); }
    var t = document.createElement("div"); t.className = "toast"; t.innerHTML = html; wrap.appendChild(t);
    setTimeout(function () { t.remove(); }, ms || 3200);
  }
  function addedToast(p) {
    toast('<img src="' + img(p.img, 80, 80, 0, p) + '" alt="" data-label="' + esc(p.name) + '"><span><strong>Added to cart</strong><br>' + esc(p.name) + '</span><a href="cart.html">View cart</a>');
    var b = $(".cart-btn"); if (b) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
  }

  // Delegated quick-add for every [data-add] button
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]");
    if (!b) return;
    e.preventDefault();
    var p = byId(b.getAttribute("data-add"));
    if (p && Cart.add(p.id)) { addedToast(p); }
  });

  // Copy promo code buttons
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-code]");
    if (!b) return;
    var code = b.getAttribute("data-code");
    var done = function () { toast("Code <strong>" + code + "</strong> copied — apply it in your cart."); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, done); else done();
  });

  function updateBadges() {
    var n = Cart.count(), t = totals();
    $$("[data-cart-count]").forEach(function (el) { el.textContent = n; });
    $$("[data-cart-sub]").forEach(function (el) { el.textContent = money(t.subtotal); });
    $$(".tcount").forEach(function (el) { el.hidden = n === 0; });
    var cb = $(".cart-btn"); if (cb) cb.setAttribute("aria-label", "Open cart, " + n + " item" + (n === 1 ? "" : "s"));
  }

  function lineHTML(it, compact) {
    var p = byId(it.id), u = unitPrice(p, it.opts), w = wasPrice(p, it.opts);
    var optTxt = (p.options || []).map(function (o, i) { return o.name + ": " + it.opts[i]; }).join(" · ");
    return '<li class="line" data-key="' + esc(it.key) + '">' +
      '<img src="' + img(p.img, 168, 168, 0, p) + '" alt="" data-label="' + esc(p.name) + '" loading="lazy">' +
      '<div><h3><a href="product.html?id=' + p.id + '">' + esc(p.name) + "</a></h3>" +
      (optTxt ? '<div class="variant">' + esc(optTxt) + "</div>" : "") +
      '<div class="variant">' + money(u) + " each" + (w ? ' · <s>' + money(w) + "</s>" : "") + "</div>" +
      '<div class="controls"><div class="qty" role="group" aria-label="Quantity for ' + esc(p.name) + '">' +
      '<button type="button" data-q="-1" aria-label="Decrease quantity">−</button>' +
      '<input type="number" inputmode="numeric" min="1" max="99" value="' + it.qty + '" aria-label="Quantity" data-qi>' +
      '<button type="button" data-q="1" aria-label="Increase quantity">+</button></div>' +
      '<button class="remove" type="button" data-remove>Remove</button></div></div>' +
      '<div class="lprice">' + money(u * it.qty) + (it.qty > 1 && !compact ? "<small>" + it.qty + " × " + money(u) + "</small>" : "") + "</div></li>";
  }

  function bindLines(root) {
    root.addEventListener("click", function (e) {
      var li = e.target.closest(".line"); if (!li) return;
      var k = li.getAttribute("data-key"), it = Cart.items.filter(function (x) { return x.key === k; })[0];
      if (!it) return;
      if (e.target.closest("[data-q]")) Cart.setQty(k, it.qty + parseInt(e.target.closest("[data-q]").getAttribute("data-q"), 10));
      else if (e.target.closest("[data-remove]")) { Cart.remove(k); toast("Removed " + esc(byId(it.id).name)); }
    });
    root.addEventListener("change", function (e) {
      if (!e.target.matches("[data-qi]")) return;
      var li = e.target.closest(".line"); Cart.setQty(li.getAttribute("data-key"), e.target.value);
    });
  }

  function shipMeterHTML(t) {
    if (!Cart.items.length) return "";
    var pct = Math.min(100, Math.round(100 * t.afterDisc / CONFIG.freeShipThreshold));
    var free = Cart.promo === "FREESHIP" || t.toFree === 0;
    return '<div class="ship-meter">' + (free ? "<strong>You've unlocked free standard shipping.</strong>" : "You're <strong>" + money(t.toFree) + "</strong> away from free standard shipping.") +
      '<div class="bar" aria-hidden="true"><i style="width:' + (free ? 100 : pct) + '%"></i></div></div>';
  }

  function initDrawer() {
    var drawer = $("#cart-drawer"), back = $(".drawer-back"), lastFocus = null;
    if (!drawer) return;
    function render() {
      var body = $(".drawer-body", drawer), t = totals();
      if (!Cart.items.length) {
        body.innerHTML = '<div class="cart-empty"><h3>Your cart is empty</h3><p class="muted">Browse today\'s deals and add something nice.</p><a class="btn btn-primary" href="shop.html">Start shopping</a></div>';
        $(".drawer-foot", drawer).hidden = true;
      } else {
        body.innerHTML = shipMeterHTML(t) + '<ul class="line-items">' + Cart.items.map(function (it) { return lineHTML(it, true); }).join("") + "</ul>";
        $(".drawer-foot", drawer).hidden = false;
        $("[data-drawer-sub]", drawer).textContent = money(t.subtotal - t.discount);
      }
    }
    function open() {
      if (/cart\.html$|checkout\.html$/.test(location.pathname)) { location.href = "cart.html"; return; }
      lastFocus = document.activeElement; render();
      drawer.classList.add("open"); back.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); drawer.removeAttribute("inert");
      document.body.style.overflow = "hidden"; setTimeout(function () { $(".drawer-close", drawer).focus(); }, 50);
    }
    function close() {
      drawer.classList.remove("open"); back.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); drawer.setAttribute("inert", "");
      document.body.style.overflow = ""; if (lastFocus) lastFocus.focus();
    }
    bindLines(drawer);
    $$("[data-open-cart]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); open(); }); });
    $(".drawer-close", drawer).addEventListener("click", close);
    back.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (!drawer.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        var f = $$("a[href],button:not([disabled]),input", drawer).filter(function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    onCart(function () { if (drawer.classList.contains("open")) render(); });
  }

  function initSearch() {
    $$("form.search").forEach(function (form) {
      var input = $("input", form), sel = $("select", form), box = $(".suggest", form), idx = -1;
      if (sel) { var pc = params().get("cat"); if (pc && catById(pc)) sel.value = pc; }
      var pq = params().get("q"); if (pq && input) input.value = pq;
      function close() { box.classList.remove("open"); input.setAttribute("aria-expanded", "false"); idx = -1; }
      function show() {
        var q = input.value.trim().toLowerCase();
        if (q.length < 2) { close(); return; }
        var res = searchProducts(q, sel && sel.value).slice(0, 5);
        if (!res.length) { box.innerHTML = '<p style="padding:.75rem;margin:0" class="muted">No matches for “' + esc(q) + '”. Press Enter to see all results.</p>'; }
        else box.innerHTML = res.map(function (p, i) {
          return '<a href="product.html?id=' + p.id + '" role="option" id="sg-' + i + '"><img src="' + img(p.img, 88, 88, 0, p) + '" alt="" data-label="' + esc(p.name) + '"><span>' + esc(p.name) + "<small>" + esc(catById(p.cat).name) + "</small></span><b>" + money(unitBase(p)) + "</b></a>";
        }).join("") + '<a class="all" href="shop.html?q=' + encodeURIComponent(input.value.trim()) + '">See all results</a>';
        box.classList.add("open"); input.setAttribute("aria-expanded", "true");
      }
      input.addEventListener("input", show);
      input.addEventListener("focus", show);
      input.addEventListener("keydown", function (e) {
        var opts = $$('a[role="option"]', box);
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          if (!opts.length) return; e.preventDefault();
          idx = (idx + (e.key === "ArrowDown" ? 1 : -1) + opts.length) % opts.length;
          opts.forEach(function (o, i) { o.setAttribute("aria-selected", i === idx ? "true" : "false"); });
          input.setAttribute("aria-activedescendant", opts[idx].id);
        } else if (e.key === "Enter" && idx > -1 && opts[idx]) { e.preventDefault(); location.href = opts[idx].href; }
        else if (e.key === "Escape") close();
      });
      document.addEventListener("click", function (e) { if (!form.contains(e.target)) close(); });
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var u = new URLSearchParams(), q = input.value.trim();
        if (q) u.set("q", q);
        if (sel && sel.value) u.set("cat", sel.value);
        location.href = "shop.html" + (u.toString() ? "?" + u : "");
      });
    });
  }

  function initMega() {
    var btn = $(".dept-all"), mega = $("#mega");
    if (!btn || !mega) return;
    $(".mega-grid", mega).innerHTML = CATS.map(function (c) {
      var n = PRODUCTS.filter(function (p) { return p.cat === c.id; }).length;
      return '<a class="mega-cat" href="shop.html?cat=' + c.id + '"><img src="' + img(c.img, 240, 240) + '" alt="" data-label="' + esc(c.name) + '" loading="lazy"><strong>' + esc(c.name) + "</strong><small>" + n + " products · " + esc(c.subs.join(", ")) + "</small></a>";
    }).join("");
    function set(o) { mega.classList.toggle("open", o); btn.setAttribute("aria-expanded", o ? "true" : "false"); }
    btn.addEventListener("click", function (e) { e.stopPropagation(); set(!mega.classList.contains("open")); });
    document.addEventListener("click", function (e) { if (!mega.contains(e.target)) set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && mega.classList.contains("open")) { set(false); btn.focus(); } });
  }

  function searchProducts(q, cat) {
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return PRODUCTS.filter(function (p) {
      if (cat && p.cat !== cat) return false;
      var hay = (p.name + " " + p.short + " " + p.sub + " " + catById(p.cat).name + " " + p.tags.join(" ")).toLowerCase();
      return terms.every(function (t) { return hay.indexOf(t) > -1; });
    }).sort(function (a, b) { return b.pop - a.pop; });
  }

  function railControls() {
    $$("[data-rail-prev],[data-rail-next]").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = document.getElementById(b.getAttribute("data-rail-prev") || b.getAttribute("data-rail-next"));
        if (!r) return;
        var dir = b.hasAttribute("data-rail-next") ? 1 : -1;
        r.scrollBy({ left: dir * r.clientWidth * 0.9, behavior: "smooth" });
      });
    });
  }

  function countdowns() {
    var els = $$("[data-countdown]");
    if (!els.length) return;
    function tick() {
      var now = new Date(), end = new Date(now); end.setHours(24, 0, 0, 0);
      var s = Math.max(0, Math.floor((end - now) / 1000));
      var h = String(Math.floor(s / 3600)).padStart(2, "0"), m = String(Math.floor(s % 3600 / 60)).padStart(2, "0"), ss = String(s % 60).padStart(2, "0");
      els.forEach(function (el) { el.innerHTML = "<span>" + h + "</span><span>" + m + "</span><span>" + ss + "</span>"; el.setAttribute("aria-label", "Ends in " + h + " hours " + m + " minutes"); });
    }
    tick(); setInterval(tick, 1000);
  }

  function newsletter() {
    $$("form[data-newsletter]").forEach(function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var inp = $("input[type=email]", f), msg = $(".notice", f);
        var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(inp.value.trim());
        msg.hidden = false;
        if (!ok) { msg.className = "notice notice-err"; msg.textContent = "Please enter a valid email address."; inp.setAttribute("aria-invalid", "true"); inp.focus(); return; }
        inp.removeAttribute("aria-invalid");
        msg.className = "notice notice-ok";
        msg.textContent = "Demo only: nothing was sent and no email was stored. A live store would connect this to an email platform.";
        f.reset();
      });
    });
  }

  function reveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ------------------------------------------------------------------
     6. Page: Home
     ------------------------------------------------------------------ */
  function pageHome() {
    var heroImg = $("#hero-img"); if (heroImg) heroImg.src = img(HERO_IMG.id, 1100, 620);
    var deal = byId("pulse-anc-headphones"), dealBox = $("#deal");
    if (dealBox) {
      dealBox.innerHTML = '<div class="deal-top"><span class="eyebrow">Deal of the day</span><div class="countdown" data-countdown></div></div>' +
        '<a class="deal-img" href="product.html?id=' + deal.id + '"><img src="' + img(deal.img, 640, 640, 0, deal) + '" alt="' + esc(deal.alt) + '" data-label="' + esc(deal.name) + '"></a>' +
        '<div><h2 style="font-size:1.35rem;margin:0 0 .3rem"><a href="product.html?id=' + deal.id + '" style="text-decoration:none">' + esc(deal.name) + '</a></h2><p class="muted" style="margin:0 0 .6rem;font-size:.92rem">' + esc(deal.short) + "</p>" +
        '<div class="card-foot">' + priceHTML(deal) + '<button class="btn btn-primary btn-sm" type="button" data-add="' + deal.id + '">Add to cart</button></div></div>';
    }
    var depts = $("#depts");
    if (depts) depts.innerHTML = CATS.map(function (c) {
      var n = PRODUCTS.filter(function (p) { return p.cat === c.id; }).length;
      return '<a class="dept" href="shop.html?cat=' + c.id + '"><span class="bubble"><img src="' + img(c.img, 280, 280) + '" alt="" data-label="' + esc(c.name) + '" loading="lazy"></span><strong>' + esc(c.name) + "</strong><small>" + n + " items</small></a>";
    }).join("");
    function fill(id, list) { var el = document.getElementById(id); if (el) el.innerHTML = list.map(function (p) { return cardHTML(p); }).join(""); }
    fill("rail-featured", ["stride-smartwatch", "harbor-knit-throw", "tkl-rgb-keyboard", "saddle-leather-backpack", "vitamin-c-glow-drops", "ember-mini-speaker", "home-studio-kit", "rainbow-block-builder"].map(byId));
    fill("grid-new", PRODUCTS.filter(function (p) { return p.isNew; }).slice(0, 4));
    fill("rail-flash", PRODUCTS.filter(function (p) { return p.sale; }));
    var best = PRODUCTS.slice().sort(function (a, b) { return b.pop - a.pop; }).slice(0, 6);
    var feat = $("#rank-feature"), list = $("#rank-list");
    if (feat) {
      var b0 = best[0];
      feat.href = "product.html?id=" + b0.id;
      feat.innerHTML = '<img src="' + img(b0.img, 600, 600, 0, b0) + '" alt="' + esc(b0.alt) + '" data-label="' + esc(b0.name) + '" loading="lazy"><div><span class="rank-num">#1</span><h3 style="font-size:1.5rem;margin:.6rem 0 .4rem">' + esc(b0.name) + '</h3><p class="muted">' + esc(b0.short) + "</p>" + priceHTML(b0) + "</div>";
    }
    if (list) list.innerHTML = best.slice(1).map(function (p, i) {
      return '<li><a href="product.html?id=' + p.id + '"><span class="n">' + (i + 2) + '</span><img src="' + img(p.img, 128, 128, 0, p) + '" alt="" data-label="' + esc(p.name) + '" loading="lazy"><span><strong>' + esc(p.name) + "</strong><small>" + esc(catById(p.cat).name) + "</small></span>" + priceHTML(p) + "</a></li>";
    }).join("");
    var season = $("#season-grid");
    if (season) season.innerHTML = ["harbor-knit-throw", "amber-candle-set", "clover-plush-bear", "matte-ceramic-planter"].map(byId).map(function (p) {
      return '<a href="product.html?id=' + p.id + '"><img src="' + img(p.img, 520, 420, 0, p) + '" alt="' + esc(p.alt) + '" data-label="' + esc(p.name) + '" loading="lazy"><span>' + esc(p.name.split(" ").slice(0, 3).join(" ")) + " · " + money(unitBase(p)) + "</span></a>";
    }).join("");
  }

  /* ------------------------------------------------------------------
     7. Page: Shop (catalog, search results, filters, sorting)
     ------------------------------------------------------------------ */
  function pageShop() {
    var P = params();
    var maxPrice = Math.ceil(Math.max.apply(null, PRODUCTS.map(function (p) { return p.price; })) / 1000) * 10; // dollars
    var state = {
      q: P.get("q") || "",
      cats: (P.get("cat") || "").split(",").filter(catById),
      min: parseInt(P.get("min"), 10) || 0,
      max: parseInt(P.get("max"), 10) || maxPrice,
      avail: P.get("avail") === "1",
      sale: P.get("sale") === "1" || P.get("collection") === "sale",
      collection: COLLECTIONS[P.get("collection")] && P.get("collection") !== "sale" ? P.get("collection") : "",
      sort: P.get("sort") || (P.get("q") ? "relevance" : "featured"),
      view: store("view") || "grid"
    };
    if (state.max > maxPrice) state.max = maxPrice;
    var grid = $("#results"), count = $("#result-count"), title = $("#result-title"), af = $("#active-filters");
    var catBox = $("#f-cats"), minI = $("#f-min"), maxI = $("#f-max"), minR = $("#r-min"), maxR = $("#r-max"), fill = $(".dual .fill");
    [minR, maxR].forEach(function (r) { r.max = maxPrice; });
    maxI.max = minI.max = maxPrice;

    catBox.innerHTML = CATS.map(function (c) {
      var n = PRODUCTS.filter(function (p) { return p.cat === c.id; }).length;
      return '<label><input type="checkbox" value="' + c.id + '"' + (state.cats.indexOf(c.id) > -1 ? " checked" : "") + "> " + esc(c.name) + '<span class="n">' + n + "</span></label>";
    }).join("");
    $("#f-avail").checked = state.avail; $("#f-sale").checked = state.sale;
    $("#sort").value = state.sort;
    var qInput = $("#f-q"); qInput.value = state.q;

    function syncPrice() {
      minI.value = state.min; maxI.value = state.max; minR.value = state.min; maxR.value = state.max;
      fill.style.left = (state.min / maxPrice * 100) + "%"; fill.style.right = (100 - state.max / maxPrice * 100) + "%";
    }
    syncPrice();

    function apply() {
      var list = state.q ? searchProducts(state.q) : PRODUCTS.slice();
      list = list.filter(function (p) {
        var u = unitBase(p) / 100;
        if (state.cats.length && state.cats.indexOf(p.cat) < 0) return false;
        if (u < state.min || u > state.max) return false;
        if (state.avail && (p.stock === "out")) return false;
        if (state.sale && !p.sale) return false;
        if (state.collection && !COLLECTIONS[state.collection].test(p)) return false;
        return true;
      });
      var s = state.sort;
      if (s === "price-asc") list.sort(function (a, b) { return unitBase(a) - unitBase(b); });
      else if (s === "price-desc") list.sort(function (a, b) { return unitBase(b) - unitBase(a); });
      else if (s === "popular") list.sort(function (a, b) { return b.pop - a.pop; });
      else if (s === "newest") list.sort(function (a, b) { return (b.isNew - a.isNew) || (b.pop - a.pop); });
      else if (s === "category") list.sort(function (a, b) { return CATS.indexOf(catById(a.cat)) - CATS.indexOf(catById(b.cat)) || a.name.localeCompare(b.name); });
      else if (s === "discount") list.sort(function (a, b) { return ((b.price - unitBase(b)) / b.price) - ((a.price - unitBase(a)) / a.price); });
      else if (s === "featured") list.sort(function (a, b) { return (b.best - a.best) || (b.pop - a.pop); });

      // Title
      var t = "All products";
      if (state.q) t = "Results for “" + state.q + "”";
      else if (state.collection) t = COLLECTIONS[state.collection].name;
      else if (state.cats.length === 1) t = catById(state.cats[0]).name;
      else if (state.sale) t = "On sale";
      title.textContent = t;
      document.title = t + " | Orbit Lane (Demo Store)";
      var cb = $("#crumb-current"); if (cb) cb.textContent = t;
      var blurb = $("#result-blurb");
      if (blurb) blurb.textContent = state.collection ? COLLECTIONS[state.collection].blurb : (state.cats.length === 1 ? catById(state.cats[0]).blurb + "." : "Shop every department in one place.");
      count.textContent = list.length + (list.length === 1 ? " product" : " products");

      // Active filter chips
      var chips = [];
      if (state.q) chips.push(["q", "Search: " + state.q]);
      state.cats.forEach(function (c) { chips.push(["cat:" + c, catById(c).name]); });
      if (state.min > 0 || state.max < maxPrice) chips.push(["price", "$" + state.min + " – $" + state.max]);
      if (state.avail) chips.push(["avail", "In stock"]);
      if (state.sale) chips.push(["sale", "On sale"]);
      if (state.collection) chips.push(["collection", COLLECTIONS[state.collection].name]);
      af.innerHTML = chips.map(function (c) { return '<button class="afchip" type="button" data-clear="' + esc(c[0]) + '">' + esc(c[1]) + ' <span aria-hidden="true">×</span><span class="sr-only">Remove filter</span></button>'; }).join("") +
        (chips.length > 1 ? '<button class="afchip" type="button" data-clear="all" style="background:transparent;text-decoration:underline">Clear all</button>' : "");

      if (!list.length) {
        grid.className = "";
        grid.innerHTML = '<div class="empty"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><circle cx="27" cy="27" r="16"/><path d="M39 39l14 14M21 27h12"/></svg><h2>No products match' + (state.q ? " “" + esc(state.q) + "”" : " these filters") + "</h2>" +
          '<p class="muted">Try a different spelling, fewer words, or remove a filter.</p><button class="btn btn-primary" type="button" data-clear="all">Clear search &amp; filters</button>' +
          '<div class="suggest-chips"><span class="muted">Popular:</span>' + ["headphones", "candle", "keyboard", "bottle", "blocks"].map(function (w) { return '<a class="chip" style="background:#fff" href="shop.html?q=' + w + '">' + w + "</a>"; }).join("") + "</div></div>";
      } else {
        grid.className = state.view === "list" ? "list-view" : "grid";
        if (state.view === "list") grid.style.cssText = "display:grid;gap:12px"; else grid.style.cssText = "";
        grid.innerHTML = list.map(function (p) { return cardHTML(p, state.view === "list"); }).join("");
      }
      $$(".view-toggle button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-view") === state.view ? "true" : "false"); });
      $("#filter-count").textContent = chips.length ? "(" + chips.length + ")" : "";

      // URL
      var u = new URLSearchParams();
      if (state.q) u.set("q", state.q);
      if (state.cats.length) u.set("cat", state.cats.join(","));
      if (state.min > 0) u.set("min", state.min);
      if (state.max < maxPrice) u.set("max", state.max);
      if (state.avail) u.set("avail", "1");
      if (state.sale) u.set("sale", "1");
      if (state.collection) u.set("collection", state.collection);
      if (state.sort !== (state.q ? "relevance" : "featured")) u.set("sort", state.sort);
      try { history.replaceState(null, "", "shop.html" + (u.toString() ? "?" + u : "")); } catch (e) {}
      // Highlight dept chip
      $$(".chips .chip").forEach(function (c) {
        var m = (c.getAttribute("href") || "").match(/cat=([a-z]+)/);
        if (m) c.toggleAttribute("aria-current", state.cats.length === 1 && state.cats[0] === m[1]); if (c.hasAttribute("aria-current")) c.setAttribute("aria-current", "page");
      });
    }

    catBox.addEventListener("change", function () { state.cats = $$("input:checked", catBox).map(function (i) { return i.value; }); apply(); });
    $("#f-avail").addEventListener("change", function (e) { state.avail = e.target.checked; apply(); });
    $("#f-sale").addEventListener("change", function (e) { state.sale = e.target.checked; apply(); });
    $("#sort").addEventListener("change", function (e) { state.sort = e.target.value; apply(); });
    var qt; qInput.addEventListener("input", function () { clearTimeout(qt); qt = setTimeout(function () { state.q = qInput.value.trim(); if (state.q && state.sort === "featured") { state.sort = "relevance"; $("#sort").value = "relevance"; } apply(); }, 200); });
    function fromRange(which) {
      var a = parseInt(minR.value, 10), b = parseInt(maxR.value, 10);
      if (a > b - 5) { if (which === "min") a = b - 5; else b = a + 5; }
      state.min = Math.max(0, a); state.max = Math.min(maxPrice, b); syncPrice(); apply();
    }
    minR.addEventListener("input", function () { fromRange("min"); });
    maxR.addEventListener("input", function () { fromRange("max"); });
    function fromInputs() {
      var a = Math.max(0, parseInt(minI.value, 10) || 0), b = Math.min(maxPrice, parseInt(maxI.value, 10) || maxPrice);
      if (a > b) { var t = a; a = b; b = t; }
      state.min = a; state.max = b; syncPrice(); apply();
    }
    minI.addEventListener("change", fromInputs); maxI.addEventListener("change", fromInputs);
    $$(".view-toggle button").forEach(function (b) { b.addEventListener("click", function () { state.view = b.getAttribute("data-view"); store("view", state.view); apply(); }); });

    document.addEventListener("click", function (e) {
      var c = e.target.closest("[data-clear]"); if (!c) return;
      var k = c.getAttribute("data-clear");
      if (k === "all") { state.q = ""; state.cats = []; state.min = 0; state.max = maxPrice; state.avail = false; state.sale = false; state.collection = ""; state.sort = "featured"; }
      else if (k === "q") { state.q = ""; if (state.sort === "relevance") state.sort = "featured"; }
      else if (k.indexOf("cat:") === 0) state.cats = state.cats.filter(function (x) { return x !== k.slice(4); });
      else if (k === "price") { state.min = 0; state.max = maxPrice; }
      else if (k === "avail") state.avail = false;
      else if (k === "sale") state.sale = false;
      else if (k === "collection") state.collection = "";
      qInput.value = state.q; $("#sort").value = state.sort; $("#f-avail").checked = state.avail; $("#f-sale").checked = state.sale;
      $$("input", catBox).forEach(function (i) { i.checked = state.cats.indexOf(i.value) > -1; });
      var hs = $(".masthead .search input"); if (hs) hs.value = state.q;
      syncPrice(); apply();
    });

    // Mobile filter sheet
    var sheet = $(".filters"), openB = $(".filter-open"), closeB = $(".filter-close"), back = $(".drawer-back");
    function setSheet(o) { sheet.classList.toggle("open", o); back.classList.toggle("open", o); openB.setAttribute("aria-expanded", o ? "true" : "false"); if (o) closeB.focus(); }
    openB.addEventListener("click", function () { setSheet(true); });
    closeB.addEventListener("click", function () { setSheet(false); openB.focus(); });
    $("#show-results").addEventListener("click", function () { setSheet(false); grid.scrollIntoView({ behavior: "smooth" }); });
    back.addEventListener("click", function () { if (sheet.classList.contains("open")) setSheet(false); });

    apply();
  }

  /* ------------------------------------------------------------------
     8. Page: Categories
     ------------------------------------------------------------------ */
  function pageCategories() {
    var m = $("#cat-mosaic");
    if (m) m.innerHTML = CATS.map(function (c, i) {
      var n = PRODUCTS.filter(function (p) { return p.cat === c.id; }).length;
      var sale = PRODUCTS.filter(function (p) { return p.cat === c.id && p.sale; }).length;
      return '<a class="cat-card' + (i < 2 ? " wide" : "") + '" href="shop.html?cat=' + c.id + '"><img src="' + img(c.img, 900, 640) + '" alt="" data-label="' + esc(c.name) + '" loading="lazy"><div class="inner"><span class="count">' + n + " products" + (sale ? " · " + sale + " on sale" : "") + "</span><h2>" + esc(c.name) + '</h2><p style="margin:0;opacity:.9">' + esc(c.blurb) + '</p><div class="subs">' + c.subs.map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("") + "</div></div></a>";
    }).join("");
    var cols = $("#collections");
    if (cols) cols.innerHTML = ["cozy", "gaming-week", "under-50", "new"].map(function (k) {
      var c = COLLECTIONS[k], n = PRODUCTS.filter(c.test).length;
      return '<a class="collection" href="shop.html?collection=' + k + '"><div><span class="eyebrow">Collection · ' + n + " items</span><h3>" + esc(c.name) + "</h3><p style=\"margin:0;opacity:.88\">" + esc(c.blurb) + '</p></div><span class="tile-cta">Shop collection ' + ICON.right + "</span></a>";
    }).join("");
  }

  /* ------------------------------------------------------------------
     9. Page: Product detail
     ------------------------------------------------------------------ */
  function pageProduct() {
    var id = params().get("id"), p = byId(id), root = $("#pdp");
    if (!p) {
      root.innerHTML = '<div class="empty" style="grid-column:1/-1"><h1 style="font-size:2rem">We couldn’t find that product</h1><p class="muted">It may have moved, or the link is incomplete.</p><a class="btn btn-primary" href="shop.html">Browse all products</a></div>';
      return;
    }
    var c = catById(p.cat), sel = defaultOpts(p), view = 0, VIEWS = ["Full view", "Close-up", "Detail"];
    document.title = p.name + " | Orbit Lane (Demo Store)";
    var md = $('meta[name="description"]'); if (md) md.setAttribute("content", p.short + " Fictional product in the Orbit Lane demo store by Virellion Apex.");
    $("#crumb-cat").innerHTML = '<a href="shop.html?cat=' + c.id + '">' + esc(c.name) + "</a>";
    $("#crumb-current").textContent = p.name;

    // JSON-LD for the product (demo data)
    var ld = document.createElement("script"); ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.desc, image: img(p.img, 1200, 1200, 0, p), category: c.name, brand: { "@type": "Brand", name: "Orbit Lane (fictional)" },
      offers: { "@type": "Offer", priceCurrency: "USD", price: (unitBase(p) / 100).toFixed(2), availability: "https://schema.org/" + ({ "in": "InStock", low: "LimitedAvailability", out: "OutOfStock", pre: "PreOrder" })[p.stock] } });
    document.head.appendChild(ld);

    var optsHTML = (p.options || []).map(function (o, oi) {
      return '<div class="opt-group"><span class="label" id="ol-' + oi + '">' + esc(o.name) + ': <span data-optval="' + oi + '">' + esc(sel[oi]) + '</span></span><div class="opts" role="radiogroup" aria-labelledby="ol-' + oi + '">' +
        o.values.map(function (v, vi) { return '<button type="button" class="opt" role="radio" data-o="' + oi + '" data-v="' + esc(v.v) + '" aria-checked="' + (vi === 0 ? "true" : "false") + '" tabindex="' + (vi === 0 ? "0" : "-1") + '">' + esc(v.v) + (v.d ? " (+" + money(v.d) + ")" : "") + "</button>"; }).join("") + "</div></div>";
    }).join("");
    var dis = p.stock === "out";
    root.innerHTML =
      '<div class="gallery"><div class="thumbs" role="tablist" aria-label="Product images">' + VIEWS.map(function (v, i) {
        return '<button type="button" role="tab" data-view="' + i + '" aria-current="' + (i === 0) + '" aria-selected="' + (i === 0) + '" aria-label="' + v + '"><img src="' + img(p.img, 168, 168, i, p) + '" alt="" data-label="' + esc(p.name) + '"></button>';
      }).join("") + "</div>" +
      '<div><div class="stage" id="stage"><img id="main-img" src="' + img(p.img, 1100, 1100, 0, p) + '" alt="' + esc(p.alt) + '" data-label="' + esc(p.name) + '">' +
      '<button class="nav prev" type="button" aria-label="Previous image">' + ICON.left + '</button><button class="nav next" type="button" aria-label="Next image">' + ICON.right + '</button><span class="view-label" id="view-label">Full view · 1 / 3</span></div>' +
      '<p class="photo-credit">Photo: ' + credit(p.by) + ". Hover or tap the image to zoom.</p></div></div>" +
      '<div class="buybox"><span class="eyebrow">' + esc(c.name) + " · " + esc(p.sub) + "</span><h1>" + esc(p.name) + "</h1>" +
      '<div class="buy-meta"><span id="pdp-price">' + priceHTML(p, sel) + "</span>" + (p.sale ? '<span class="save-pill" id="save-pill"></span>' : "") + '<span class="stock stock-' + p.stock + '">' + STOCK_LABEL[p.stock] + "</span></div>" +
      "<p>" + esc(p.short) + "</p>" + optsHTML +
      '<div class="buy-row"><div class="qty" role="group" aria-label="Quantity"><button type="button" data-step="-1" aria-label="Decrease quantity">−</button><input id="qty" type="number" inputmode="numeric" min="1" max="99" value="1" aria-label="Quantity"><button type="button" data-step="1" aria-label="Increase quantity">+</button></div>' +
      '<button class="btn btn-primary" id="add-main" type="button"' + (dis ? " disabled" : "") + ">" + (dis ? "Out of stock" : p.stock === "pre" ? "Pre-order — add to cart" : "Add to cart") + ' · <span id="add-total"></span></button></div>' +
      (dis ? '<p class="notice notice-warn">This item is out of stock in the demo. A live store could offer a back-in-stock email alert here.</p>' : "") +
      '<ul class="perks"><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>Free standard shipping on orders over ' + money(CONFIG.freeShipThreshold) + '</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4"/></svg>30-day returns (demo policy)</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>Demo checkout — no payment is taken</li></ul>' +
      '<div class="tabs"><div class="tablist" role="tablist" aria-label="Product information">' +
      '<button role="tab" id="t-d" aria-controls="p-d" aria-selected="true" tabindex="0" type="button">Description</button><button role="tab" id="t-s" aria-controls="p-s" aria-selected="false" tabindex="-1" type="button">Specifications</button><button role="tab" id="t-h" aria-controls="p-h" aria-selected="false" tabindex="-1" type="button">Shipping &amp; returns</button></div>' +
      '<div class="tabpanel" role="tabpanel" id="p-d" aria-labelledby="t-d"><p>' + esc(p.desc) + '</p><ul class="features">' + p.features.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="tabpanel" role="tabpanel" id="p-s" aria-labelledby="t-s" hidden><table class="spec"><tbody>' + p.specs.map(function (s) { return '<tr><th scope="row">' + esc(s[0]) + "</th><td>" + esc(s[1]) + "</td></tr>"; }).join("") + '<tr><th scope="row">SKU</th><td>OL-' + p.id.toUpperCase().slice(0, 10) + "</td></tr></tbody></table></div>" +
      '<div class="tabpanel" role="tabpanel" id="p-h" aria-labelledby="t-h" hidden><p>Standard shipping ' + money(CONFIG.shipping.standard.price) + " (free over " + money(CONFIG.freeShipThreshold) + "), Express " + money(CONFIG.shipping.express.price) + ", Next day " + money(CONFIG.shipping.nextday.price) + ", or free store pickup. Returns accepted within 30 days in original condition.</p><p class=\"muted\">All shipping and return terms are fictional and shown for demonstration.</p></div></div></div>";

    var stage = $("#stage"), main = $("#main-img");
    function setView(i) {
      view = (i + 3) % 3; main.src = img(p.img, 1100, 1100, view, p);
      $$(".thumbs button").forEach(function (b, bi) { b.setAttribute("aria-current", bi === view); b.setAttribute("aria-selected", bi === view); });
      $("#view-label").textContent = VIEWS[view] + " · " + (view + 1) + " / 3";
    }
    $$(".thumbs button").forEach(function (b) { b.addEventListener("click", function () { setView(+b.getAttribute("data-view")); }); });
    $(".prev", stage).addEventListener("click", function (e) { e.stopPropagation(); setView(view - 1); });
    $(".next", stage).addEventListener("click", function (e) { e.stopPropagation(); setView(view + 1); });
    stage.addEventListener("click", function () { stage.classList.toggle("zoom"); });
    stage.addEventListener("mousemove", function (e) { var r = stage.getBoundingClientRect(); main.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + "% " + ((e.clientY - r.top) / r.height * 100) + "%"; });
    stage.addEventListener("mouseleave", function () { stage.classList.remove("zoom"); });
    var sx = null; stage.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) setView(view + (dx < 0 ? 1 : -1)); sx = null; });

    var qty = $("#qty");
    function refresh() {
      var q = Math.max(1, Math.min(99, parseInt(qty.value, 10) || 1)); qty.value = q;
      $("#pdp-price").innerHTML = priceHTML(p, sel);
      $("#add-total").textContent = money(unitPrice(p, sel) * q);
      var sp = $("#save-pill"); if (sp) sp.textContent = "You save " + money(wasPrice(p, sel) - unitPrice(p, sel));
      var sb = $("#sticky-price"); if (sb) sb.textContent = money(unitPrice(p, sel));
    }
    $$("[data-step]").forEach(function (b) { b.addEventListener("click", function () { qty.value = (parseInt(qty.value, 10) || 1) + parseInt(b.getAttribute("data-step"), 10); refresh(); }); });
    qty.addEventListener("change", refresh);
    root.addEventListener("click", function (e) {
      var o = e.target.closest(".opt"); if (!o) return;
      var oi = +o.getAttribute("data-o"); sel[oi] = o.getAttribute("data-v");
      $$('.opt[data-o="' + oi + '"]').forEach(function (b) { var on = b === o; b.setAttribute("aria-checked", on); b.tabIndex = on ? 0 : -1; });
      $('[data-optval="' + oi + '"]').textContent = sel[oi]; refresh();
    });
    root.addEventListener("keydown", function (e) {
      var o = e.target.closest(".opt"); if (!o || ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].indexOf(e.key) < 0) return;
      e.preventDefault();
      var g = $$('.opt[data-o="' + o.getAttribute("data-o") + '"]'), i = g.indexOf(o) + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1);
      var n = g[(i + g.length) % g.length]; n.focus(); n.click();
    });
    function addMain() {
      if (dis) return;
      Cart.add(p.id, sel.slice(), parseInt(qty.value, 10) || 1); addedToast(p);
    }
    $("#add-main").addEventListener("click", addMain);

    // Tabs
    var tabs = $$('.tablist [role="tab"]');
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; $("#" + x.getAttribute("aria-controls")).hidden = !on; }); });
      t.addEventListener("keydown", function (e) { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var n = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length]; n.focus(); n.click(); } });
    });

    // Sticky buy bar (mobile)
    var sticky = $("#sticky-buy");
    if (sticky) {
      sticky.innerHTML = '<div><strong style="display:block;font-size:.9rem;line-height:1.2">' + esc(p.name) + '</strong><span id="sticky-price" style="font-weight:800">' + money(unitPrice(p, sel)) + '</span></div><button class="btn btn-primary btn-sm" type="button"' + (dis ? " disabled" : "") + ">" + (dis ? "Out of stock" : "Add to cart") + "</button>";
      $("button", sticky).addEventListener("click", addMain);
      var addBtn = $("#add-main");
      if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { sticky.classList.toggle("show", !en[0].isIntersecting && en[0].boundingClientRect.top < 0); }).observe(addBtn);
    }
    refresh();

    // Related + recently viewed
    var rel = PRODUCTS.filter(function (x) { return x.cat === p.cat && x.id !== p.id; });
    rel = rel.concat(PRODUCTS.filter(function (x) { return x.cat !== p.cat && x.tags.some(function (t) { return p.tags.indexOf(t) > -1; }); }).sort(function (a, b) { return b.pop - a.pop; })).slice(0, 8);
    $("#rail-related").innerHTML = rel.map(function (x) { return cardHTML(x); }).join("");
    var rv = (store("recent") || []).filter(function (x) { return x !== p.id && byId(x); });
    if (rv.length) { $("#recent-wrap").hidden = false; $("#rail-recent").innerHTML = rv.slice(0, 8).map(function (x) { return cardHTML(byId(x)); }).join(""); }
    store("recent", [p.id].concat(rv).slice(0, 10));
  }

  /* ------------------------------------------------------------------
     10. Page: Cart
     ------------------------------------------------------------------ */
  function summaryHTML(t, method) {
    var m = CONFIG.shipping[method || "standard"];
    return "<dl><dt>Subtotal (" + Cart.count() + " item" + (Cart.count() === 1 ? "" : "s") + ")</dt><dd>" + money(t.subtotal) + "</dd>" +
      (t.discount ? '<dt class="disc">Promo ' + esc(Cart.promo) + '</dt><dd class="disc">−' + money(t.discount) + "</dd>" : "") +
      "<dt>Shipping · " + esc(m.label) + "</dt><dd>" + (t.ship ? money(t.ship) : "Free") + "</dd>" +
      "<dt>Estimated tax (" + (CONFIG.taxRate * 100).toFixed(2) + "%)</dt><dd>" + money(t.tax) + "</dd>" +
      '<dt class="total-row">Total</dt><dd class="total-row" data-total>' + money(t.total) + "</dd></dl>" +
      (t.savings ? '<p class="notice notice-ok" style="margin-top:.85rem">You\'re saving ' + money(t.savings + t.discount) + " today.</p>" : "");
  }
  function promoUI(box, rerender) {
    var form = $(".promo-form", box), input = $("input", form), msg = $(".promo-msg", box), applied = $(".applied-wrap", box);
    function draw() {
      if (Cart.promo) {
        var t = totals();
        applied.innerHTML = '<div class="applied"><span>' + esc(Cart.promo) + " · " + esc(PROMOS[Cart.promo].label) + '</span><button type="button" data-unpromo>Remove</button></div>' + (t.promoNote ? '<p class="notice notice-warn">' + esc(t.promoNote) + "</p>" : "");
        form.hidden = true;
      } else { applied.innerHTML = ""; form.hidden = false; }
    }
    function applyCode(e) {
      if (e) e.preventDefault();
      var code = input.value.trim().toUpperCase();
      msg.hidden = false;
      if (!code) { msg.className = "promo-msg notice notice-err"; msg.textContent = "Enter a promo code."; return; }
      if (!PROMOS[code]) { msg.className = "promo-msg notice notice-err"; msg.textContent = "“" + code + "” isn’t a valid demo code. Try WELCOME10, ORBIT20, GAMER15 or FREESHIP."; input.setAttribute("aria-invalid", "true"); return; }
      input.removeAttribute("aria-invalid");
      Cart.promo = code; Cart.save(); input.value = "";
      msg.className = "promo-msg notice notice-ok"; msg.textContent = code + " applied: " + PROMOS[code].label + ".";
      draw(); rerender();
    }
    if (form.tagName === "FORM") form.addEventListener("submit", applyCode);
    else {
      $("[data-apply]", form).addEventListener("click", applyCode);
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") applyCode(e); });
    }
    box.addEventListener("click", function (e) { if (e.target.closest("[data-unpromo]")) { Cart.promo = null; Cart.save(); msg.hidden = true; draw(); rerender(); } });
    draw();
    return draw;
  }

  function pageCart() {
    var list = $("#cart-lines"), sum = $("#cart-summary-body"), wrap = $("#cart-wrap"), empty = $("#cart-empty"), meter = $("#cart-meter");
    bindLines(list);
    var drawPromo = promoUI($("#cart-summary"), render);
    function render() {
      var has = Cart.items.length > 0;
      wrap.hidden = !has; empty.hidden = has;
      $("#cart-heading-count").textContent = has ? "(" + Cart.count() + ")" : "";
      if (!has) return;
      var t = totals("standard");
      meter.innerHTML = shipMeterHTML(t);
      list.innerHTML = Cart.items.map(function (it) { return lineHTML(it); }).join("");
      sum.innerHTML = summaryHTML(t, "standard");
      drawPromo();
    }
    onCart(render);
    render();
    var recs = PRODUCTS.filter(function (p) { return p.stock !== "out" && !Cart.items.some(function (it) { return it.id === p.id; }); }).sort(function (a, b) { return b.pop - a.pop; }).slice(0, 8);
    $("#rail-recs").innerHTML = recs.map(function (p) { return cardHTML(p); }).join("");
    $("#clear-cart").addEventListener("click", function () { Cart.clear(); toast("Cart cleared"); });
  }

  /* ------------------------------------------------------------------
     11. Page: Checkout (demonstration — no payment, no real order)
     ------------------------------------------------------------------ */
  var RULES = {
    required: function (v) { return v.trim() ? "" : "This field is required."; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email address, like name@example.com."; },
    phone: function (v) { var d = v.replace(/\D/g, ""); return (d.length === 10 || (d.length === 11 && d[0] === "1")) ? "" : "Enter a 10-digit phone number."; },
    zip: function (v) { return /^\d{5}(-\d{4})?$/.test(v.trim()) ? "" : "Enter a 5-digit ZIP code."; },
    name: function (v) { return v.trim().length >= 2 ? "" : "Enter at least 2 characters."; },
    min10: function (v) { return v.trim().length >= 10 ? "" : "Please add a little more detail (10+ characters)."; }
  };
  function validateField(el) {
    var f = el.closest(".field") || el.closest(".check-field"), err = f && $(".error-msg", f), msg = "";
    var rules = (el.getAttribute("data-rules") || "").split(" ").filter(Boolean);
    if (el.type === "checkbox") msg = el.required && !el.checked ? (el.getAttribute("data-msg") || "Please confirm to continue.") : "";
    else if (el.type === "radio") { var g = $$('input[name="' + el.name + '"]'); msg = g.some(function (r) { return r.checked; }) ? "" : "Please choose an option."; }
    else {
      if (el.required) msg = RULES.required(el.value);
      if (!msg && el.value.trim()) for (var i = 0; i < rules.length; i++) { if (RULES[rules[i]]) { msg = RULES[rules[i]](el.value); if (msg) break; } }
    }
    if (f) f.classList.toggle("invalid", !!msg);
    if (err) err.textContent = msg;
    if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
    return !msg;
  }
  function validateGroup(root) {
    var ok = true, first = null, seen = {};
    $$("input,select,textarea", root).forEach(function (el) {
      if (el.type === "radio") { if (seen[el.name]) return; seen[el.name] = 1; }
      if (!el.required && !el.getAttribute("data-rules")) return;
      if (!validateField(el)) { ok = false; if (!first) first = el; }
    });
    if (first) first.focus();
    return ok;
  }
  function liveValidate(root) {
    root.addEventListener("blur", function (e) { if (e.target.matches("input,select,textarea") && (e.target.value || e.target.closest(".invalid"))) validateField(e.target); }, true);
    root.addEventListener("input", function (e) { if (e.target.closest(".invalid")) validateField(e.target); });
    root.addEventListener("change", function (e) { if (e.target.type === "checkbox" || e.target.type === "radio") validateField(e.target); });
  }

  function pageCheckout() {
    var form = $("#checkout-form"), empty = $("#co-empty"), layout = $("#co-layout"), conf = $("#co-confirm");
    if (!Cart.items.length) { layout.hidden = true; empty.hidden = false; return; }
    liveValidate(form);
    var saved = store("checkout") || {};
    Object.keys(saved).forEach(function (k) { var el = form.elements[k]; if (el && el.type !== "radio" && el.type !== "checkbox") el.value = saved[k]; });

    // Delivery options
    var dl = $("#delivery-options");
    dl.innerHTML = Object.keys(CONFIG.shipping).map(function (k, i) {
      var m = CONFIG.shipping[k];
      return '<label class="radio-card"><input type="radio" name="delivery" value="' + k + '"' + ((saved.delivery || "standard") === k ? " checked" : "") + ' required><span><strong>' + esc(m.label) + "</strong><small>" + esc(m.eta) + '</small></span><span class="rc-price" data-ship-price="' + k + '"></span></label>';
    }).join("");
    function method() { var r = $('input[name="delivery"]:checked', form); return r ? r.value : "standard"; }

    var drawPromo = promoUI($("#co-summary"), renderSummary);
    function renderSummary() {
      var t = totals(method());
      $("#co-items").innerHTML = Cart.items.map(function (it) {
        var p = byId(it.id), u = unitPrice(p, it.opts);
        return '<li><span class="q"><img src="' + img(p.img, 108, 108, 0, p) + '" alt="" data-label="' + esc(p.name) + '"><b>' + it.qty + "</b></span><span>" + esc(p.name) + (it.opts.length ? '<br><small class="muted">' + esc(it.opts.join(" · ")) + "</small>" : "") + "</span><strong>" + money(u * it.qty) + "</strong></li>";
      }).join("");
      $("#co-summary-body").innerHTML = summaryHTML(t, method());
      $$("[data-ship-price]").forEach(function (el) {
        var k = el.getAttribute("data-ship-price"), tt = totals(k);
        el.textContent = tt.ship ? money(tt.ship) : "Free";
      });
      $("#place-total").textContent = money(t.total);
      drawPromo();
    }
    form.addEventListener("change", function (e) { if (e.target.name === "delivery") { renderSummary(); toggleAddress(); } persist(); });
    form.addEventListener("input", persist);
    function persist() {
      var d = {}; ["email", "phone", "firstName", "lastName", "address1", "address2", "city", "state", "zip"].forEach(function (k) { if (form.elements[k]) d[k] = form.elements[k].value; });
      d.delivery = method(); store("checkout", d);
    }
    function toggleAddress() {
      var pick = method() === "pickup";
      $("#pickup-note").hidden = !pick;
    }
    toggleAddress();

    // Step panels
    var panels = $$(".co-panel", form), stepsUI = $$(".steps li");
    function recap(i) {
      var E = form.elements;
      if (i === 0) return esc(E.email.value) + " · " + esc(E.phone.value);
      if (i === 1) return esc(E.firstName.value + " " + E.lastName.value) + ", " + esc(E.address1.value) + (E.address2.value ? ", " + esc(E.address2.value) : "") + ", " + esc(E.city.value) + ", " + esc(E.state.value) + " " + esc(E.zip.value);
      if (i === 2) { var m = CONFIG.shipping[method()]; return esc(m.label) + " — " + esc(m.eta); }
      return "";
    }
    function goTo(i) {
      panels.forEach(function (p, pi) {
        p.classList.toggle("collapsed", pi !== i);
        if (pi < i) { p.classList.add("complete"); $(".recap", p).innerHTML = recap(pi); }
        $(".edit", p).hidden = !(p.classList.contains("complete") && pi !== i);
      });
      stepsUI.forEach(function (s, si) { s.classList.toggle("done", si < i); s.classList.toggle("current", si === i); if (si === i) s.setAttribute("aria-current", "step"); else s.removeAttribute("aria-current"); });
      var h = $("h2", panels[i]); h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true });
      panels[i].scrollIntoView({ behavior: "smooth", block: "start" });
    }
    $$("[data-next]", form).forEach(function (b, i) {
      b.addEventListener("click", function () { if (validateGroup(panels[i])) goTo(i + 1); });
    });
    $$(".edit", form).forEach(function (b, i) { b.addEventListener("click", function () { goTo(i); }); });

    $$('input[name="payment"]', form).forEach(function (r) {
      r.addEventListener("change", function () { $$(".pay-detail").forEach(function (d) { d.hidden = d.getAttribute("data-for") !== r.value; }); });
    });

    function placeOrder(e) {
      e.preventDefault();
      for (var i = 0; i < panels.length; i++) {
        if (!validateGroup(panels[i])) { if (panels[i].classList.contains("collapsed")) { goTo(i); setTimeout(function () { validateGroup(panels[i]); }, 350); } var gm = $("#global-msg"); gm.hidden = false; gm.textContent = "Please fix the highlighted fields in step " + (i + 1) + "."; return; }
      }
      $("#global-msg").hidden = true;
      var t = totals(method()), m = CONFIG.shipping[method()];
      var no = "OL-DEMO-" + Date.now().toString(36).toUpperCase().slice(-6);
      var E = form.elements;
      var rows = Cart.items.map(function (it) { var p = byId(it.id); return "<tr><td>" + it.qty + " × " + esc(p.name) + (it.opts.length ? ' <small class="muted">(' + esc(it.opts.join(", ")) + ")</small>" : "") + "</td><td>" + money(unitPrice(p, it.opts) * it.qty) + "</td></tr>"; }).join("");
      var pay = $('input[name="payment"]:checked', form).closest("label").querySelector("strong").textContent;
      conf.innerHTML = '<div class="tick">' + ICON.check.replace('class="icon"', "") + '</div><span class="eyebrow">Demonstration complete</span><h1 style="font-size:clamp(1.9rem,4vw,2.8rem);margin:.5rem 0">Thanks, ' + esc(E.firstName.value) + "! Your demo order is confirmed.</h1>" +
        '<p class="notice notice-warn" style="text-align:left"><strong>No real order was placed.</strong>&nbsp;No payment was taken, nothing will ship, and no details were sent anywhere. This confirmation exists only in your browser.</p>' +
        '<p>Demo order number</p><p class="order-no">' + no + "</p>" +
        "<table><tbody>" + rows +
        "<tr><td>Subtotal</td><td>" + money(t.subtotal) + "</td></tr>" + (t.discount ? "<tr><td>Promo " + esc(Cart.promo) + "</td><td>−" + money(t.discount) + "</td></tr>" : "") +
        "<tr><td>Shipping · " + esc(m.label) + "</td><td>" + (t.ship ? money(t.ship) : "Free") + "</td></tr><tr><td>Estimated tax</td><td>" + money(t.tax) + "</td></tr>" +
        '<tr><td><strong>Total</strong></td><td><strong>' + money(t.total) + "</strong></td></tr></tbody></table>" +
        '<p class="muted" style="text-align:left">' + (method() === "pickup" ? "Pickup" : "Ship to") + ": " + (method() === "pickup" ? "Orbit Lane demo store (fictional)" : esc(E.address1.value + ", " + E.city.value + ", " + E.state.value + " " + E.zip.value)) + "<br>Payment method selected: " + esc(pay) + " (simulated)<br>Confirmation email: not sent (demo)</p>" +
        '<div class="hero-actions" style="justify-content:center"><a class="btn btn-primary" href="shop.html">Keep shopping</a><a class="btn btn-ghost" href="https://calendly.com/virellionapex/free-consultation" rel="noopener">Request a store like this</a></div>';
      store("lastOrder", { no: no, total: t.total, at: new Date().toISOString() });
      Cart.clear(); storeDel("checkout");
      layout.hidden = true; $(".steps").hidden = true; conf.hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
      var h = $("h1", conf); h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true });
    }
    form.addEventListener("submit", placeOrder);
    renderSummary();
    onCart(function () { if (!Cart.items.length && conf.hidden) { layout.hidden = true; empty.hidden = false; } else if (conf.hidden) renderSummary(); });
  }

  /* ------------------------------------------------------------------
     12. Page: Contact
     ------------------------------------------------------------------ */
  function pageContact() {
    var form = $("#contact-form"); if (!form) return;
    liveValidate(form);
    $$(".help-topics button").forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".help-topics button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        form.elements.topic.value = b.getAttribute("data-topic");
        var on = b.getAttribute("data-topic") === "Order question";
        $("#order-field").hidden = !on;
        form.elements.message.focus();
      });
    });
    form.elements.topic.addEventListener("change", function () { $("#order-field").hidden = form.elements.topic.value !== "Order question"; });
    var last = store("lastOrder"); if (last && form.elements.order) form.elements.order.placeholder = "e.g. " + last.no;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $("#contact-msg");
      if (!validateGroup(form)) { msg.hidden = false; msg.className = "notice notice-err"; msg.textContent = "Please fix the highlighted fields."; return; }
      msg.hidden = false; msg.className = "notice notice-ok";
      msg.innerHTML = "<strong>Demo only — your message was not sent.</strong> This form has no backend. In a live store it would create a support ticket and email a confirmation.";
      form.reset(); $("#order-field").hidden = true;
      $$(".help-topics button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      msg.focus();
    });
  }

  /* ------------------------------------------------------------------
     13. Boot
     ------------------------------------------------------------------ */
  function creditsList() {
    var el = $("#photo-credits"); if (!el) return;
    var seen = {};
    el.innerHTML = [HERO_IMG].concat(PRODUCTS).map(function (p) {
      if (seen[p.by[1]]) return ""; seen[p.by[1]] = 1;
      return "<li>" + credit(p.by) + "</li>";
    }).join("");
  }

  Cart.load();
  onCart(updateBadges);
  updateBadges();
  initSearch(); initMega(); initDrawer(); railControls(); newsletter(); creditsList();
  var page = document.body.getAttribute("data-page");
  ({ home: pageHome, shop: pageShop, categories: pageCategories, product: pageProduct, cart: pageCart, checkout: pageCheckout, contact: pageContact }[page] || function () {})();
  countdowns();
  reveal();

  // Expose read-only hooks for automated QA (no secrets here).
  window.OrbitLane = { totals: totals, cart: Cart, products: PRODUCTS, promos: PROMOS };
})();
