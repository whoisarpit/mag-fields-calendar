#!/usr/bin/env node

/**
 * Magnetic Fields Nomads Schedule Scraper
 *
 * This script fetches the complete schedule and artist data from the official
 * Magnetic Fields website and outputs it in a format ready to paste into index.html
 *
 * Usage: node scraper.js
 */

const fs = require('fs');

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

async function fetchHTML(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.text();
}

// Try to find the schedule data from the site
async function scrapeScheduleData() {
  console.log('🔍 Fetching schedule data from Magnetic Fields...');

  try {
    // First, try to fetch the schedule page HTML
    const scheduleHTML = await fetchHTML('https://nomads.magneticfields.in/schedule');

    // Look for embedded JSON data in script tags
    const jsonDataMatch = scheduleHTML.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);

    if (jsonDataMatch) {
      const data = JSON.parse(jsonDataMatch[1]);
      console.log('✅ Found embedded schedule data');

      // Extract the schedule and artist data from Next.js data
      const pageProps = data.props?.pageProps;

      if (pageProps && pageProps.festivalDays) {
        return {
          festivalDays: pageProps.festivalDays,
          venues: pageProps.venues,
        };
      }
    }

    console.log('⚠️  Could not find embedded data, trying API endpoints...');

    // Try common API patterns
    const apiUrls = [
      'https://nomads.magneticfields.in/api/schedule',
      'https://nomads.magneticfields.in/_next/data/schedule.json',
    ];

    for (const url of apiUrls) {
      try {
        const data = await fetchJSON(url);
        console.log(`✅ Found data at ${url}`);
        return data;
      } catch (e) {
        // Continue to next URL
      }
    }

    throw new Error('Could not find schedule data via any method');

  } catch (error) {
    console.error('❌ Error fetching schedule:', error.message);
    throw error;
  }
}

// Format the data for output
function formatScheduleForHTML(scheduleData) {
  console.log('\n📝 Formatting schedule data...');

  const { festivalDays, venues } = scheduleData;

  // Create venue ID map (index to ID)
  const venueIdMap = {
    '0': 'easy-picnic',
    '1': 'puqaar',
    '2': 'west-stage',
    '3': 'corona-yurt',
    '4': 'budx-east',
    '5': 'stepwell',
    '6': 'jameson-club',
    '7': 'corona-sundowner',
    '8': 'sanctuary',
    '9': 'sabha',
  };

  // Map day labels to keys
  const dayLabelMap = {
    'Fri': 'fri',
    'Sat': 'sat',
    'Sun': 'sun',
  };

  const scheduleByDay = {
    fri: [],
    sat: [],
    sun: [],
  };

  // Parse festival days
  festivalDays.forEach(dayData => {
    const dayKey = dayLabelMap[dayData.label];
    if (!dayKey) return;

    // Loop through venue indices
    Object.keys(dayData.schedule).forEach(venueIndex => {
      const events = dayData.schedule[venueIndex];
      const venueId = venueIdMap[venueIndex];

      if (!venueId) {
        console.warn(`⚠️  Unknown venue index: ${venueIndex}`);
        return;
      }

      events.forEach(event => {
        const formattedEvent = {
          artist: event.artist || event.name,
          start: event.start,
          end: event.end,
          venue: venueId,
        };

        // Add tag if present (Workshop, Talk, etc.)
        if (event.eventType) {
          formattedEvent.tag = event.eventType;
        }

        scheduleByDay[dayKey].push(formattedEvent);
      });
    });

    // Sort by start time
    scheduleByDay[dayKey].sort((a, b) => {
      const timeToMins = (t) => {
        const [h, m] = t.split(':').map(Number);
        return (h < 11 ? h + 24 : h) * 60 + m;
      };
      return timeToMins(a.start) - timeToMins(b.start);
    });
  });

  // Format venues
  const venuesFormatted = venues.map((v, idx) => ({
    id: venueIdMap[String(idx)],
    name: v.title,
    type: v.type,
  }));

  return {
    schedule: scheduleByDay,
    venues: venuesFormatted,
  };
}

// Main scraper function
async function main() {
  console.log('🚀 Magnetic Fields Nomads Schedule Scraper\n');
  console.log('=' .repeat(60));

  try {
    const rawData = await scrapeScheduleData();
    const formatted = formatScheduleForHTML(rawData);

    // Write to output file
    const output = {
      timestamp: new Date().toISOString(),
      data: formatted,
    };

    fs.writeFileSync(
      'scraped-schedule.json',
      JSON.stringify(output, null, 2)
    );

    console.log('\n✅ Successfully scraped schedule data!');
    console.log('📄 Output saved to: scraped-schedule.json');
    console.log('\n📊 Summary:');
    console.log(`   - Friday events: ${formatted.schedule.fri.length}`);
    console.log(`   - Saturday events: ${formatted.schedule.sat.length}`);
    console.log(`   - Sunday events: ${formatted.schedule.sun.length}`);
    console.log(`   - Total events: ${formatted.schedule.fri.length + formatted.schedule.sat.length + formatted.schedule.sun.length}`);
    console.log(`   - Venues: ${formatted.venues.length}`);
    console.log('\n💡 Note: Artist bios/images are not included in schedule data.');
    console.log('   Those need to be scraped from individual artist pages.');

  } catch (error) {
    console.error('\n❌ Scraper failed:', error.message);
    console.error('\n💡 The Magnetic Fields website may have changed structure.');
    console.error('   You may need to manually inspect the site and update this script.');
    process.exit(1);
  }
}

// Run the scraper
if (require.main === module) {
  main();
}

module.exports = { scrapeScheduleData, formatScheduleForHTML };
