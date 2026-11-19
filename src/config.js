/* ==========================================================================
   MAISON CONFIG — Indian Hindu Wedding Edition
   --------------------------------------------------------------------------
   Formatting inside titles:  *word* → gold italic   ~word~ → outlined
   Dates: ISO WITH the venue's UTC offset, e.g. "2026-12-12T17:00:00+05:30".
   Times always display in the venue's local time, wherever the guest is.
   ========================================================================== */

const MAISON = {
  /* ---------------------------------------------------------------- Couple */
  couple: {
    partner1: "Aarav",
    partner2: "Meher",
    initials: ["A", "M"],
    signature: "Aarav & Meher",
    families: "With the blessings of our elders, the Malhotra & Kapoor families"
  },
  house: "Shubh Vivah",                      // "Shubh Vivah Aarav & Meher"

  /* --------------------------------------------------- The moment (countdown) */
  date: "2026-12-12T17:00:00+05:30",
  timezoneLabel: "IST",
  city: "Udaipur",
  region: "Rajasthan, India",
  hashtag: "#AaravWedsMeher",
  rsvpDeadline: "15 November 2026",

  /* --------------------------------------------------------------- Colours */
  theme: {
    white: "#fbf8f2",                   // warm porcelain white
    pearl: "#f3ede1",
    ink: "#2a2118",                     // warm espresso for text
    gold: "#b8893a",                    // core gold (text-safe on white)
    goldLight: "#e8cd8c"
  },

  /* ------------------------------------------------------------------ Sound
     src: an mp3 in /public/assets/audio, e.g. "assets/audio/theme.mp3".
     Empty → a generative music-box waltz plays (muted until the guest taps). */
  music: { src: "", volume: 0.5 },

  /* --------------------------------------------- Personalisation (?guest=Name) */
  greeting: {
    foilLabel: "Aapke liye",
    genericName: "Our honoured guest",
    heroFor: "With love, for {guest}",
    letterWithGuest: "Priya {guest},",
    letterGeneric: "Priya Atithi,"
  },

  /* ------------------------------------------------------------------ Hero */
  hero: {
    kicker: "Shubh Vivah · Aarav & Meher",
    subtitle: "A Sacred Union · MMXXVI"
  },

  /* ------------------------------------------------------------- Manifesto */
  manifesto: {
    lines: ["Two souls.", "One sacred *bond.*", "Three days of *celebration*", "in the City of Lakes."],
    letter: "In our sacred tradition, a wedding is not merely the union of two individuals — it is the coming together of two families, blessed by the sacred Agni and the divine grace of our elders. This December, we invite you to the banks of Lake Pichola to witness our seven vows spoken beneath an open sky. Your presence and aashirvaad will make our joy complete.",
    signoff: "With love & pranaam, the Malhotra & Kapoor families"
  },

  /* ---------------------------------------- Story (horizontal scroll gallery) */
  story: [
    { year: "2019", place: "Delhi", title: "A chance *meeting*", text: "A Diwali gathering at a mutual friend's home. Eyes met across a room filled with diyas, laughter, and warm chai — and neither looked away.", image: "https://images.unsplash.com/photo-1597157639073-69284dc0fdaf" },
    { year: "2021", place: "Jaipur", title: "The *courtship*", text: "Long conversations under starlit skies, visits to the palaces of the Pink City, and a promise ring tucked inside a box of traditional ghevar.", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da" },
    { year: "2023", place: "Varanasi", title: "The *blessing*", text: "On the ghats of the sacred Ganga at dawn, he asked for her hand. She said yes before the temple aarti bells had stopped ringing.", image: "https://images.unsplash.com/photo-1561361058-c24cecae35ca" },
    { year: "2026", place: "Udaipur", title: "And now, *forever*", text: "In the City of Lakes, beneath a December sky, our two families become one — with you beside us as our greatest blessing.", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5" }
  ],

  /* --------------------------------------------- Programme (3D flip-card deck)
     icon: "moon" | "lotus" | "mandap" | "chandelier" | "champagne"
     palette: dress-code colour swatches shown on the card back             */
  events: [
    {
      title: "The *Ganesh Puja*", kind: "Pooja & Welcome", icon: "lotus",
      start: "2026-12-10T10:00:00+05:30", end: "2026-12-10T12:30:00+05:30",
      venue: "Jagmandir Island Palace", address: "Lake Pichola, Udaipur",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Jagmandir+Island+Palace+Udaipur",
      dress: "Traditional Indian", palette: ["#e8cd8c", "#c2185b", "#fbf6ea"],
      note: "We begin with Lord Ganesha's blessings. Boats depart from the palace jetty at 9:30 AM. Pooja followed by a lakeside breakfast."
    },
    {
      title: "The Garden of *Song*", kind: "Mehendi & Sangeet", icon: "moon",
      start: "2026-12-11T16:00:00+05:30", end: "2026-12-11T23:00:00+05:30",
      venue: "Fateh Prakash Gardens", address: "City Palace Complex, Udaipur",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Fateh+Prakash+Palace+Udaipur",
      dress: "Jewel Tones", palette: ["#0f5c4c", "#c2185b", "#f2b134"],
      note: "Henna at golden hour, marigolds and folk music until late. Ladies, wear something you can dance in. Gentlemen, kurta-pajamas welcome."
    },
    {
      title: "The Haldi *Ceremony*", kind: "Haldi & Tel Baan", icon: "lotus",
      start: "2026-12-12T10:00:00+05:30", end: "2026-12-12T13:00:00+05:30",
      venue: "Fateh Prakash Gardens", address: "City Palace Complex, Udaipur",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Fateh+Prakash+Palace+Udaipur",
      dress: "Yellow & White", palette: ["#f2b134", "#fbf6ea", "#0f5c4c"],
      note: "Turmeric, laughter and blessings beneath the December sun. Wear something you don't mind getting beautifully golden."
    },
    {
      title: "The Sacred *Pheras*", kind: "Hindu Wedding Ceremony", icon: "mandap",
      start: "2026-12-12T17:00:00+05:30", end: "2026-12-12T19:30:00+05:30",
      venue: "Manak Chowk, City Palace", address: "City Palace, Udaipur",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=City+Palace+Udaipur",
      dress: "Ivory & Gold", palette: ["#fbf6ea", "#e8cd8c", "#b8893a"],
      note: "Saat pheras around the sacred Agni as the sun sets over the Aravallis. Kindly be seated by 4:40 PM. Ceremony is unplugged."
    },
    {
      title: "The Grand *Reception*", kind: "Reception & Feast", icon: "chandelier",
      start: "2026-12-12T20:30:00+05:30", end: "2026-12-13T01:00:00+05:30",
      venue: "Durbar Hall", address: "Fateh Prakash Palace, Udaipur",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Durbar+Hall+Fateh+Prakash+Palace+Udaipur",
      dress: "Evening Glamour", palette: ["#4a0f1c", "#1c2a4a", "#d8c7a8"],
      note: "Crystal chandeliers, a grand Indian feast and the couple's first dance as husband and wife. Followed by Vidaai under the stars."
    }
  ],

  /* ----------------------------------------------------------------- Venue */
  venue: {
    word: "UDAIPUR",                    // the giant word the camera dives through
    name: "The City *Palace*",
    address: "City Palace Complex, Old City, Udaipur, Rajasthan 313001",
    description: "Four centuries of marble and mirror-work rising from the banks of Lake Pichola. Where Mewar's royal legacy becomes the backdrop for our sacred union.",
    image: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10",
    mapQuery: "City Palace, Udaipur",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=City+Palace+Udaipur"
  },

  /* ------------------------------------------- Lookbook (3D cylinder gallery) */
  lookbook: [
    { src: "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2", caption: "The Mandap", place: "Udaipur" },
    { src: "https://images.unsplash.com/photo-1697347815876-924f6a358ee2", caption: "Solah Shringaar", place: "The Bride" },
    { src: "https://images.unsplash.com/photo-1770346279037-89853a3e8c60", caption: "Mehendi Art", place: "Sangeet Night" },
    { src: "https://images.unsplash.com/photo-1774020039312-f1965e1b6ef0", caption: "Kanyadaan", place: "The Pheras" },
    { src: "https://images.unsplash.com/photo-1760080838961-4208536db385", caption: "Sherwani & Safa", place: "The Groom" },
    { src: "https://images.unsplash.com/photo-1587271636175-90d58cdad458", caption: "Varmala", place: "Manak Chowk" },
    { src: "https://images.unsplash.com/photo-1675507324104-19488fba67ff", caption: "Diya & Starlight", place: "Durbar Hall" },
    { src: "https://images.unsplash.com/photo-1654156577076-e0350ba86cc1", caption: "Sacred Fire", place: "Saat Phere" }
  ],

  /* ---------------------------------------------------- Concierge & questions */
  concierge: {
    name: "Ananya Rao",
    role: "Your personal wedding concierge",
    hours: "At your service, 24 hours · 8–14 December",
    whatsapp: "919800012345",
    message: "Namaste Ananya, this is {guest}. I have a question about Aarav & Meher's wedding."
  },
  arrangements: [
    { title: "Arrival", text: "Fly into Maharana Pratap Airport (UDR). You will be received with a traditional tilak, aarti and garland, and private aviation slots can be arranged." },
    { title: "Residence", text: "Suites are held for you at The Oberoi Udaivilas, Taj Lake Palace and The Leela Palace. Quote “AM1212”." },
    { title: "Chauffeur", text: "Royal Rajputana cars and palace boats will carry you to every celebration. Driver details arrive 48 hours before you do." },
    { title: "Atelier", text: "Saree draping, safa tying, bridal mehendi touch-ups, tailoring and a quiet room for rest. Ask for anything, however small." }
  ],
  faq: [
    { q: "May I bring a plus-one or children?", a: "Your invitation lists everyone we have the joy of hosting. If anything is unclear, your concierge will gladly help." },
    { q: "What will the weather be like?", a: "Clear December days around 25°C, cool evenings near 12°C. A shawl, pashmina or light jacket for the lake is wise." },
    { q: "Is the ceremony unplugged?", a: "Yes. We humbly request you to be fully present during the sacred pheras. Our photographers will share every moment with you afterwards." },
    { q: "What is the dress code?", a: "Traditional Indian attire is preferred — sarees, lehengas, sherwanis, kurta-pajamas. Each event card has specific palette suggestions." },
    { q: "Gifts?", a: "Your aashirvaad and presence is our greatest gift. Should you wish to honour us further, a shagun blessing or a note in our guestbook would mean the world." },
    { q: "Will the food be vegetarian?", a: "The wedding feast features pure vegetarian and Jain counters prepared with devotion, alongside select gourmet royal delicacies." }
  ],

  /* ----------------------------------------------------------------- RSVP
     method: "whatsapp" (default, works instantly) | "formspree" | "google" | "demo" */
  rsvp: {
    method: "whatsapp",
    whatsapp: "919800012345",
    endpoint: "",                       // Formspree: https://formspree.io/f/xxxxxx
    googleForm: { action: "", fields: { name: "", attendance: "", events: "", guests: "", dietary: "", note: "" } },
    maxGuests: 4,
    dietary: ["No restrictions", "Pure Vegetarian", "Jain", "Vegan", "Gluten-free", "No onion / no garlic"]
  },

  /* ---------------------------------------------------------------- Finale */
  finale: { line: "Saat janam, *ek vaada.*", footnote: "Shubh Vivah · Aarav & Meher · Udaipur · MMXXVI" },

  /* Live URL, used by generator.html to build personalised links */
  siteUrl: ""
};

export default MAISON;
