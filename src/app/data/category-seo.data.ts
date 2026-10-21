/**
 * Search-focused title and intro for each category page.
 *
 * Titles lead with the words people actually type into Google in India (researched Oct 2026 — monthly searches in
 * brackets where notable), e.g. "pressure gauge" (22,200), "hand pallet truck" (6,600), "d shackle" (6,600),
 * "needle valve" / "flow control valve" (4,400), "chain pulley block" (2,900), "directional control valve" and
 * "vane pump" (2,400), "polyhydron" (1,600), "taparia spanner set" (1,600). "… in Kolkata" phrasings get almost no
 * searches, so titles name the product first and the shop/city is added by the SEO service.
 *
 * Every intro only describes product types and brands that are actually in that category's catalogue data.
 * Keep it that way when editing: no prices, stock levels, certifications or claims the catalogue doesn't support.
 */
export interface CategorySeo {
  /** <title> text (the shop name is appended automatically when it fits). */
  title: string;
  /** Visible intro paragraph under the category heading; also the basis of the meta description. */
  intro: string;
}

export const CATEGORY_SEO: Record<string, CategorySeo> = {
  // ---------------- Hydraulics
  'hydraulic-ball-valves': {
    title: 'High Pressure Hydraulic Ball Valves – 2, 3 & 4 Way',
    intro:
      'High pressure hydraulic ball valves from Asian Hydraulic: 2-way, 3-way and 4-way block-body valves (KHB2, KH3, KH4), light and heavy series to DIN 2353, split-flange and manifold-mounted versions. Open a model to see its sizes, connections and pressure rating.',
  },
  'directional-control-valves': {
    title: 'Directional Control Valves – Solenoid, Lever & Modular',
    intro:
      'Hydraulic directional control valves from Polyhydron and Yuken: solenoid operated valves (CETOP 3 and size 10), pilot operated, hand lever, cam and rotary valves, power-saving solenoid valves and modular stack valves.',
  },
  'pressure-control-valves': {
    title: 'Pressure Relief, Reducing & Counterbalance Valves',
    intro:
      'Hydraulic pressure control valves from Polyhydron and Yuken: relief and unloading valves, pressure reducing valves, sequence valves, counterbalance and load holding valves, pressure control modules and pressure switches.',
  },
  'flow-control-valves': {
    title: 'Flow Control Valves & Needle Valves – Hydraulic',
    intro:
      'Hydraulic flow control valves with and without check, throttle and check valves, needle and shut-off valves, flow dividers and deceleration valves from Asian Hydraulic, Polyhydron and Yuken, in inline and manifold-mounted versions.',
  },
  'check-valves': {
    title: 'Hydraulic Check Valves – Inline, Pilot & Cartridge',
    intro:
      'Hydraulic check valves from Asian Hydraulic, Hydroline and Yuken: inline high pressure check valves, tube-fitting check valves, pilot operated and lock check valves, and cartridge check valves for one-way flow and load holding.',
  },
  'hydraulic-pumps': {
    title: 'Yuken Vane Pumps & Gear Pumps',
    intro:
      'Yuken hydraulic pumps: single and double vane pumps (PV2R, PVR and PVM series), variable displacement vane pumps and gear pumps. Send us your pump model code, or the flow and pressure you need, and we will help you match it.',
  },
  'quick-release-couplings': {
    title: 'Hydraulic Quick Release Couplings – Flat Face & ISO A',
    intro:
      'Asian Hydraulic quick release couplings: flat face couplings to ISO 16028 (AHF04), ISO A couplings to ISO 7241 (AH series male and female) and quick disconnect couplings (QDC) for hydraulic hoses and machines.',
  },
  'tube-fittings-adaptors': {
    title: 'Hydraulic Tube Fittings, Adaptors & Banjo Fittings',
    intro:
      'Asian Hydraulic tube fittings: tube to male stud fittings (BSP, BSPT, NPTF, metric and SAE/UNF), tube couplings, female connectors, bulkhead and weld couplings, banjo and swivel fittings, adjustable fittings, reducers, adaptors, plugs and SAE flanged connections.',
  },
  'hydraulic-filters': {
    title: 'Hydroline Hydraulic Filters & Suction Strainers',
    intro:
      'Hydroline hydraulic filters: inline spin-on, tank-top spin-on, tank-top cartridge and heavy duty filters, suction strainers, tank mounted strainers and filter clogging indicators for hydraulic power packs.',
  },
  'tank-accessories': {
    title: 'Hydraulic Tank Accessories – Level Gauges & Breathers',
    intro:
      'Hydroline hydraulic reservoir accessories: oil level gauges and sight glasses, air breathers, diffusers and tank hardware for hydraulic power packs.',
  },

  // ---------------- Instrumentation
  'pressure-gauges': {
    title: 'Pressure Gauges – Industrial, SS & Differential',
    intro:
      'Delta pressure gauges for industrial, process and hydraulic use: Bourdon tube and capsule gauges in steel and stainless steel cases, diaphragm type gauges and differential pressure gauges. Each model lists its dial sizes, ranges and accuracy.',
  },
  'temperature-instruments': {
    title: 'Temperature Gauges, Thermowells, RTDs & Thermocouples',
    intro:
      'Delta temperature instruments: stainless steel bimetal and capillary thermometers, flanged and screwed thermowells, RTD assemblies and inserts, and thermocouple assemblies for process plants.',
  },
  'diaphragm-seals': {
    title: 'Diaphragm Seals – Flanged, Sanitary & Wafer Type',
    intro:
      'Delta diaphragm seals in direct flanged (flush and insert), extended neck, sanitary clamp, "I" section, wafer and screwed versions, plus diaphragm seal repair and refurbishment.',
  },
  'instrument-valves-accessories': {
    title: 'Instrument Needle Valves & 2/3/5 Valve Manifolds',
    intro:
      'Delta instrument valves and gauge accessories: needle valves, two, three and five valve manifolds, syphons, snubbers, gauge cocks and gauge protectors.',
  },

  // ---------------- Hand tools
  'pliers-cutters': {
    title: 'Taparia Pliers & Cutters – Combination, Nose & VDE',
    intro:
      'Taparia pliers and cutters: combination side cutting pliers, long nose, bent nose and circlip pliers, VDE insulated pliers, crimping tools, bolt cutters, cable cutters and tin cutters.',
  },
  'screwdrivers-bits': {
    title: 'Taparia Screwdrivers, Bits & Line Testers',
    intro:
      'Taparia screwdrivers: flat, Phillips, Torx, hexagonal, insulated, stubby and two-in-one screwdrivers, screwdriver sets and kits, screwdriver bits, and line and digital testers.',
  },
  'spanners-wrenches': {
    title: 'Taparia Spanner Sets, Pipe Wrenches & Allen Keys',
    intro:
      'Taparia spanners and wrenches: double ended open jaw, ring, combination and slugging spanners and spanner sets, pipe wrenches and chain pipe wrenches, adjustable and torque wrenches, Allen keys and Torx keys.',
  },
  sockets: {
    title: 'Taparia Socket Sets & Sockets – 1/4" to 1" Drive',
    intro:
      'Taparia sockets from 1/4" to 1" square drive: standard, deep, impact, bit and spark plug sockets, socket sets in hexagonal and bi-hexagonal patterns, and socket accessories.',
  },
  'hammers-chisels': {
    title: 'Taparia Hammers, Chisels & Punches',
    intro:
      'Taparia hammers: ball pein and cross pein, claw, club, machinist, sledge, fiberglass handle and soft faced hammers, plus flat, octagonal, SDS and pneumatic chisels, centre and drift punches, leather punches and an axe.',
  },
  'cutting-drilling-abrasives': {
    title: 'Hacksaws, Cutting Wheels, Drills & Files – Taparia',
    intro:
      'Taparia cutting and drilling tools: hacksaw frames and blades, knives and snap-off cutters, cutting and diamond blades, drills and hole saws, files and rasps, and abrasives.',
  },
  'workshop-equipment': {
    title: 'Taparia Tool Kits, Vices, Jacks & Workshop Tools',
    intro:
      'Taparia workshop equipment: tool kits, tool bags, tool boxes and trolleys, C and F clamps, bench and pipe vices, hydraulic bottle and trolley jacks, grease guns and pumps, bearing pullers, spirit levels and carpentry tools.',
  },
  'non-sparking-tools': {
    title: 'Non Sparking Tools – Beryllium Copper & Aluminium Bronze',
    intro:
      'Taparia non-sparking safety tools in beryllium copper (Be-Cu) or aluminium bronze (Al-Br) for hazardous and explosive areas: spanners and spanner sets, pipe and adjustable wrenches, hammers, pliers, screwdrivers, sockets, chisels, files and Allen keys.',
  },

  // ---------------- Lifting & material handling
  'hoists-trolleys': {
    title: 'Chain Pulley Blocks, Electric Chain Hoists & Lever Hoists',
    intro:
      'Chain pulley blocks (heavy duty T series, B series and Revolve series), ratchet lever hoists, single and dual speed electric chain hoists, geared and electric beam trolleys, wire rope and manila rope pulley blocks, pulling and lifting machines, cable pullers and spring balancers.',
  },
  'slings-rigging': {
    title: 'D Shackles, Bow Shackles, Slings & Lifting Hooks',
    intro:
      'Lifting and rigging hardware: screw pin and nut bolt D shackles and bow shackles, polyester round slings and webbing slings, G80 and G100 lifting hooks and alloy chain, master links, eye bolts, turnbuckles, wire rope clamps, cargo lashing and sling protection.',
  },
  'material-handling': {
    title: 'Hand Pallet Trucks, Stackers & Plate Lifting Clamps',
    intro:
      'Material handling equipment: hand pallet trucks (2.5, 3 and 5 ton), scissor lift and rough terrain pallet trucks, hand and electric stackers, hydraulic lifting tables, plate lifting clamps and magnet lifters, drum handling, wire mesh containers and a refurbished 40 ft marine container.',
  },
};

/** Search names for products whose catalogue name differs from what people type (added to the page title). */
export const PRODUCT_SEARCH_NAMES: Record<string, string> = {
  'lifting-screw-pin-dee-shackle': 'D Shackle',
  'lifting-nut-bolt-dee-shackle': 'D Shackle',
  'marine-container-40ft': '40 ft Shipping Container',
};

/**
 * Brand landing pages (/brands/:slug). Brand searches researched Oct 2026 (India, monthly): "polyhydron" 1,600,
 * "taparia spanner set" 1,600, "taparia pipe wrench" 720, "yuken valves" 170, "hydroline filters" 170,
 * "taparia tools dealer" 170, "delta pressure gauge" 110. Intros describe only what the catalogue holds for that brand;
 * they say the shop stocks and supplies the range — never "authorised dealer" or similar unless that is confirmed.
 */
export interface BrandSeo {
  title: string;
  /** Visible heading. */
  heading: string;
  intro: string;
}

export const BRAND_SEO: Record<string, BrandSeo> = {
  'asian-hydraulic': {
    title: 'Asian Hydraulic Ball Valves, Couplings & Tube Fittings',
    heading: 'Asian Hydraulic ball valves, couplings & fittings',
    intro:
      'Western Hardware Mart stocks and supplies Asian Hydraulic products: high pressure ball valves (KHB2, KH3, KH4), flow control and needle valves, inline check valves, flat face and ISO A quick release couplings, and a full range of hydraulic tube fittings and adaptors.',
  },
  polyhydron: {
    title: 'Polyhydron Hydraulic Valves – Directional, Pressure & Flow',
    heading: 'Polyhydron hydraulic valves',
    intro:
      'Polyhydron hydraulic valves from Western Hardware Mart, Kolkata: solenoid, pilot and lever operated directional control valves (4DE06, 4DE10, 4DP10, 4DL06), relief, reducing, sequence and counterbalance valves, pressure control modules and pressure compensated flow control valves.',
  },
  yuken: {
    title: 'Yuken Vane Pumps & Hydraulic Valves',
    heading: 'Yuken vane pumps & hydraulic valves',
    intro:
      'Yuken hydraulic pumps and valves from Western Hardware Mart, Kolkata: PV2R, PVR and PVM series vane pumps, variable vane pumps and gear pumps, solenoid and manual directional valves, modular valves, relief and pressure control valves, flow control and check valves.',
  },
  hydroline: {
    title: 'Hydroline Hydraulic Filters, Strainers & Tank Accessories',
    heading: 'Hydroline filters, strainers & tank accessories',
    intro:
      'Hydroline products from Western Hardware Mart, Kolkata: inline and tank-top hydraulic filters, suction and tank mounted strainers, filter indicators, oil level gauges and sight glasses, air breathers, diffusers and check valves for hydraulic power packs.',
  },
  delta: {
    title: 'Delta Pressure Gauges, Temperature Gauges & Diaphragm Seals',
    heading: 'Delta pressure gauges & process instruments',
    intro:
      'Delta process instruments from Western Hardware Mart, Kolkata: industrial, stainless steel, capsule, diaphragm and differential pressure gauges, bimetal and capillary thermometers, thermowells, RTDs and thermocouples, diaphragm seals, needle valves, valve manifolds and gauge accessories.',
  },
  taparia: {
    title: 'Taparia Tools – Spanners, Pliers, Sockets & Pipe Wrenches',
    heading: 'Taparia hand tools',
    intro:
      'Western Hardware Mart stocks and supplies Taparia hand tools in Kolkata: spanner sets, pipe wrenches, pliers and cutters, screwdrivers and bits, sockets and socket sets, hammers and chisels, hacksaws, files and drills, tool kits and workshop equipment, plus Taparia non-sparking tools.',
  },
};
