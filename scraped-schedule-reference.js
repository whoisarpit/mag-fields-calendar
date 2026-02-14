/**
 * Complete schedule extracted from https://nomads.magneticfields.in/schedule
 * Generated: 2026-02-14 (Updated with fresh scrape)
 *
 * This is a reference file showing the complete schedule from the official site.
 * Use this to verify your index.html schedule is accurate.
 *
 * Key corrections from fresh scrape:
 * - Corona Sundowner has NO events (events moved to Sabha Bhavan)
 * - Jameson Club has NO events (event moved to Puqaar)
 * - Auntie Flow (DJ) appears 2x on Saturday: puqaar 3-5pm, sabha 7-8pm
 * - 1-800 GIRLS (Live) is at sabha 9-10pm on Saturday
 * - Majestic 88 and FILM are at sabha on Sunday
 *
 * Total events: 79
 * - Friday: 17 events
 * - Saturday: 34 events
 * - Sunday: 28 events
 */

const SCHEDULE_REFERENCE = {
  fri: [
    {
      artist: "Antariksh Daddy",
      start: "12:00",
      end: "18:00",
      venue: "easy-picnic",
    },
    {
      artist: "Sahaja",
      start: "16:00",
      end: "18:00",
      venue: "puqaar",
    },
    { artist: "sudan", start: "18:00", end: "18:45", venue: "west-stage" },
    {
      artist: "Rounak Maiti",
      start: "19:00",
      end: "20:00",
      venue: "west-stage",
    },
    {
      artist: "Ranj x Clifr",
      start: "20:15",
      end: "21:15",
      venue: "west-stage",
    },
    {
      artist: "Vieux Farka Touré",
      start: "21:30",
      end: "22:30",
      venue: "west-stage",
    },
    {
      artist: "Fringe Mechanics",
      start: "20:00",
      end: "23:00",
      venue: "corona-yurt",
    },
    { artist: "DITA", start: "23:00", end: "02:00", venue: "corona-yurt" },
    {
      artist: "Emel x Ouissam",
      start: "02:00",
      end: "05:00",
      venue: "corona-yurt",
    },
    {
      artist: "Mafalda",
      start: "22:30",
      end: "00:30",
      venue: "budx-east",
    },
    {
      artist: "Squidworks",
      start: "00:30",
      end: "02:00",
      venue: "budx-east",
    },
    {
      artist: "Elias Mazian",
      start: "02:00",
      end: "03:30",
      venue: "budx-east",
    },
    {
      artist: "Fursat FM",
      start: "22:30",
      end: "23:30",
      venue: "stepwell",
    },
    {
      artist: "Akanbi",
      start: "23:30",
      end: "00:30",
      venue: "stepwell",
    },
    { artist: "Kia", start: "00:30", end: "01:30", venue: "stepwell" },
    {
      artist: "Barker (Live)",
      start: "01:30",
      end: "02:30",
      venue: "stepwell",
    },
    {
      artist: "Maze",
      start: "02:30",
      end: "05:00",
      venue: "stepwell",
    },
  ],
  sat: [
    {
      artist: "Jogita",
      start: "12:00",
      end: "15:00",
      venue: "easy-picnic",
    },
    {
      artist: "No Plastic",
      start: "15:00",
      end: "18:00",
      venue: "easy-picnic",
    },
    {
      artist: "The Art of Qawwali",
      start: "18:00",
      end: "20:00",
      venue: "puqaar",
    },
    { artist: "Karshni", start: "18:00", end: "19:00", venue: "west-stage" },
    { artist: "Whyte", start: "19:15", end: "20:00", venue: "west-stage" },
    {
      artist: "Curtain Blue Presents 'Kesar'",
      start: "20:15",
      end: "21:15",
      venue: "west-stage",
    },
    {
      artist: "Auntie Flo (Full Live Band)",
      start: "21:30",
      end: "22:30",
      venue: "west-stage",
    },
    {
      artist: "1-800 GIRLS (DJ)",
      start: "20:00",
      end: "23:00",
      venue: "corona-yurt",
    },
    { artist: "Akanbi", start: "23:00", end: "02:00", venue: "corona-yurt" },
    {
      artist: "Direct Drive x Jay Drive",
      start: "02:00",
      end: "05:00",
      venue: "corona-yurt",
    },
    {
      artist: "Girls Night Out",
      start: "22:30",
      end: "00:30",
      venue: "budx-east",
    },
    { artist: "Kia", start: "00:30", end: "02:00", venue: "budx-east" },
    {
      artist: "DJ SWISHA",
      start: "02:00",
      end: "03:30",
      venue: "budx-east",
    },
    {
      artist: "pause.dxa",
      start: "22:30",
      end: "23:30",
      venue: "stepwell",
    },
    {
      artist: "Shantam (Live)",
      start: "23:30",
      end: "00:30",
      venue: "stepwell",
    },
    {
      artist: "SSIEGE (Live)",
      start: "00:30",
      end: "01:30",
      venue: "stepwell",
    },
    {
      artist: "Tyrell Dub Corp (Live)",
      start: "01:30",
      end: "02:30",
      venue: "stepwell",
    },
    {
      artist: "moktar",
      start: "02:30",
      end: "05:30",
      venue: "stepwell",
    },
    {
      artist: "Auntie Flow (DJ)",
      start: "15:00",
      end: "17:00",
      venue: "puqaar",
    },
    {
      artist: "Auntie Flow (DJ)",
      start: "19:00",
      end: "20:00",
      venue: "sabha",
    },
    {
      artist: "1-800 GIRLS (Live)",
      start: "21:00",
      end: "22:00",
      venue: "sabha",
    },
    {
      artist: "Flow: Mindful Movement",
      start: "09:00",
      end: "09:45",
      venue: "sanctuary",
      tag: "Workshop",
    },
    {
      artist: "Breathwork: Awakening Prana Shakti",
      start: "10:00",
      end: "11:00",
      venue: "sanctuary",
      tag: "Workshop",
    },
    {
      artist: "Afloat: Experiential Live Soundscape",
      start: "11:15",
      end: "12:15",
      venue: "sanctuary",
      tag: "Workshop",
    },
    {
      artist: "Nāda Yoga: Guided Voicework",
      start: "12:30",
      end: "13:15",
      venue: "sanctuary",
      tag: "Workshop",
    },
    {
      artist: "Sharing Circle",
      start: "13:30",
      end: "15:00",
      venue: "sanctuary",
      tag: "Workshop",
    },
    {
      artist: "Sound Immersion: The Space Inside You",
      start: "15:15",
      end: "16:15",
      venue: "sanctuary",
      tag: "Workshop",
    },
    {
      artist: "Expressive Art Therapy",
      start: "16:30",
      end: "17:30",
      venue: "sanctuary",
      tag: "Workshop",
    },
    {
      artist: "Puqaar Diaries 2: Screening & Conversation",
      start: "15:00",
      end: "16:00",
      venue: "puqaar",
      tag: "Talk",
    },
  ],
  sun: [
    {
      artist: "Girls Night Out",
      start: "12:00",
      end: "15:00",
      venue: "easy-picnic",
    },
    {
      artist: "Mafalda",
      start: "15:00",
      end: "18:00",
      venue: "easy-picnic",
    },
    {
      artist: "Yakh Basta",
      start: "02:00",
      end: "05:00",
      venue: "puqaar",
    },
    { artist: "JBABE", start: "18:00", end: "18:45", venue: "west-stage" },
    {
      artist: "Jal, Jungle, Zameen: Elsewhere In India (Debut)",
      start: "19:00",
      end: "20:00",
      venue: "west-stage",
    },
    {
      artist: "Shantam (Live)",
      start: "20:15",
      end: "21:15",
      venue: "west-stage",
    },
    {
      artist: "Rival Consoles (Live AV)",
      start: "21:30",
      end: "22:30",
      venue: "west-stage",
    },
    {
      artist: "No Plastic",
      start: "20:00",
      end: "23:00",
      venue: "corona-yurt",
    },
    {
      artist: "Tonkatsukitty",
      start: "23:00",
      end: "02:00",
      venue: "corona-yurt",
    },
    {
      artist: "Zokhuma",
      start: "02:00",
      end: "05:00",
      venue: "corona-yurt",
    },
    {
      artist: "D. Tiffany",
      start: "22:30",
      end: "02:00",
      venue: "budx-east",
    },
    {
      artist: "Sunju Hargun (B-Side)",
      start: "22:30",
      end: "02:00",
      venue: "stepwell",
    },
    {
      artist: "Daisy Moon",
      start: "02:00",
      end: "05:00",
      venue: "stepwell",
    },
    {
      artist: "Majestic 88",
      start: "15:00",
      end: "17:00",
      venue: "sabha",
    },
    {
      artist: "FILM (Live)",
      start: "17:00",
      end: "18:00",
      venue: "sabha",
    },
    {
      artist: "Somatic Release Practice",
      start: "09:00",
      end: "09:45",
      venue: "sanctuary",
      tag: "Workshop",
    },
    {
      artist: "Breathwork: Somatic Inquiry & Regulation",
      start: "10:00",
      end: "11:00",
      venue: "sanctuary",
      tag: "Workshop",
    },
    {
      artist: "Nāda Nidra",
      start: "11:15",
      end: "12:15",
      venue: "sanctuary",
      tag: "Workshop",
    },
    {
      artist: "Song Catching",
      start: "12:30",
      end: "13:15",
      venue: "sanctuary",
      tag: "Workshop",
    },
    {
      artist: "Sharing Circle",
      start: "13:30",
      end: "15:00",
      venue: "sanctuary",
      tag: "Workshop",
    },
    {
      artist: "Afloat: Experiential Live Soundscape",
      start: "15:15",
      end: "16:15",
      venue: "sanctuary",
      tag: "Workshop",
    },
    {
      artist: "Expressive Arts Therapy",
      start: "16:30",
      end: "17:30",
      venue: "sanctuary",
      tag: "Workshop",
    },
    {
      artist: "In Tune: Live Inter-Traditional Jam",
      start: "12:00",
      end: "12:30",
      venue: "sabha",
      tag: "Talk",
    },
    {
      artist: "In Tune: Folk & Futurism",
      start: "12:45",
      end: "13:30",
      venue: "sabha",
      tag: "Talk",
    },
    {
      artist: "In Tune: Trends For 2026",
      start: "13:00",
      end: "13:45",
      venue: "sabha",
      tag: "Talk",
    },
    {
      artist: "In Tune: Influences",
      start: "13:30",
      end: "14:15",
      venue: "sabha",
      tag: "Talk",
    },
    {
      artist: "In Tune: The Sound Of Belonging",
      start: "14:15",
      end: "15:00",
      venue: "sabha",
      tag: "Talk",
    },
  ],
};

module.exports = SCHEDULE_REFERENCE;
