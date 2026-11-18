// Demo data only. All companies and people are fictional. No backend: requests/chats live in localStorage.
const TRADES = ["Labourers", "Masons", "Bar Benders", "Shuttering Carpenters", "Electricians", "Plumbers", "Welders", "Painters", "Tile Fitters", "Machine Operators"];
const CITIES = ["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Ahmedabad", "Kolkata"];

// Crew providers: labour contractors / firms who have workers under them.
const PROVIDERS = [
  { id: "p1", name: "Shakti Labour Contractors", owner: "Ramesh Yadav", city: "Mumbai", verified: true, rating: 4.8, jobs: 132, since: 2011, rate: "₹700–1,400 / day", available: "Immediately",
    crew: { Labourers: 80, Masons: 18, "Bar Benders": 24, "Shuttering Carpenters": 16 },
    bio: "High-rise structural crews for Mumbai towers. Safety supervisor on every site, own shuttering material.",
    reviews: [["Skyline Realty", 5, "Slab cycle stayed at 7 days for the whole structure. Very disciplined team."], ["Oberstone Builders", 4, "Good crew, needed a day extra to mobilise."]] },
  { id: "p2", name: "Jyoti Electricals & Services", owner: "Sunita Sharma", city: "Delhi NCR", verified: true, rating: 4.9, jobs: 87, since: 2015, rate: "₹900–1,800 / day", available: "From 2 Dec",
    crew: { Electricians: 34, Plumbers: 10, Labourers: 8 },
    bio: "Licensed electricians for commercial and residential fit-outs. Conduiting, DB panels, testing and commissioning.",
    reviews: [["Capital Greens", 5, "Clean wiring, handed over with full test reports."]] },
  { id: "p3", name: "Bharat Manpower Solutions", owner: "Mohammed Irfan", city: "Hyderabad", verified: true, rating: 4.6, jobs: 210, since: 2008, rate: "₹650–1,300 / day", available: "Immediately",
    crew: { Labourers: 150, Masons: 40, Painters: 25, "Tile Fitters": 20, Welders: 15 },
    bio: "Large general workforce with labour camp and transport. Can mobilise 100+ workers within a week.",
    reviews: [["Deccan Infra", 5, "Brought 120 workers in 5 days. Impressive."], ["Hitech Homes", 4, "Good masons, painters were average."]] },
  { id: "p4", name: "Nirmal Plumbing Works", owner: "Prakash Patil", city: "Pune", verified: false, rating: 4.4, jobs: 41, since: 2018, rate: "₹800–1,500 / day", available: "From 25 Nov",
    crew: { Plumbers: 20, Labourers: 10 },
    bio: "Water supply, drainage and fire-fighting lines for apartments and hospitals.",
    reviews: [["Sahyadri Constructions", 4, "Neat work, reliable on timelines."]] },
  { id: "p5", name: "Lohar Steel Fabricators", owner: "Gurpreet Singh", city: "Ahmedabad", verified: true, rating: 4.7, jobs: 76, since: 2013, rate: "₹900–2,000 / day", available: "From 10 Dec",
    crew: { Welders: 28, "Bar Benders": 30, "Machine Operators": 9 },
    bio: "Structural steel erection, certified welders, crane and JCB operators.",
    reviews: [["Sabarmati Infra", 5, "Steel structure done ahead of schedule."]] },
  { id: "p6", name: "Rangoli Finishing Teams", owner: "Anita Reddy", city: "Bengaluru", verified: true, rating: 4.5, jobs: 58, since: 2016, rate: "₹750–1,500 / day", available: "Immediately",
    crew: { Painters: 35, "Tile Fitters": 18, Labourers: 20 },
    bio: "Interior finishing: painting, tiling, gypsum and false ceilings. Floor-wise quality checklists.",
    reviews: [["Garden City Homes", 5, "Best tiling crew we have used."], ["Whitefield Developers", 4, "Good finish, communication could be faster."]] },
  { id: "p7", name: "Ganga Earthmovers & Crew", owner: "Vikram Chauhan", city: "Kolkata", verified: false, rating: 4.2, jobs: 29, since: 2020, rate: "₹800–2,500 / day", available: "From 1 Dec",
    crew: { "Machine Operators": 16, Labourers: 40 },
    bio: "Excavation and earthworks with operators for JCBs, Poclains and rollers.",
    reviews: [["Hooghly Projects", 4, "Operators were experienced, machines well kept."]] },
  { id: "p8", name: "Kaveri MEP Services", owner: "Arjun Iyer", city: "Chennai", verified: true, rating: 4.8, jobs: 64, since: 2014, rate: "₹900–2,000 / day", available: "Immediately",
    crew: { Electricians: 15, Plumbers: 12, Welders: 8 },
    bio: "Full MEP teams: ducting, electrical and plumbing for commercial buildings.",
    reviews: [["Marina Towers Pvt Ltd", 5, "Handled all MEP coordination without fuss."]] },
];

// Projects posted by builders who need crews.
const PROJECTS = [
  { id: "j1", company: "Skyline Realty", title: "22-floor residential tower, Thane", city: "Mumbai", verified: true, start: "1 Dec 2026", duration: "14 months", budget: "₹750–1,500 / day",
    needs: { Labourers: 40, Masons: 15, "Bar Benders": 20, "Shuttering Carpenters": 12 }, desc: "Structure phase starting. Slab cycle of 7 days. Labour camp available on site." },
  { id: "j2", company: "Capital Greens Developers", title: "Mall fit-out, Gurugram", city: "Delhi NCR", verified: true, start: "15 Dec 2026", duration: "6 months", budget: "₹900–1,800 / day",
    needs: { Electricians: 20, Painters: 30, "Tile Fitters": 12 }, desc: "Fit-out for 40 shop units. Night shifts possible." },
  { id: "j3", company: "Sahyadri Constructions", title: "Row houses, Hinjewadi — 12 units", city: "Pune", verified: false, start: "5 Dec 2026", duration: "8 months", budget: "₹700–1,500 / day",
    needs: { Masons: 10, Plumbers: 6, Electricians: 6, Labourers: 20 }, desc: "Grey structure to finishing. Prefer one crew provider covering all trades." },
  { id: "j4", company: "Sabarmati Infra", title: "Warehouse steel structure, Sanand", city: "Ahmedabad", verified: true, start: "20 Dec 2026", duration: "4 months", budget: "₹900–2,000 / day",
    needs: { Welders: 18, "Bar Benders": 12, "Machine Operators": 4 }, desc: "Pre-engineered building, 4 lakh sq ft. Crane operators and certified welders needed." },
  { id: "j5", company: "Deccan Infra", title: "Hospital block, Gachibowli", city: "Hyderabad", verified: true, start: "1 Jan 2027", duration: "10 months", budget: "₹800–1,800 / day",
    needs: { Electricians: 25, Plumbers: 12, Masons: 20, Labourers: 40 }, desc: "300-bed hospital block. Hospital project experience preferred." },
  { id: "j6", company: "Garden City Homes", title: "Apartment finishing, Whitefield", city: "Bengaluru", verified: true, start: "Immediately", duration: "5 months", budget: "₹750–1,400 / day",
    needs: { Painters: 20, "Tile Fitters": 15, Labourers: 15 }, desc: "Finishing across 3 towers, 180 flats. Behind schedule — fast mobilisation preferred." },
  { id: "j7", company: "Hooghly Projects", title: "Ring road earthworks", city: "Kolkata", verified: false, start: "10 Dec 2026", duration: "7 months", budget: "₹800–2,500 / day",
    needs: { "Machine Operators": 12, Labourers: 50 }, desc: "Cut and fill, compaction and drainage culverts over 9 km." },
  { id: "j8", company: "Marina Towers Pvt Ltd", title: "IT park MEP works, OMR", city: "Chennai", verified: true, start: "15 Jan 2027", duration: "9 months", budget: "₹900–2,000 / day",
    needs: { Electricians: 18, Plumbers: 10, Welders: 6 }, desc: "MEP for two 12-floor office blocks." },
];
