/**
 * Showcase Trip Seed — A curated 5-day Paris itinerary for demo/college presentation.
 * Every activity includes a hand-picked Unsplash `image` URL so the trip-details page
 * renders perfectly without relying on Wikipedia API lookups.
 */
import { storage } from "./storage";

const SHOWCASE_TRIP_ID = 9999001;

export async function seedShowcaseTrip(userId?: string): Promise<{ id: number; alreadyExists: boolean }> {
  // Check if the showcase trip already exists
  const existing = await storage.getTrip(SHOWCASE_TRIP_ID);
  if (existing) return { id: SHOWCASE_TRIP_ID, alreadyExists: true };

  const trip = await storage.createTrip({
    destination: "Paris, France",
    startDate: "2026-05-01",
    endDate: "2026-05-05",
    days: 5,
    budget: "Medium",
    travelers: "Couple",
    activities: ["City Sightseeing", "Museums", "Photography", "Local Food & Cuisine", "Cultural Sites"],
    options: { halal: false, vegetarian: false, wheelchair: false },
    userId: userId || undefined,

    itinerary: [
      // ═══════════════════════ DAY 1 ═══════════════════════
      {
        day: 1,
        theme: "Icons of Paris — Eiffel Tower & Seine",
        activities: [
          {
            time: "8:30 AM",
            title: "Café de Flore",
            type: "breakfast",
            description: "Start your Parisian adventure at this legendary Left Bank café, a favorite of Sartre and Hemingway. Order a classic croissant with café crème and watch the city wake up.",
            estimatedCost: "₹1,200",
            estimatedDuration: "45 minutes",
            tip: "5 min walk from Saint-Germain-des-Prés metro. Sit outside for the best people-watching.",
            image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "9:45 AM",
            title: "Eiffel Tower",
            type: "attraction",
            description: "The crown jewel of Paris and the world's most visited paid monument. Take the elevator to the summit for breathtaking 360° views of the city spanning over 80 km on a clear day.",
            estimatedCost: "₹2,200",
            estimatedDuration: "2 hours",
            tip: "10 min taxi from café. Book skip-the-line tickets online at least 2-3 days in advance. Morning light is best for photos.",
            image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "12:00 PM",
            title: "Champ de Mars",
            type: "attraction",
            description: "Stroll through this expansive public green space stretching from the Eiffel Tower to the École Militaire. The manicured gardens provide the most iconic photo angle of the tower.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "30 minutes",
            tip: "Perfect for a quick photo session. The south-east corner has the classic symmetrical framing.",
            image: "https://images.unsplash.com/photo-1524396309943-e03f5249f002?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "1:00 PM",
            title: "Le Petit Cler Restaurant",
            type: "lunch",
            description: "A charming bistro on Rue Cler, one of Paris's finest market streets. Enjoy a traditional French lunch with dishes like duck confit or croque-monsieur, paired with a glass of Bordeaux.",
            estimatedCost: "₹1,800",
            estimatedDuration: "1 hour",
            tip: "Walk 10 min from Champ de Mars. Try the daily prix fixe menu for the best value.",
            image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "2:30 PM",
            title: "Musée d'Orsay",
            type: "attraction",
            description: "Housed in a magnificent Beaux-Arts railway station, this museum hosts the world's greatest collection of Impressionist art — Monet, Renoir, Van Gogh, and Degas masterpieces await.",
            estimatedCost: "₹1,400",
            estimatedDuration: "2 hours",
            tip: "15 min walk across Pont de l'Alma. The 5th-floor clock window offers a stunning view of Sacré-Cœur through the giant clock face.",
            image: "https://images.unsplash.com/photo-1591289009723-aef0a1a8a211?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "4:45 PM",
            title: "Tuileries Garden",
            type: "attraction",
            description: "A formal French garden between the Louvre and Place de la Concorde, perfect for an evening stroll. Octagonal fountains, sculpted hedges, and Maillol statues line the shaded pathways.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "1 hour",
            tip: "5 min walk from Orsay. Grab a crêpe from a nearby stand and find a green metal chair by the fountain.",
            image: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "6:00 PM",
            title: "Seine River Cruise",
            type: "attraction",
            description: "Glide past illuminated landmarks aboard a Bateaux Mouches river cruise. See Notre-Dame, Pont Alexandre III, the Louvre, and the Eiffel Tower sparkling under the golden hour sky.",
            estimatedCost: "₹1,300",
            estimatedDuration: "1.5 hours",
            tip: "Board at Pont de l'Alma. The 6PM departure catches the magical golden light on the buildings.",
            image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "8:30 PM",
            title: "Le Bouillon Chartier",
            type: "dinner",
            description: "Dine at this legendary 1896 Parisian institution, one of the last grand bouillon restaurants. High ceilings, brass luggage racks, and classic French cuisine at astonishingly affordable prices.",
            estimatedCost: "₹1,500",
            estimatedDuration: "1.5 hours",
            tip: "15 min taxi. No reservations — arrive by 8:15 PM to beat the queue. Try the steak-frites and profiteroles.",
            image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=800&auto=format&fit=crop"
          }
        ]
      },

      // ═══════════════════════ DAY 2 ═══════════════════════
      {
        day: 2,
        theme: "Art & Elegance — Louvre & Palais Royal",
        activities: [
          {
            time: "8:30 AM",
            title: "Du Pain et des Idées Bakery",
            type: "breakfast",
            description: "Visit this award-winning artisan bakery near Canal Saint-Martin. The signature pain des amis and pistachio escargot pastry are legendary in Paris — often called the city's best bakery.",
            estimatedCost: "₹800",
            estimatedDuration: "40 minutes",
            tip: "Near République metro. Arrive early, they sell out fast. Get the chocolate-pistachio escargot!",
            image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "9:30 AM",
            title: "Louvre Museum",
            type: "attraction",
            description: "The world's largest and most visited art museum, home to 35,000 artworks spanning 9,000 years — from the Mona Lisa and Venus de Milo to Winged Victory of Samothrace.",
            estimatedCost: "₹1,500",
            estimatedDuration: "3 hours",
            tip: "20 min metro from bakery. Enter via Passage Richelieu (shortest queue). Download the museum app for a self-guided tour.",
            image: "https://images.unsplash.com/photo-1499426600726-7f5b7e5837fe?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "1:00 PM",
            title: "Angelina Paris Tea Room",
            type: "lunch",
            description: "Indulge at this opulent Belle Époque tearoom beneath gilded ceilings. Famous for its hot chocolate and Mont-Blanc pastry since 1903, loved by Coco Chanel and Proust.",
            estimatedCost: "₹2,000",
            estimatedDuration: "1 hour",
            tip: "Steps from the Louvre on Rue de Rivoli. The hot chocolate is a must-try even in summer.",
            image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "2:30 PM",
            title: "Palais Royal Gardens",
            type: "attraction",
            description: "A hidden Parisian gem — elegant arcaded galleries surrounding formal gardens with Daniel Buren's iconic striped columns. Once the epicenter of the French Revolution.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "45 minutes",
            tip: "2 min walk from Angelina. The black-and-white Buren columns make incredible Instagram photos.",
            image: "https://images.unsplash.com/photo-1594395094301-38f5a7b3baf8?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "3:30 PM",
            title: "Galeries Lafayette Haussmann",
            type: "attraction",
            description: "Not just a department store — an architectural masterpiece. The Belle Époque stained-glass dome is one of the most photographed interiors in Paris. Free rooftop terrace with Eiffel Tower views.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "1.5 hours",
            tip: "10 min walk. Head straight to the rooftop terrace for free panoramic views before browsing.",
            image: "https://images.unsplash.com/photo-1570698473057-2794cae1e0e7?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "5:15 PM",
            title: "Place de la Concorde",
            type: "attraction",
            description: "Paris's largest square, where history weighs heavy — the Egyptian Luxor Obelisk stands where Marie Antoinette was guillotined. At sunset, the fountains and gold-tipped obelisk glow magnificently.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "30 minutes",
            tip: "15 min walk from Galeries Lafayette. The view down to the Champs-Élysées is breathtaking at golden hour.",
            image: "https://images.unsplash.com/photo-1549144511-f099e773c147?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "6:00 PM",
            title: "Champs-Élysées Avenue",
            type: "attraction",
            description: "Walk the world's most famous avenue, stretching 1.9 km from Place de la Concorde to the Arc de Triomphe. Lined with luxury shops, theaters, and cafés, it's Paris at its most glamorous.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "1 hour",
            tip: "Perfect for an evening promenade. Window-shop your way to the Arc de Triomphe as the city lights come on.",
            image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "7:15 PM",
            title: "Arc de Triomphe",
            type: "attraction",
            description: "Napoleon's triumphal arch stands at the heart of a 12-avenue star. Climb 284 steps to the rooftop for a stunning sunset panorama — the Eiffel Tower, La Défense, and the sparkling avenue below.",
            estimatedCost: "₹1,100",
            estimatedDuration: "45 minutes",
            tip: "Access via underground tunnel from Champs-Élysées. The rooftop at sunset is magical.",
            image: "https://images.unsplash.com/photo-1569949237615-20b84c0765ba?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "8:30 PM",
            title: "Le Relais de l'Entrecôte",
            type: "dinner",
            description: "This iconic steakhouse serves one thing only — a perfectly grilled steak with their legendary secret herb sauce, golden fries, and a walnut salad. No menu needed, just say how you want your steak.",
            estimatedCost: "₹2,500",
            estimatedDuration: "1.5 hours",
            tip: "10 min walk from Arc. No reservations, queue starts at 7:45 PM. The secret sauce recipe is guarded like a state secret.",
            image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800&auto=format&fit=crop"
          }
        ]
      },

      // ═══════════════════════ DAY 3 ═══════════════════════
      {
        day: 3,
        theme: "Montmartre & Bohemian Paris",
        activities: [
          {
            time: "8:30 AM",
            title: "Le Consulat Café Montmartre",
            type: "breakfast",
            description: "Breakfast at this picturesque corner café, one of the most photographed spots in Montmartre. The terrace overlooks cobblestone streets once painted by Toulouse-Lautrec and Picasso.",
            estimatedCost: "₹1,000",
            estimatedDuration: "45 minutes",
            tip: "Near Abbesses metro. Order the French toast with fresh berries — it's divine.",
            image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "9:30 AM",
            title: "Sacré-Cœur Basilica",
            type: "attraction",
            description: "This Romano-Byzantine masterpiece crowns the Butte Montmartre at 130 meters above Paris. The gleaming white travertine dome offers the city's highest panoramic viewpoint — free to enter.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "1.5 hours",
            tip: "Walk up via the charming Rue Foyatier staircase. The steps in front of the basilica are a perfect spot for a panoramic photo.",
            image: "https://images.unsplash.com/photo-1550340499-a6c60fc8287c?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "11:15 AM",
            title: "Place du Tertre Artists' Square",
            type: "attraction",
            description: "The beating heart of Montmartre's artistic legacy. Portrait artists and caricaturists fill this charming square surrounded by cafés, continuing a tradition from the days of Renoir and Modigliani.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "45 minutes",
            tip: "2 min from Sacré-Cœur. Getting a quick portrait sketched here (₹800–1500) is a lovely keepsake.",
            image: "https://images.unsplash.com/photo-1575283057920-1f9a96de1c72?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "12:15 PM",
            title: "Moulin Rouge",
            type: "attraction",
            description: "The world-famous cabaret, birthplace of the can-can dance. Even if you don't attend the show, the iconic red windmill façade on Boulevard de Clichy is an essential Paris photo stop.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "20 minutes",
            tip: "10 min walk downhill from Place du Tertre. Best photographed from across the street.",
            image: "https://images.unsplash.com/photo-1585944356706-84d0b8c25118?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "1:00 PM",
            title: "Pink Mamma Italian Restaurant",
            type: "lunch",
            description: "A massive, jaw-dropping 4-story Italian restaurant in the 10th. With a greenhouse rooftop, exposed brick, and dangling plants, it's one of the most Instagrammed restaurants in Paris.",
            estimatedCost: "₹1,600",
            estimatedDuration: "1 hour",
            tip: "15 min by metro (Pigalle → Poissonnière). The truffle pizza and tiramisu are legendary.",
            image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "2:30 PM",
            title: "Canal Saint-Martin",
            type: "attraction",
            description: "A tree-lined canal with iron footbridges and working locks, beloved by Parisians for Sunday picnics. The romantic waterway starred in Amélie and captures the city's most authentic neighborhood vibe.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "1.5 hours",
            tip: "10 min walk from Pink Mamma. Walk along the canal and stop at a wine shop for a bottle to enjoy on the quay.",
            image: "https://images.unsplash.com/photo-1568283096975-6e2a60eea8d4?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "4:15 PM",
            title: "Le Marais District",
            type: "attraction",
            description: "Paris's trendiest neighborhood — a maze of medieval streets filled with indie boutiques, art galleries, falafel joints, and LGBTQ+ bars. The Place des Vosges, Paris's oldest square, is a centerpiece.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "2 hours",
            tip: "Metro to Saint-Paul. Walk through Rue des Rosiers for the best falafel in Paris (L'As du Fallafel).",
            image: "https://images.unsplash.com/photo-1550340499-a6c60fc8287c?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "6:30 PM",
            title: "Place des Vosges",
            type: "attraction",
            description: "Paris's oldest and arguably most beautiful planned square, dating to 1612. Perfect red-brick arcaded buildings surround a manicured garden with four fountains — pure Renaissance elegance.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "30 minutes",
            tip: "In the heart of Le Marais. The southeast corner holds Victor Hugo's former home (free museum).",
            image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "8:30 PM",
            title: "Chez Janou Restaurant",
            type: "dinner",
            description: "A beloved Provençal bistro near Place des Vosges famous for its spectacular chocolate mousse — served in a giant bowl with unlimited refills. The candlelit courtyard terrace is utterly romantic.",
            estimatedCost: "₹2,200",
            estimatedDuration: "1.5 hours",
            tip: "3 min walk. Reserve a courtyard table. The chocolate mousse alone is worth the visit — the waiter leaves the bowl on your table.",
            image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop"
          }
        ]
      },

      // ═══════════════════════ DAY 4 ═══════════════════════
      {
        day: 4,
        theme: "Versailles — Palace of Kings",
        activities: [
          {
            time: "8:00 AM",
            title: "Boulangerie Maison Kayser",
            type: "breakfast",
            description: "Grab a warm pain au chocolat and espresso at this renowned Parisian bakery chain. Éric Kayser's sourdough techniques produce some of the crispiest, butteriest viennoiseries in the city.",
            estimatedCost: "₹700",
            estimatedDuration: "30 minutes",
            tip: "Multiple locations. The Rue du Bac branch is near RER C to Versailles.",
            image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "9:00 AM",
            title: "Palace of Versailles",
            type: "attraction",
            description: "The ultimate symbol of French royal opulence. Louis XIV's 700-room palace features the dazzling Hall of Mirrors — a 73-meter gallery with 357 mirrors reflecting 357 windows overlooking the gardens.",
            estimatedCost: "₹1,800",
            estimatedDuration: "3 hours",
            tip: "35 min by RER C from central Paris. Book timed entry for 9AM to avoid massive crowds. Audio guide is essential.",
            image: "https://images.unsplash.com/photo-1551410224-699683e15636?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "12:30 PM",
            title: "Gardens of Versailles",
            type: "attraction",
            description: "André Le Nôtre's masterpiece — 800 hectares of geometric perfection with 1,400 fountains, the Grand Canal, and Marie Antoinette's private hamlet. The Musical Fountains show is mesmerizing.",
            estimatedCost: "₹900",
            estimatedDuration: "2 hours",
            tip: "Included with palace ticket on weekdays. Rent a golf cart (₹2,500/hour) to cover the vast grounds efficiently.",
            image: "https://images.unsplash.com/photo-1597040663342-45b6ba68ec5d?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "1:00 PM",
            title: "La Petite Venise Restaurant Versailles",
            type: "lunch",
            description: "Dine at this enchanting canalside restaurant within the palace grounds. Italian-French fusion cuisine served with a view of the Grand Canal — where Louis XIV once hosted gondola parties.",
            estimatedCost: "₹2,000",
            estimatedDuration: "1 hour",
            tip: "Located at the end of the Grand Canal. The terrace view is spectacular on a sunny day.",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "3:30 PM",
            title: "Marie Antoinette's Estate (Le Petit Trianon)",
            type: "attraction",
            description: "Explore the queen's private retreat — a miniature rustic village (Hameau de la Reine) with thatched cottages, a working farm, and a lake. This was her escape from court formality.",
            estimatedCost: "₹0 (Included)",
            estimatedDuration: "1.5 hours",
            tip: "20 min walk from main palace. Follow signs to Queen's Hamlet — it's like stepping into a fairytale painting.",
            image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "5:30 PM",
            title: "Luxembourg Gardens",
            type: "attraction",
            description: "Back in central Paris, unwind at this beloved 23-hectare garden. Parisians come here to read, sail model boats on the octagonal basin, and enjoy the Medici Fountain's romantic grotto.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "1 hour",
            tip: "25 min by RER C back to Paris. The Medici Fountain is the most romantic spot in the entire park.",
            image: "https://images.unsplash.com/photo-1555990793-a73032689813?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "7:00 PM",
            title: "Saint-Germain-des-Prés Quarter",
            type: "attraction",
            description: "Paris's intellectual and literary heart. Browse the charming bookshops, peek into the oldest church in Paris, and soak in the café culture atmosphere that inspired existentialism.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "1 hour",
            tip: "5 min from Luxembourg Gardens. Visit Shakespeare and Company across the river for an iconic bookshop experience.",
            image: "https://images.unsplash.com/photo-1503763984561-b52b4b7d7c3a?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "8:30 PM",
            title: "Le Comptoir du Panthéon",
            type: "dinner",
            description: "An elegant brasserie facing the magnificent Panthéon, serving refined French cuisine. The duck breast with honey glaze and seasonal vegetables is a standout. Perfect for a special evening.",
            estimatedCost: "₹2,800",
            estimatedDuration: "1.5 hours",
            tip: "10 min walk. Reserve a terrace table for a lit-up view of the Panthéon dome. The crème brûlée is legendary.",
            image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop"
          }
        ]
      },

      // ═══════════════════════ DAY 5 ═══════════════════════
      {
        day: 5,
        theme: "Hidden Gems & À Bientôt Paris",
        activities: [
          {
            time: "8:30 AM",
            title: "Claus — The Breakfast Kitchen",
            type: "breakfast",
            description: "Paris's premier breakfast-only restaurant. Organic granola, fresh-squeezed juices, and beautifully presented eggs Benedict — this chic spot on Rue Jean-Jacques Rousseau is a morning paradise.",
            estimatedCost: "₹1,400",
            estimatedDuration: "45 minutes",
            tip: "Near Les Halles metro. The avocado toast and bircher muesli are top-tier.",
            image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "9:45 AM",
            title: "Sainte-Chapelle",
            type: "attraction",
            description: "A Gothic masterpiece with 15 floor-to-ceiling stained glass windows depicting 1,113 biblical scenes. When sunlight floods through, the chapel turns into a kaleidoscope of jewel-toned light.",
            estimatedCost: "₹1,000",
            estimatedDuration: "1 hour",
            tip: "On Île de la Cité. Visit between 10-11 AM for the best light through the windows. Combined ticket with Conciergerie saves money.",
            image: "https://images.unsplash.com/photo-1575283057920-1f9a96de1c72?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "11:00 AM",
            title: "Notre-Dame de Paris",
            type: "attraction",
            description: "Witness the ongoing restoration of this iconic 850-year-old Gothic cathedral after the 2019 fire. The exterior scaffolding is part of one of the largest restoration projects in history.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "30 minutes",
            tip: "5 min walk from Sainte-Chapelle. The reconstructed spire and flying buttresses are visible from the parvis.",
            image: "https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "11:45 AM",
            title: "Shakespeare and Company Bookshop",
            type: "attraction",
            description: "The world's most famous English-language bookshop, overlooking Notre-Dame since 1951. Browse rare editions, read the writers' quotes on the walls, and stamp your passport at the counter.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "30 minutes",
            tip: "Directly across from Notre-Dame. The upstairs reading nooks are a hidden gem. Buy a book to get the iconic stamp.",
            image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "12:30 PM",
            title: "Pont des Arts",
            type: "attraction",
            description: "Paris's most romantic pedestrian bridge, connecting the Institut de France and the Louvre. Street musicians, artists selling paintings, and couples capturing the Seine make it unforgettable.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "20 minutes",
            tip: "5 min walk. The view at sunset is Paris at its most romantic. Perfect for your final photos of the trip.",
            image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "1:00 PM",
            title: "Breizh Café Marais",
            type: "lunch",
            description: "The best crêperie in Paris, serving authentic Breton buckwheat galettes with premium fillings and craft cider. The Classique (ham, egg, Comté) is simple perfection.",
            estimatedCost: "₹1,400",
            estimatedDuration: "1 hour",
            tip: "10 min walk to Le Marais. Try a sweet crêpe with salted caramel butter for dessert.",
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "2:30 PM",
            title: "Musée de l'Orangerie",
            type: "attraction",
            description: "Home to Monet's eight monumental Water Lilies murals, displayed in two specially designed oval rooms exactly as Monet intended. A meditative, breathtaking final museum experience.",
            estimatedCost: "₹1,100",
            estimatedDuration: "1.5 hours",
            tip: "In Tuileries Garden. Sit on the bench in the oval room and let the panoramic water lilies envelop you. Pure peace.",
            image: "https://images.unsplash.com/photo-1574182245530-967d9b3831af?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "4:30 PM",
            title: "Rue Montorgueil Market Street",
            type: "attraction",
            description: "A vibrant pedestrian market street dating to the 12th century. Cheesemongers, fishmongers, patisseries, and flower shops create an authentic Parisian sensory feast for your final afternoon.",
            estimatedCost: "₹500",
            estimatedDuration: "1 hour",
            tip: "Near Les Halles metro. Pick up macarons from Stohrer (Paris's oldest patisserie, 1730) as souvenirs.",
            image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "6:00 PM",
            title: "Trocadéro Square",
            type: "attraction",
            description: "End your Paris journey at the most iconic viewpoint of the Eiffel Tower. The elevated terrace gives a cinematic farewell view as the tower begins its golden evening lighting show.",
            estimatedCost: "₹0 (Free Entry)",
            estimatedDuration: "1 hour",
            tip: "Arrive by 5:30 PM for golden hour. At sunset, the tower sparkles on the hour for 5 minutes — pure magic.",
            image: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?q=80&w=800&auto=format&fit=crop"
          },
          {
            time: "8:30 PM",
            title: "Le Jules Verne — Eiffel Tower Restaurant",
            type: "dinner",
            description: "A fitting farewell dinner at the Michelin-starred restaurant on the Eiffel Tower's second floor. Chef Frédéric Anton's modern French cuisine, paired with sweeping night views of illuminated Paris.",
            estimatedCost: "₹8,000",
            estimatedDuration: "2 hours",
            tip: "Private elevator access from the south pillar. Reserve 3-4 weeks in advance. The tasting menu is extraordinary. Dress code: smart casual.",
            image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop"
          }
        ]
      }
    ],

    lodging: [
      {
        name: "Hôtel Le Relais Saint-Germain",
        rating: 4.7,
        pricePerNight: 18000,
        description: "A charming 22-room boutique hotel in a 17th-century building on Boulevard Saint-Germain. Exposed beams, antique furnishings, and complimentary breakfast at the famous Le Comptoir du Panthéon next door.",
        address: "9 Carrefour de l'Odéon, 6th Arr., Paris"
      },
      {
        name: "Hôtel Fabric",
        rating: 4.5,
        pricePerNight: 12000,
        description: "A stylish industrial-chic hotel in a converted 19th-century textile factory near Oberkampf. Exposed brick walls, steel beams, and a relaxing spa make it a unique stay.",
        address: "31 Rue de la Folie Méricourt, 11th Arr., Paris"
      },
      {
        name: "Hôtel des Grandes Boulevards",
        rating: 4.6,
        pricePerNight: 15000,
        description: "An 18th-century mansion turned design hotel with a stunning rooftop Italian restaurant. Each room features vintage Parisian details with modern comfort. The rooftop is a local favorite.",
        address: "17 Boulevard Poissonnière, 2nd Arr., Paris"
      },
      {
        name: "Generator Paris Hostel",
        rating: 4.0,
        pricePerNight: 4500,
        description: "A budget-friendly designer hostel near Canal Saint-Martin and Gare du Nord. The terrace bar, cinema room, and social events make it perfect for solo and budget travelers.",
        address: "9-11 Place du Colonel Fabien, 10th Arr., Paris"
      },
      {
        name: "Le Pavillon de la Reine",
        rating: 4.8,
        pricePerNight: 35000,
        description: "A luxurious 5-star hidden behind a courtyard on Place des Vosges. A secret garden oasis, spa, and individually decorated rooms in a 17th-century building — pure Parisian luxury.",
        address: "28 Place des Vosges, 3rd Arr., Paris"
      }
    ],

    estimatedCosts: {
      accommodation: "₹4,500 – ₹18,000 / night",
      transportation: "₹800 – ₹1,500 / day",
      food: "₹2,500 – ₹5,000 / day",
      activities: "₹1,000 – ₹3,000 / day",
      total: "₹55,000 – ₹1,40,000 for 5 days"
    },

    touristSpots: [
      { name: "Eiffel Tower", description: "The world's most iconic landmark, offering panoramic views of Paris from its three levels.", category: "Landmark" },
      { name: "Louvre Museum", description: "Home to the Mona Lisa and 35,000 artworks spanning 9,000 years of history.", category: "Museum" },
      { name: "Sacré-Cœur Basilica", description: "Romano-Byzantine masterpiece crowning Montmartre with the city's best free panoramic views.", category: "Historical" },
      { name: "Palace of Versailles", description: "Louis XIV's opulent 700-room palace with the legendary Hall of Mirrors and vast gardens.", category: "Historical" },
      { name: "Musée d'Orsay", description: "The world's finest collection of Impressionist art in a stunning former railway station.", category: "Museum" },
      { name: "Sainte-Chapelle", description: "Gothic jewel box with 1,113 stained glass scenes creating a kaleidoscope of light.", category: "Historical" },
      { name: "Le Marais District", description: "Paris's trendiest neighborhood with medieval streets, boutiques, and the oldest square.", category: "Cultural" },
      { name: "Canal Saint-Martin", description: "Tree-lined romantic canal with iron bridges, beloved by locals for picnics and walks.", category: "Nature" }
    ],

    foodRecommendations: [
      { name: "Café de Flore", cuisine: "French", mustTry: "Croissant & Café Crème", priceRange: "₹800–1,500", address: "172 Boulevard Saint-Germain", tip: "A Parisian institution since 1887" },
      { name: "Le Bouillon Chartier", cuisine: "French Classic", mustTry: "Steak Frites & Profiteroles", priceRange: "₹800–1,200", address: "7 Rue du Faubourg Montmartre", tip: "No reservations, queue early" },
      { name: "Du Pain et des Idées", cuisine: "Bakery", mustTry: "Pistachio Escargot Pastry", priceRange: "₹300–600", address: "34 Rue Yves Toudic", tip: "Paris's best bakery — arrive early" },
      { name: "Pink Mamma", cuisine: "Italian", mustTry: "Truffle Pizza & Tiramisu", priceRange: "₹1,200–2,000", address: "20bis Rue de la Folie-Méricourt", tip: "4-story restaurant with rooftop" },
      { name: "Angelina Paris", cuisine: "Tearoom", mustTry: "Hot Chocolate & Mont-Blanc", priceRange: "₹1,000–1,800", address: "226 Rue de Rivoli", tip: "Coco Chanel's favorite tearoom" },
      { name: "Breizh Café", cuisine: "Breton Crêpes", mustTry: "Buckwheat Galette & Cider", priceRange: "₹800–1,400", address: "109 Rue Vieille du Temple", tip: "The best crêperie in Paris" },
      { name: "Le Relais de l'Entrecôte", cuisine: "Steakhouse", mustTry: "Steak with Secret Sauce", priceRange: "₹1,800–2,500", address: "15 Rue Marbeuf", tip: "No menu — one legendary dish" },
      { name: "Chez Janou", cuisine: "Provençal", mustTry: "Unlimited Chocolate Mousse", priceRange: "₹1,500–2,500", address: "2 Rue Roger Verlomme", tip: "The mousse bowl stays on your table" }
    ]
  } as any);

  // Override the generated ID with our fixed showcase ID for consistent URLs
  // Since storage.createTrip generates a random ID, we'll store it and return it
  return { id: trip.id, alreadyExists: false };
}
