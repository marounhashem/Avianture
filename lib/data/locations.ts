/**
 * Curated locations for the Handlers form.
 *
 * COUNTRIES is a flat alphabetized list of country names.
 * CITIES_BY_COUNTRY maps each country to its alphabetized list of major cities.
 * ALL_CITIES is the union of all cities, alphabetized — used as the fallback
 *   suggestion list when no country is selected yet.
 *
 * Lists are SUGGESTIONS only; the form accepts any free text.
 */

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  Algeria: ["Algiers"],
  Argentina: ["Buenos Aires"],
  Armenia: ["Yerevan"],
  Australia: ["Brisbane", "Gold Coast", "Melbourne", "Perth", "Sydney"],
  Austria: ["Innsbruck", "Salzburg", "Vienna"],
  Azerbaijan: ["Baku"],
  Bahamas: ["Nassau"],
  Bahrain: ["Manama"],
  Bangladesh: ["Dhaka"],
  Barbados: ["Bridgetown"],
  Belarus: ["Minsk"],
  Belgium: ["Brussels"],
  Bolivia: ["La Paz", "Santa Cruz"],
  Botswana: ["Gaborone"],
  Brazil: ["Brasília", "Rio de Janeiro", "São Paulo"],
  Bulgaria: ["Sofia"],
  Cambodia: ["Phnom Penh", "Siem Reap"],
  Cameroon: ["Douala", "Yaoundé"],
  Canada: ["Calgary", "Montreal", "Toronto", "Vancouver"],
  Chile: ["Santiago"],
  China: ["Beijing", "Guangzhou", "Shanghai", "Shenzhen"],
  Colombia: ["Bogotá", "Cartagena", "Medellín"],
  "Costa Rica": ["San José"],
  Croatia: ["Dubrovnik", "Split", "Zagreb"],
  Cuba: ["Havana"],
  Cyprus: ["Larnaca", "Nicosia", "Paphos"],
  "Czech Republic": ["Prague"],
  "Democratic Republic of the Congo": ["Kinshasa"],
  Denmark: ["Copenhagen"],
  "Dominican Republic": ["Punta Cana", "Santo Domingo"],
  Ecuador: ["Guayaquil", "Quito"],
  Egypt: ["Alexandria", "Cairo", "Hurghada", "Sharm El Sheikh"],
  "Equatorial Guinea": ["Malabo"],
  Estonia: ["Tallinn"],
  Ethiopia: ["Addis Ababa"],
  Fiji: ["Nadi", "Suva"],
  Finland: ["Helsinki"],
  France: ["Bordeaux", "Cannes", "Lyon", "Marseille", "Nice", "Paris", "Toulouse"],
  Gabon: ["Libreville"],
  Georgia: ["Tbilisi"],
  Germany: [
    "Berlin",
    "Cologne",
    "Düsseldorf",
    "Frankfurt",
    "Hamburg",
    "Munich",
  ],
  Ghana: ["Accra"],
  Greece: ["Athens", "Heraklion", "Mykonos", "Santorini"],
  "Hong Kong": ["Hong Kong"],
  Hungary: ["Budapest"],
  Iceland: ["Reykjavik"],
  India: [
    "Bangalore",
    "Chennai",
    "Delhi",
    "Hyderabad",
    "Kolkata",
    "Mumbai",
  ],
  Indonesia: ["Bali", "Jakarta", "Surabaya"],
  Iran: ["Tehran"],
  Iraq: ["Baghdad", "Basra", "Erbil"],
  Ireland: ["Dublin"],
  Israel: ["Tel Aviv"],
  Italy: ["Florence", "Milan", "Naples", "Olbia", "Rome", "Venice"],
  "Ivory Coast": ["Abidjan"],
  Jamaica: ["Kingston", "Montego Bay"],
  Japan: ["Osaka", "Tokyo"],
  Jordan: ["Amman", "Aqaba"],
  Kazakhstan: ["Almaty", "Astana"],
  Kenya: ["Mombasa", "Nairobi"],
  Kuwait: ["Kuwait City"],
  Latvia: ["Riga"],
  Lebanon: ["Beirut"],
  Libya: ["Benghazi", "Tripoli"],
  Liechtenstein: ["Vaduz"],
  Lithuania: ["Vilnius"],
  Luxembourg: ["Luxembourg"],
  Madagascar: ["Antananarivo"],
  Malaysia: ["Kuala Lumpur", "Penang"],
  Maldives: ["Malé"],
  Mali: ["Bamako"],
  Malta: ["Valletta"],
  Mauritius: ["Port Louis"],
  Mexico: ["Cabo San Lucas", "Cancun", "Mexico City", "Monterrey"],
  Monaco: ["Monaco"],
  Mongolia: ["Ulaanbaatar"],
  Morocco: ["Casablanca", "Marrakech", "Rabat", "Tangier"],
  Mozambique: ["Maputo"],
  Myanmar: ["Yangon"],
  Namibia: ["Windhoek"],
  Nepal: ["Kathmandu"],
  Netherlands: ["Amsterdam", "Rotterdam"],
  "New Zealand": ["Auckland", "Christchurch", "Queenstown", "Wellington"],
  Nigeria: ["Abuja", "Lagos"],
  Norway: ["Bergen", "Oslo"],
  Oman: ["Muscat", "Salalah"],
  Pakistan: ["Islamabad", "Karachi", "Lahore"],
  Panama: ["Panama City"],
  "Papua New Guinea": ["Port Moresby"],
  Paraguay: ["Asunción"],
  Peru: ["Cusco", "Lima"],
  Philippines: ["Cebu", "Manila"],
  Poland: ["Krakow", "Warsaw"],
  Portugal: ["Faro", "Lisbon", "Porto"],
  Qatar: ["Doha"],
  "Republic of the Congo": ["Brazzaville"],
  Romania: ["Bucharest"],
  Russia: ["Moscow", "St Petersburg"],
  Rwanda: ["Kigali"],
  "Saudi Arabia": ["Dammam", "Jeddah", "Medina", "Riyadh"],
  Senegal: ["Dakar"],
  Serbia: ["Belgrade"],
  Seychelles: ["Victoria"],
  Singapore: ["Singapore"],
  Slovakia: ["Bratislava"],
  Slovenia: ["Ljubljana"],
  "South Africa": ["Cape Town", "Durban", "Johannesburg"],
  "South Korea": ["Busan", "Seoul"],
  Spain: ["Barcelona", "Ibiza", "Madrid", "Málaga", "Palma", "Valencia"],
  "Sri Lanka": ["Colombo"],
  Sudan: ["Khartoum"],
  Sweden: ["Gothenburg", "Stockholm"],
  Switzerland: ["Basel", "Bern", "Geneva", "Zurich"],
  Syria: ["Damascus"],
  Taiwan: ["Taipei"],
  Tanzania: ["Dar es Salaam", "Zanzibar"],
  Thailand: ["Bangkok", "Pattaya", "Phuket"],
  "Trinidad and Tobago": ["Port of Spain"],
  Tunisia: ["Tunis"],
  Turkey: ["Ankara", "Antalya", "Bodrum", "Istanbul"],
  Uganda: ["Kampala"],
  Ukraine: ["Kyiv", "Lviv"],
  "United Arab Emirates": [
    "Abu Dhabi",
    "Al Ain",
    "Dubai",
    "Fujairah",
    "Ras Al Khaimah",
    "Sharjah",
  ],
  "United Kingdom": [
    "Belfast",
    "Birmingham",
    "Edinburgh",
    "Glasgow",
    "London",
    "Manchester",
  ],
  "United States": [
    "Aspen",
    "Atlanta",
    "Austin",
    "Boston",
    "Charlotte",
    "Chicago",
    "Dallas",
    "Denver",
    "Detroit",
    "Houston",
    "Las Vegas",
    "Los Angeles",
    "Miami",
    "Minneapolis",
    "Nashville",
    "New York",
    "Orlando",
    "Phoenix",
    "Portland",
    "San Antonio",
    "San Francisco",
    "San Jose",
    "Seattle",
    "Teterboro",
    "Washington DC",
    "White Plains",
  ],
  Uruguay: ["Montevideo"],
  Uzbekistan: ["Tashkent"],
  Venezuela: ["Caracas"],
  Vietnam: ["Hanoi", "Ho Chi Minh City"],
  Yemen: ["Sana'a"],
  Zambia: ["Lusaka"],
  Zimbabwe: ["Harare"],
};

export const COUNTRIES: string[] = Object.keys(CITIES_BY_COUNTRY).sort((a, b) =>
  a.localeCompare(b),
);

export const ALL_CITIES: string[] = Array.from(
  new Set(Object.values(CITIES_BY_COUNTRY).flat()),
).sort((a, b) => a.localeCompare(b));

/** Returns the alphabetical city list for a country, or all cities if no match. */
export function getCitiesForCountry(country: string | null | undefined): string[] {
  if (!country) return ALL_CITIES;
  const exact = CITIES_BY_COUNTRY[country];
  if (exact) return exact;
  return ALL_CITIES;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Airports (ICAO) by city
 * ────────────────────────────────────────────────────────────────────────── */

export type Airport = { icao: string; name: string };

/**
 * Major airports for each curated city. Each entry's airports are kept
 * in their natural priority order (busiest / primary first).
 *
 * Cities not listed here have no preset airports — the combobox falls
 * back to free-text ICAO input for those.
 */
export const AIRPORTS_BY_CITY: Record<string, Airport[]> = {
  // UAE
  Dubai: [
    { icao: "OMDB", name: "Dubai International" },
    { icao: "OMDW", name: "Al Maktoum International" },
  ],
  "Abu Dhabi": [
    { icao: "OMAA", name: "Abu Dhabi International" },
    { icao: "OMAD", name: "Al Bateen Executive" },
  ],
  Sharjah: [{ icao: "OMSJ", name: "Sharjah International" }],
  "Al Ain": [{ icao: "OMAL", name: "Al Ain International" }],
  "Ras Al Khaimah": [{ icao: "OMRK", name: "Ras Al Khaimah International" }],
  Fujairah: [{ icao: "OMFJ", name: "Fujairah International" }],

  // Saudi Arabia
  Riyadh: [{ icao: "OERK", name: "King Khalid International" }],
  Jeddah: [{ icao: "OEJN", name: "King Abdulaziz International" }],
  Dammam: [{ icao: "OEDF", name: "King Fahd International" }],
  Medina: [{ icao: "OEMA", name: "Prince Mohammad bin Abdulaziz" }],

  // Gulf / Levant / North Africa
  Doha: [{ icao: "OTHH", name: "Hamad International" }],
  Manama: [{ icao: "OBBI", name: "Bahrain International" }],
  Muscat: [{ icao: "OOMS", name: "Muscat International" }],
  Salalah: [{ icao: "OOSA", name: "Salalah" }],
  "Kuwait City": [{ icao: "OKKK", name: "Kuwait International" }],
  Beirut: [{ icao: "OLBA", name: "Beirut–Rafic Hariri International" }],
  Amman: [
    { icao: "OJAI", name: "Queen Alia International" },
    { icao: "OJAM", name: "Amman Civil (Marka)" },
  ],
  Aqaba: [{ icao: "OJAQ", name: "King Hussein International" }],
  Damascus: [{ icao: "OSDI", name: "Damascus International" }],
  Cairo: [{ icao: "HECA", name: "Cairo International" }],
  "Sharm El Sheikh": [{ icao: "HESH", name: "Sharm El Sheikh International" }],
  Hurghada: [{ icao: "HEGN", name: "Hurghada International" }],
  Alexandria: [{ icao: "HEBA", name: "Borg El Arab" }],
  "Tel Aviv": [{ icao: "LLBG", name: "Ben Gurion" }],
  Casablanca: [{ icao: "GMMN", name: "Mohammed V International" }],
  Marrakech: [{ icao: "GMMX", name: "Marrakech Menara" }],
  Rabat: [{ icao: "GMME", name: "Rabat–Salé" }],
  Tangier: [{ icao: "GMTT", name: "Tangier Ibn Battouta" }],
  Tunis: [{ icao: "DTTA", name: "Tunis–Carthage" }],
  Algiers: [{ icao: "DAAG", name: "Houari Boumediene" }],
  Tripoli: [{ icao: "HLLT", name: "Tripoli International" }],

  // UK & Ireland
  London: [
    { icao: "EGLL", name: "Heathrow" },
    { icao: "EGKK", name: "Gatwick" },
    { icao: "EGSS", name: "Stansted" },
    { icao: "EGGW", name: "Luton" },
    { icao: "EGLC", name: "London City" },
    { icao: "EGLF", name: "Farnborough" },
    { icao: "EGTK", name: "Oxford (Kidlington)" },
  ],
  Manchester: [{ icao: "EGCC", name: "Manchester" }],
  Birmingham: [{ icao: "EGBB", name: "Birmingham" }],
  Edinburgh: [{ icao: "EGPH", name: "Edinburgh" }],
  Glasgow: [{ icao: "EGPF", name: "Glasgow" }],
  Belfast: [{ icao: "EGAA", name: "Belfast International" }],
  Dublin: [{ icao: "EIDW", name: "Dublin" }],

  // France
  Paris: [
    { icao: "LFPG", name: "Charles de Gaulle" },
    { icao: "LFPO", name: "Orly" },
    { icao: "LFPB", name: "Le Bourget" },
  ],
  Nice: [{ icao: "LFMN", name: "Nice Côte d’Azur" }],
  Cannes: [{ icao: "LFMD", name: "Cannes–Mandelieu" }],
  Marseille: [{ icao: "LFML", name: "Marseille Provence" }],
  Lyon: [{ icao: "LFLL", name: "Lyon–Saint-Exupéry" }],
  Toulouse: [{ icao: "LFBO", name: "Toulouse–Blagnac" }],
  Bordeaux: [{ icao: "LFBD", name: "Bordeaux–Mérignac" }],

  // Switzerland
  Geneva: [{ icao: "LSGG", name: "Geneva" }],
  Zurich: [{ icao: "LSZH", name: "Zurich" }],
  Bern: [{ icao: "LSZB", name: "Bern" }],
  Basel: [{ icao: "LFSB", name: "Basel–Mulhouse–Freiburg" }],

  // Germany
  Frankfurt: [{ icao: "EDDF", name: "Frankfurt am Main" }],
  Munich: [{ icao: "EDDM", name: "Munich" }],
  Berlin: [{ icao: "EDDB", name: "Berlin Brandenburg" }],
  Hamburg: [{ icao: "EDDH", name: "Hamburg" }],
  Düsseldorf: [{ icao: "EDDL", name: "Düsseldorf" }],
  Cologne: [{ icao: "EDDK", name: "Cologne–Bonn" }],

  // Austria & Benelux
  Vienna: [{ icao: "LOWW", name: "Vienna International" }],
  Salzburg: [{ icao: "LOWS", name: "Salzburg" }],
  Innsbruck: [{ icao: "LOWI", name: "Innsbruck" }],
  Brussels: [{ icao: "EBBR", name: "Brussels Airport" }],
  Amsterdam: [{ icao: "EHAM", name: "Schiphol" }],
  Rotterdam: [{ icao: "EHRD", name: "Rotterdam The Hague" }],
  Luxembourg: [{ icao: "ELLX", name: "Luxembourg" }],

  // Iberia
  Madrid: [{ icao: "LEMD", name: "Madrid–Barajas" }],
  Barcelona: [{ icao: "LEBL", name: "Barcelona–El Prat" }],
  Palma: [{ icao: "LEPA", name: "Palma de Mallorca" }],
  Ibiza: [{ icao: "LEIB", name: "Ibiza" }],
  Málaga: [{ icao: "LEMG", name: "Málaga" }],
  Valencia: [{ icao: "LEVC", name: "Valencia" }],
  Lisbon: [{ icao: "LPPT", name: "Humberto Delgado" }],
  Porto: [{ icao: "LPPR", name: "Porto" }],
  Faro: [{ icao: "LPFR", name: "Faro" }],

  // Italy
  Rome: [
    { icao: "LIRF", name: "Fiumicino" },
    { icao: "LIRA", name: "Ciampino" },
  ],
  Milan: [
    { icao: "LIMC", name: "Malpensa" },
    { icao: "LIPZ", name: "Linate" },
  ],
  Venice: [{ icao: "LIPZ", name: "Venice Marco Polo" }],
  Florence: [{ icao: "LIRQ", name: "Florence" }],
  Naples: [{ icao: "LIRN", name: "Naples" }],
  Olbia: [{ icao: "LIEO", name: "Olbia–Costa Smeralda" }],

  // Greece
  Athens: [{ icao: "LGAV", name: "Athens Eleftherios Venizelos" }],
  Mykonos: [{ icao: "LGMK", name: "Mykonos" }],
  Santorini: [{ icao: "LGSR", name: "Santorini" }],
  Heraklion: [{ icao: "LGIR", name: "Heraklion" }],

  // Cyprus & Malta
  Larnaca: [{ icao: "LCLK", name: "Larnaca International" }],
  Paphos: [{ icao: "LCPH", name: "Paphos International" }],
  Nicosia: [{ icao: "LCNC", name: "Nicosia" }],
  Valletta: [{ icao: "LMML", name: "Malta International" }],

  // Turkey
  Istanbul: [
    { icao: "LTFM", name: "Istanbul Airport" },
    { icao: "LTFJ", name: "Sabiha Gökçen" },
  ],
  Ankara: [{ icao: "LTAC", name: "Esenboğa" }],
  Antalya: [{ icao: "LTAI", name: "Antalya" }],
  Bodrum: [{ icao: "LTFE", name: "Bodrum–Milas" }],

  // Northern Europe
  Copenhagen: [{ icao: "EKCH", name: "Copenhagen Kastrup" }],
  Stockholm: [{ icao: "ESSA", name: "Stockholm Arlanda" }],
  Gothenburg: [{ icao: "ESGG", name: "Gothenburg–Landvetter" }],
  Oslo: [{ icao: "ENGM", name: "Oslo Gardermoen" }],
  Bergen: [{ icao: "ENBR", name: "Bergen Flesland" }],
  Helsinki: [{ icao: "EFHK", name: "Helsinki–Vantaa" }],
  Reykjavik: [{ icao: "BIKF", name: "Keflavík" }],

  // Eastern Europe
  Prague: [{ icao: "LKPR", name: "Václav Havel Prague" }],
  Warsaw: [{ icao: "EPWA", name: "Warsaw Chopin" }],
  Krakow: [{ icao: "EPKK", name: "Kraków–Balice" }],
  Budapest: [{ icao: "LHBP", name: "Budapest Ferenc Liszt" }],
  Bucharest: [{ icao: "LROP", name: "Henri Coandă" }],
  Sofia: [{ icao: "LBSF", name: "Sofia" }],
  Belgrade: [{ icao: "LYBE", name: "Nikola Tesla" }],
  Zagreb: [{ icao: "LDZA", name: "Franjo Tuđman" }],
  Ljubljana: [{ icao: "LJLJ", name: "Ljubljana Jože Pučnik" }],
  Bratislava: [{ icao: "LZIB", name: "M. R. Štefánik" }],
  Tallinn: [{ icao: "EETN", name: "Tallinn Lennart Meri" }],
  Riga: [{ icao: "EVRA", name: "Riga" }],
  Vilnius: [{ icao: "EYVI", name: "Vilnius" }],
  Moscow: [
    { icao: "UUEE", name: "Sheremetyevo" },
    { icao: "UUDD", name: "Domodedovo" },
    { icao: "UUWW", name: "Vnukovo" },
  ],
  "St Petersburg": [{ icao: "ULLI", name: "Pulkovo" }],
  Kyiv: [
    { icao: "UKBB", name: "Boryspil" },
    { icao: "UKKK", name: "Igor Sikorsky (Zhuliany)" },
  ],
  Tbilisi: [{ icao: "UGTB", name: "Tbilisi International" }],
  Baku: [{ icao: "UBBB", name: "Heydar Aliyev" }],
  Yerevan: [{ icao: "UDYZ", name: "Zvartnots" }],

  // North America — US
  "New York": [
    { icao: "KJFK", name: "John F. Kennedy" },
    { icao: "KLGA", name: "LaGuardia" },
    { icao: "KEWR", name: "Newark Liberty" },
  ],
  Teterboro: [{ icao: "KTEB", name: "Teterboro" }],
  "White Plains": [{ icao: "KHPN", name: "Westchester County" }],
  Boston: [{ icao: "KBOS", name: "Logan International" }],
  "Washington DC": [
    { icao: "KIAD", name: "Dulles International" },
    { icao: "KDCA", name: "Reagan National" },
    { icao: "KBWI", name: "Baltimore/Washington" },
  ],
  Miami: [
    { icao: "KMIA", name: "Miami International" },
    { icao: "KOPF", name: "Opa-Locka Executive" },
  ],
  Orlando: [{ icao: "KMCO", name: "Orlando International" }],
  Atlanta: [{ icao: "KATL", name: "Hartsfield–Jackson" }],
  Charlotte: [{ icao: "KCLT", name: "Charlotte Douglas" }],
  Nashville: [{ icao: "KBNA", name: "Nashville International" }],
  Houston: [
    { icao: "KIAH", name: "George Bush Intercontinental" },
    { icao: "KHOU", name: "William P. Hobby" },
  ],
  Dallas: [
    { icao: "KDFW", name: "Dallas/Fort Worth" },
    { icao: "KDAL", name: "Dallas Love Field" },
  ],
  "San Antonio": [{ icao: "KSAT", name: "San Antonio International" }],
  Austin: [{ icao: "KAUS", name: "Austin–Bergstrom" }],
  Aspen: [{ icao: "KASE", name: "Aspen/Pitkin County" }],
  Denver: [{ icao: "KDEN", name: "Denver International" }],
  Phoenix: [{ icao: "KPHX", name: "Sky Harbor" }],
  "Las Vegas": [{ icao: "KLAS", name: "Harry Reid International" }],
  "Los Angeles": [
    { icao: "KLAX", name: "Los Angeles International" },
    { icao: "KVNY", name: "Van Nuys" },
  ],
  "San Francisco": [{ icao: "KSFO", name: "San Francisco International" }],
  "San Jose": [{ icao: "KSJC", name: "Norman Y. Mineta San Jose" }],
  Seattle: [{ icao: "KSEA", name: "Seattle–Tacoma" }],
  Portland: [{ icao: "KPDX", name: "Portland International" }],
  Chicago: [
    { icao: "KORD", name: "O’Hare International" },
    { icao: "KMDW", name: "Midway International" },
  ],
  Detroit: [{ icao: "KDTW", name: "Detroit Metropolitan" }],
  Minneapolis: [{ icao: "KMSP", name: "Minneapolis–St Paul" }],

  // Canada / Mexico
  Toronto: [{ icao: "CYYZ", name: "Toronto Pearson" }],
  Montreal: [{ icao: "CYUL", name: "Montréal–Trudeau" }],
  Vancouver: [{ icao: "CYVR", name: "Vancouver International" }],
  Calgary: [{ icao: "CYYC", name: "Calgary International" }],
  "Mexico City": [{ icao: "MMMX", name: "Benito Juárez International" }],
  Cancun: [{ icao: "MMUN", name: "Cancún International" }],
  "Cabo San Lucas": [{ icao: "MMSL", name: "Los Cabos International" }],

  // Caribbean / Latin America
  Nassau: [{ icao: "MYNN", name: "Lynden Pindling International" }],
  "Punta Cana": [{ icao: "MDPC", name: "Punta Cana International" }],
  Bridgetown: [{ icao: "TBPB", name: "Grantley Adams International" }],
  "São Paulo": [
    { icao: "SBGR", name: "Guarulhos International" },
    { icao: "SBSP", name: "Congonhas" },
  ],
  "Rio de Janeiro": [
    { icao: "SBGL", name: "Galeão" },
    { icao: "SBRJ", name: "Santos Dumont" },
  ],
  "Buenos Aires": [
    { icao: "SAEZ", name: "Ministro Pistarini (Ezeiza)" },
    { icao: "SABE", name: "Aeroparque Jorge Newbery" },
  ],
  Santiago: [{ icao: "SCEL", name: "Arturo Merino Benítez" }],
  Bogotá: [{ icao: "SKBO", name: "El Dorado International" }],
  Lima: [{ icao: "SPJC", name: "Jorge Chávez International" }],
  "Panama City": [{ icao: "MPTO", name: "Tocumen International" }],
  "San José": [{ icao: "MROC", name: "Juan Santamaría International" }],

  // Asia
  Singapore: [{ icao: "WSSS", name: "Changi" }],
  "Hong Kong": [{ icao: "VHHH", name: "Hong Kong International" }],
  Beijing: [
    { icao: "ZBAA", name: "Capital International" },
    { icao: "ZBAD", name: "Daxing International" },
  ],
  Shanghai: [
    { icao: "ZSPD", name: "Pudong International" },
    { icao: "ZSSS", name: "Hongqiao" },
  ],
  Shenzhen: [{ icao: "ZGSZ", name: "Bao'an International" }],
  Guangzhou: [{ icao: "ZGGG", name: "Baiyun International" }],
  Tokyo: [
    { icao: "RJTT", name: "Haneda" },
    { icao: "RJAA", name: "Narita" },
  ],
  Osaka: [{ icao: "RJBB", name: "Kansai International" }],
  Seoul: [
    { icao: "RKSI", name: "Incheon International" },
    { icao: "RKSS", name: "Gimpo International" },
  ],
  Taipei: [{ icao: "RCTP", name: "Taoyuan International" }],
  Bangkok: [
    { icao: "VTBS", name: "Suvarnabhumi" },
    { icao: "VTBD", name: "Don Mueang" },
  ],
  Phuket: [{ icao: "VTSP", name: "Phuket International" }],
  Pattaya: [{ icao: "VTBU", name: "U-Tapao" }],
  Hanoi: [{ icao: "VVNB", name: "Noi Bai International" }],
  "Ho Chi Minh City": [{ icao: "VVTS", name: "Tan Son Nhat International" }],
  "Kuala Lumpur": [{ icao: "WMKK", name: "Kuala Lumpur International" }],
  Penang: [{ icao: "WMKP", name: "Penang International" }],
  Jakarta: [{ icao: "WIII", name: "Soekarno–Hatta" }],
  Bali: [{ icao: "WADD", name: "Ngurah Rai International" }],
  Manila: [{ icao: "RPLL", name: "Ninoy Aquino International" }],
  Mumbai: [{ icao: "VABB", name: "Chhatrapati Shivaji Maharaj International" }],
  Delhi: [{ icao: "VIDP", name: "Indira Gandhi International" }],
  Bangalore: [{ icao: "VOBL", name: "Kempegowda International" }],
  Hyderabad: [{ icao: "VOHS", name: "Rajiv Gandhi International" }],
  Chennai: [{ icao: "VOMM", name: "Chennai International" }],
  Kolkata: [{ icao: "VECC", name: "Netaji Subhas Chandra Bose International" }],
  Karachi: [{ icao: "OPKC", name: "Jinnah International" }],
  Lahore: [{ icao: "OPLA", name: "Allama Iqbal International" }],
  Islamabad: [{ icao: "OPIS", name: "Islamabad International" }],
  Colombo: [{ icao: "VCBI", name: "Bandaranaike International" }],
  Malé: [{ icao: "VRMM", name: "Velana International" }],
  Kathmandu: [{ icao: "VNKT", name: "Tribhuvan International" }],

  // Africa
  Johannesburg: [{ icao: "FAOR", name: "O. R. Tambo International" }],
  "Cape Town": [{ icao: "FACT", name: "Cape Town International" }],
  Durban: [{ icao: "FALE", name: "King Shaka International" }],
  Lagos: [{ icao: "DNMM", name: "Murtala Muhammed International" }],
  Abuja: [{ icao: "DNAA", name: "Nnamdi Azikiwe International" }],
  Accra: [{ icao: "DGAA", name: "Kotoka International" }],
  Nairobi: [{ icao: "HKJK", name: "Jomo Kenyatta International" }],
  Mombasa: [{ icao: "HKMO", name: "Moi International" }],
  "Addis Ababa": [{ icao: "HAAB", name: "Bole International" }],
  "Dar es Salaam": [{ icao: "HTDA", name: "Julius Nyerere International" }],
  Kampala: [{ icao: "HUEN", name: "Entebbe International" }],
  Kigali: [{ icao: "HRYR", name: "Kigali International" }],
  Lusaka: [{ icao: "FLKK", name: "Kenneth Kaunda International" }],
  Harare: [{ icao: "FVHA", name: "Robert Gabriel Mugabe International" }],
  Gaborone: [{ icao: "FBSK", name: "Sir Seretse Khama International" }],
  Windhoek: [{ icao: "FYWH", name: "Hosea Kutako International" }],
  "Port Louis": [{ icao: "FIMP", name: "Sir Seewoosagur Ramgoolam" }],
  Antananarivo: [{ icao: "FMMI", name: "Ivato International" }],

  // Oceania
  Sydney: [{ icao: "YSSY", name: "Kingsford Smith" }],
  Melbourne: [{ icao: "YMML", name: "Tullamarine" }],
  Brisbane: [{ icao: "YBBN", name: "Brisbane" }],
  Perth: [{ icao: "YPPH", name: "Perth" }],
  "Gold Coast": [{ icao: "YBCG", name: "Gold Coast" }],
  Auckland: [{ icao: "NZAA", name: "Auckland" }],
  Wellington: [{ icao: "NZWN", name: "Wellington" }],
  Christchurch: [{ icao: "NZCH", name: "Christchurch" }],
  Queenstown: [{ icao: "NZQN", name: "Queenstown" }],
  Nadi: [{ icao: "NFFN", name: "Nadi International" }],
};

/** A "fully resolved" airport with its city + country attached, suitable for search. */
export type FullAirport = Airport & { city: string; country: string };

function buildAllAirports(): FullAirport[] {
  const cityToCountry = new Map<string, string>();
  for (const [country, cities] of Object.entries(CITIES_BY_COUNTRY)) {
    for (const c of cities) cityToCountry.set(c, country);
  }
  const out: FullAirport[] = [];
  const seen = new Set<string>();
  for (const [city, airports] of Object.entries(AIRPORTS_BY_CITY)) {
    const country = cityToCountry.get(city) ?? "";
    for (const a of airports) {
      if (seen.has(a.icao)) continue;
      seen.add(a.icao);
      out.push({ ...a, city, country });
    }
  }
  return out.sort((a, b) => a.icao.localeCompare(b.icao));
}

/** All curated airports, alphabetized by ICAO. */
export const ALL_AIRPORTS: FullAirport[] = buildAllAirports();

/** Look up a single airport by its ICAO code (case-insensitive). */
export function findAirport(icao: string | null | undefined): FullAirport | null {
  if (!icao) return null;
  const upper = icao.trim().toUpperCase();
  return ALL_AIRPORTS.find((a) => a.icao === upper) ?? null;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Timezones (IANA tz database names) for our curated cities.
 * Browsers natively understand these via Intl.DateTimeFormat.
 * ────────────────────────────────────────────────────────────────────────── */

export const TIMEZONE_BY_CITY: Record<string, string> = {
  // UAE / Gulf / Levant / Africa N
  Dubai: "Asia/Dubai",
  "Abu Dhabi": "Asia/Dubai",
  Sharjah: "Asia/Dubai",
  "Al Ain": "Asia/Dubai",
  "Ras Al Khaimah": "Asia/Dubai",
  Fujairah: "Asia/Dubai",
  Riyadh: "Asia/Riyadh",
  Jeddah: "Asia/Riyadh",
  Dammam: "Asia/Riyadh",
  Medina: "Asia/Riyadh",
  Doha: "Asia/Qatar",
  Manama: "Asia/Bahrain",
  Muscat: "Asia/Muscat",
  Salalah: "Asia/Muscat",
  "Kuwait City": "Asia/Kuwait",
  Beirut: "Asia/Beirut",
  Amman: "Asia/Amman",
  Aqaba: "Asia/Amman",
  Damascus: "Asia/Damascus",
  Cairo: "Africa/Cairo",
  "Sharm El Sheikh": "Africa/Cairo",
  Hurghada: "Africa/Cairo",
  Alexandria: "Africa/Cairo",
  "Tel Aviv": "Asia/Jerusalem",
  Casablanca: "Africa/Casablanca",
  Marrakech: "Africa/Casablanca",
  Rabat: "Africa/Casablanca",
  Tangier: "Africa/Casablanca",
  Tunis: "Africa/Tunis",
  Algiers: "Africa/Algiers",
  Tripoli: "Africa/Tripoli",
  Baghdad: "Asia/Baghdad",
  Basra: "Asia/Baghdad",
  Erbil: "Asia/Baghdad",
  Tehran: "Asia/Tehran",
  "Sana'a": "Asia/Aden",

  // UK & Ireland
  London: "Europe/London",
  Manchester: "Europe/London",
  Birmingham: "Europe/London",
  Edinburgh: "Europe/London",
  Glasgow: "Europe/London",
  Belfast: "Europe/London",
  Dublin: "Europe/Dublin",

  // Western Europe
  Paris: "Europe/Paris",
  Nice: "Europe/Paris",
  Cannes: "Europe/Paris",
  Marseille: "Europe/Paris",
  Lyon: "Europe/Paris",
  Toulouse: "Europe/Paris",
  Bordeaux: "Europe/Paris",
  Geneva: "Europe/Zurich",
  Zurich: "Europe/Zurich",
  Bern: "Europe/Zurich",
  Basel: "Europe/Zurich",
  Frankfurt: "Europe/Berlin",
  Munich: "Europe/Berlin",
  Berlin: "Europe/Berlin",
  Hamburg: "Europe/Berlin",
  Düsseldorf: "Europe/Berlin",
  Cologne: "Europe/Berlin",
  Vienna: "Europe/Vienna",
  Salzburg: "Europe/Vienna",
  Innsbruck: "Europe/Vienna",
  Brussels: "Europe/Brussels",
  Amsterdam: "Europe/Amsterdam",
  Rotterdam: "Europe/Amsterdam",
  Luxembourg: "Europe/Luxembourg",

  // Southern Europe
  Madrid: "Europe/Madrid",
  Barcelona: "Europe/Madrid",
  Palma: "Europe/Madrid",
  Ibiza: "Europe/Madrid",
  Málaga: "Europe/Madrid",
  Valencia: "Europe/Madrid",
  Lisbon: "Europe/Lisbon",
  Porto: "Europe/Lisbon",
  Faro: "Europe/Lisbon",
  Rome: "Europe/Rome",
  Milan: "Europe/Rome",
  Venice: "Europe/Rome",
  Florence: "Europe/Rome",
  Naples: "Europe/Rome",
  Olbia: "Europe/Rome",
  Athens: "Europe/Athens",
  Mykonos: "Europe/Athens",
  Santorini: "Europe/Athens",
  Heraklion: "Europe/Athens",
  Larnaca: "Asia/Nicosia",
  Paphos: "Asia/Nicosia",
  Nicosia: "Asia/Nicosia",
  Valletta: "Europe/Malta",
  Istanbul: "Europe/Istanbul",
  Ankara: "Europe/Istanbul",
  Antalya: "Europe/Istanbul",
  Bodrum: "Europe/Istanbul",

  // Northern / Eastern Europe
  Copenhagen: "Europe/Copenhagen",
  Stockholm: "Europe/Stockholm",
  Gothenburg: "Europe/Stockholm",
  Oslo: "Europe/Oslo",
  Bergen: "Europe/Oslo",
  Helsinki: "Europe/Helsinki",
  Reykjavik: "Atlantic/Reykjavik",
  Prague: "Europe/Prague",
  Warsaw: "Europe/Warsaw",
  Krakow: "Europe/Warsaw",
  Budapest: "Europe/Budapest",
  Bucharest: "Europe/Bucharest",
  Sofia: "Europe/Sofia",
  Belgrade: "Europe/Belgrade",
  Zagreb: "Europe/Zagreb",
  Dubrovnik: "Europe/Zagreb",
  Split: "Europe/Zagreb",
  Ljubljana: "Europe/Ljubljana",
  Bratislava: "Europe/Bratislava",
  Tallinn: "Europe/Tallinn",
  Riga: "Europe/Riga",
  Vilnius: "Europe/Vilnius",
  Moscow: "Europe/Moscow",
  "St Petersburg": "Europe/Moscow",
  Kyiv: "Europe/Kyiv",
  Lviv: "Europe/Kyiv",
  Minsk: "Europe/Minsk",
  Tbilisi: "Asia/Tbilisi",
  Baku: "Asia/Baku",
  Yerevan: "Asia/Yerevan",
  Almaty: "Asia/Almaty",
  Astana: "Asia/Almaty",
  Tashkent: "Asia/Tashkent",
  Ulaanbaatar: "Asia/Ulaanbaatar",
  Monaco: "Europe/Monaco",
  Vaduz: "Europe/Vaduz",

  // North America (US — multi-tz, per city)
  "New York": "America/New_York",
  Teterboro: "America/New_York",
  "White Plains": "America/New_York",
  Boston: "America/New_York",
  "Washington DC": "America/New_York",
  Miami: "America/New_York",
  Orlando: "America/New_York",
  Atlanta: "America/New_York",
  Charlotte: "America/New_York",
  Detroit: "America/New_York",
  Nashville: "America/Chicago",
  Houston: "America/Chicago",
  Dallas: "America/Chicago",
  "San Antonio": "America/Chicago",
  Austin: "America/Chicago",
  Chicago: "America/Chicago",
  Minneapolis: "America/Chicago",
  Aspen: "America/Denver",
  Denver: "America/Denver",
  Phoenix: "America/Phoenix",
  "Las Vegas": "America/Los_Angeles",
  "Los Angeles": "America/Los_Angeles",
  "San Francisco": "America/Los_Angeles",
  "San Jose": "America/Los_Angeles",
  Seattle: "America/Los_Angeles",
  Portland: "America/Los_Angeles",
  // Canada
  Toronto: "America/Toronto",
  Montreal: "America/Toronto",
  Vancouver: "America/Vancouver",
  Calgary: "America/Edmonton",
  // Mexico
  "Mexico City": "America/Mexico_City",
  Cancun: "America/Cancun",
  "Cabo San Lucas": "America/Mazatlan",
  Monterrey: "America/Monterrey",

  // Caribbean / Latin America
  Nassau: "America/Nassau",
  "Punta Cana": "America/Santo_Domingo",
  "Santo Domingo": "America/Santo_Domingo",
  Bridgetown: "America/Barbados",
  Havana: "America/Havana",
  Kingston: "America/Jamaica",
  "Montego Bay": "America/Jamaica",
  "Port of Spain": "America/Port_of_Spain",
  "São Paulo": "America/Sao_Paulo",
  "Rio de Janeiro": "America/Sao_Paulo",
  Brasília: "America/Sao_Paulo",
  "Buenos Aires": "America/Argentina/Buenos_Aires",
  Santiago: "America/Santiago",
  Bogotá: "America/Bogota",
  Cartagena: "America/Bogota",
  Medellín: "America/Bogota",
  Lima: "America/Lima",
  Cusco: "America/Lima",
  "Panama City": "America/Panama",
  "San José": "America/Costa_Rica",
  Guayaquil: "America/Guayaquil",
  Quito: "America/Guayaquil",
  Caracas: "America/Caracas",
  Asunción: "America/Asuncion",
  Montevideo: "America/Montevideo",
  "La Paz": "America/La_Paz",
  "Santa Cruz": "America/La_Paz",

  // Asia
  Singapore: "Asia/Singapore",
  "Hong Kong": "Asia/Hong_Kong",
  Beijing: "Asia/Shanghai",
  Shanghai: "Asia/Shanghai",
  Shenzhen: "Asia/Shanghai",
  Guangzhou: "Asia/Shanghai",
  Tokyo: "Asia/Tokyo",
  Osaka: "Asia/Tokyo",
  Seoul: "Asia/Seoul",
  Busan: "Asia/Seoul",
  Taipei: "Asia/Taipei",
  Bangkok: "Asia/Bangkok",
  Phuket: "Asia/Bangkok",
  Pattaya: "Asia/Bangkok",
  Hanoi: "Asia/Ho_Chi_Minh",
  "Ho Chi Minh City": "Asia/Ho_Chi_Minh",
  "Kuala Lumpur": "Asia/Kuala_Lumpur",
  Penang: "Asia/Kuala_Lumpur",
  Jakarta: "Asia/Jakarta",
  Surabaya: "Asia/Jakarta",
  Bali: "Asia/Makassar",
  Manila: "Asia/Manila",
  Cebu: "Asia/Manila",
  "Phnom Penh": "Asia/Phnom_Penh",
  "Siem Reap": "Asia/Phnom_Penh",
  Yangon: "Asia/Yangon",
  Dhaka: "Asia/Dhaka",
  Mumbai: "Asia/Kolkata",
  Delhi: "Asia/Kolkata",
  Bangalore: "Asia/Kolkata",
  Hyderabad: "Asia/Kolkata",
  Chennai: "Asia/Kolkata",
  Kolkata: "Asia/Kolkata",
  Karachi: "Asia/Karachi",
  Lahore: "Asia/Karachi",
  Islamabad: "Asia/Karachi",
  Colombo: "Asia/Colombo",
  Malé: "Indian/Maldives",
  Kathmandu: "Asia/Kathmandu",

  // Africa
  Johannesburg: "Africa/Johannesburg",
  "Cape Town": "Africa/Johannesburg",
  Durban: "Africa/Johannesburg",
  Lagos: "Africa/Lagos",
  Abuja: "Africa/Lagos",
  Accra: "Africa/Accra",
  Nairobi: "Africa/Nairobi",
  Mombasa: "Africa/Nairobi",
  "Addis Ababa": "Africa/Addis_Ababa",
  "Dar es Salaam": "Africa/Dar_es_Salaam",
  Zanzibar: "Africa/Dar_es_Salaam",
  Kampala: "Africa/Kampala",
  Kigali: "Africa/Kigali",
  Lusaka: "Africa/Lusaka",
  Harare: "Africa/Harare",
  Gaborone: "Africa/Gaborone",
  Windhoek: "Africa/Windhoek",
  "Port Louis": "Indian/Mauritius",
  Antananarivo: "Indian/Antananarivo",
  Maputo: "Africa/Maputo",
  Khartoum: "Africa/Khartoum",
  Bamako: "Africa/Bamako",
  Dakar: "Africa/Dakar",
  Abidjan: "Africa/Abidjan",
  Douala: "Africa/Douala",
  Yaoundé: "Africa/Douala",
  Libreville: "Africa/Libreville",
  Brazzaville: "Africa/Brazzaville",
  Kinshasa: "Africa/Kinshasa",
  Malabo: "Africa/Malabo",
  Benghazi: "Africa/Tripoli",

  // Oceania
  Sydney: "Australia/Sydney",
  Melbourne: "Australia/Melbourne",
  Brisbane: "Australia/Brisbane",
  Perth: "Australia/Perth",
  "Gold Coast": "Australia/Brisbane",
  Auckland: "Pacific/Auckland",
  Wellington: "Pacific/Auckland",
  Christchurch: "Pacific/Auckland",
  Queenstown: "Pacific/Auckland",
  Nadi: "Pacific/Fiji",
  Suva: "Pacific/Fiji",
  "Port Moresby": "Pacific/Port_Moresby",
};

/**
 * Resolve a timezone (IANA string) for a given ICAO code, by mapping
 * ICAO → city → TIMEZONE_BY_CITY. Falls back to "UTC" if either the
 * airport or its city's timezone is unknown.
 */
export function getTimezoneForIcao(icao: string | null | undefined): string {
  const a = findAirport(icao);
  if (!a) return "UTC";
  return TIMEZONE_BY_CITY[a.city] ?? "UTC";
}

/**
 * Returns the airport list for a given city/country combination:
 *   - city present and known → its airports
 *   - city missing/unknown but country recognized → union of airports for
 *     all cities in that country (alphabetical by ICAO)
 *   - neither → empty (free-text only)
 */
export function getAirportsForLocation(
  city: string | null | undefined,
  country: string | null | undefined,
): Airport[] {
  if (city) {
    const direct = AIRPORTS_BY_CITY[city];
    if (direct) return direct;
  }
  if (country) {
    const cities = CITIES_BY_COUNTRY[country];
    if (cities) {
      const seen = new Set<string>();
      const out: Airport[] = [];
      for (const c of cities) {
        const list = AIRPORTS_BY_CITY[c];
        if (!list) continue;
        for (const a of list) {
          if (seen.has(a.icao)) continue;
          seen.add(a.icao);
          out.push(a);
        }
      }
      return out.sort((a, b) => a.icao.localeCompare(b.icao));
    }
  }
  return [];
}
