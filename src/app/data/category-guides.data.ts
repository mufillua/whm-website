/**
 * "Choosing …" buying guide shown at the foot of each category page (page 1 only, so paginated pages don't repeat it).
 *
 * Each guide is written around the words people search for that kind of product: the Search Console queries the site
 * already gets (hydraulic / suction / return line / tank mounted strainers, non sparking spanner and wrench, modular
 * valves, spanner shop) and the terms researched for the category titles (pressure gauge, hand pallet truck, d
 * shackle, needle valve, flow control valve, chain pulley block, directional control valve, vane pump, taparia
 * spanner set, taparia pipe wrench…), plus the trade words buyers use (NRV, QRC, PT100, CETOP 3, 4 inch gauge).
 *
 * Rules, as for CATEGORY_SEO: every model, size, range and rating named here is in that category's product data;
 * general advice is ordinary trade practice. No prices, stock levels, delivery promises, certifications or claims
 * the catalogue doesn't support. Keep the wording natural — written for the buyer first.
 */
export interface CategoryGuide {
  /** Visible <h2>. */
  heading: string;
  /** Plain-text paragraphs. */
  paragraphs: string[];
  /** Category slugs linked under the guide. */
  related: string[];
}

export const CATEGORY_GUIDES: Record<string, CategoryGuide> = {
  // ---------------- Hydraulics
  'hydraulic-ball-valves': {
    heading: 'Choosing a high pressure hydraulic ball valve',
    paragraphs: [
      'A hydraulic ball valve opens or shuts off an oil line with a quarter turn of the handle. Our high pressure ball valves are Asian Hydraulic carbon steel valves rated up to 500 bar, depending on the model, size and seals. They come with BSP, NPT or SAE threaded ports, DIN 2353 tube connections in light and heavy series, SAE J518 split flanges (KHB2SF), or as square-body valves for direct manifold mounting (KHP2, KHP3).',
      'Choose the number of ways for the job. A 2 way ball valve (KHB2) isolates a pump, filter, accumulator or gauge; a 3 way ball valve (KH3) diverts flow between two circuits; and a 4 way ball valve (KH4, with L, T or X ball drilling) switches between more ports. Run a ball valve fully open or fully closed rather than half open — for speed control, use a flow control or needle valve instead.',
      'To match a valve, send the line size (DN or inch), the thread or connection type, the working pressure, the number of ways and the fluid. O-rings are available in NBR, FKM, EPDM and MVQ to suit the oil and the temperature, from -10 °C to +100 °C depending on the seal material.',
    ],
    related: ['flow-control-valves', 'tube-fittings-adaptors', 'quick-release-couplings'],
  },
  'directional-control-valves': {
    heading: 'Choosing a hydraulic directional control valve',
    paragraphs: [
      'A directional control valve starts, stops and reverses the oil flow to a cylinder or hydraulic motor. We supply Polyhydron and Yuken valves: hydraulic solenoid valves in CETOP 3 / NG6 (4DE06, Yuken DSG-01) and size 10 (4DE10, DSG-03), pilot operated and solenoid controlled pilot operated valves for higher flows, hand lever valves (4DL06, 4DL10, DLS), cam and rotary valves (4RDL), and power-saving modules for solenoid coils.',
      'Most of these are 4-way valves with two or three spool positions (4/2 or 4/3). The spool type decides what the cylinder does in the centre position: held, floating, or with the pump unloaded to tank. Modular valves, also called sandwich valves, stack between the directional valve and its subplate to add relief, reducing, check or throttle functions without extra piping; we carry Yuken modular valves in the 01, 03, 04 and 06 series.',
      'When you enquire, share the valve size or mounting pattern, the spool symbol, how it is operated (solenoid voltage AC or DC, lever or pilot), the flow and the working pressure. If you are replacing a valve, the model code on its nameplate is the quickest way to match it.',
    ],
    related: ['pressure-control-valves', 'flow-control-valves', 'hydraulic-pumps'],
  },
  'pressure-control-valves': {
    heading: 'Choosing a pressure relief, reducing or counterbalance valve',
    paragraphs: [
      'Pressure control valves limit, reduce or sequence the pressure in a hydraulic circuit. A pressure relief valve protects the pump and the circuit by returning oil to the tank once the set pressure is reached. Direct acting relief valves (Polyhydron DPR, Yuken direct operated) respond quickly at moderate flows, pilot operated relief valves (PPR, Yuken pilot operated) handle larger flows, and relief cum unloading valves (PPRU) also let the pump run unloaded at low pressure.',
      'A pressure reducing valve (DPM06, PPM) feeds a branch, such as clamping, at a lower pressure than the main line. A sequence valve (DPS06) makes one actuator move only after another has built up pressure. Counterbalance and load holding valves (CBS, 2CB06T03 and the Yuken YC cartridge series) hold a load on vertical cylinders, cranes and hoists so it cannot run away while it is lowered. Pressure control modules (PCM) and pressure switches complete the range.',
      'Tell us the function, the pressure setting range, the flow and the mounting: threaded, subplate, modular or cartridge. Always set a valve with a pressure gauge on the circuit, raising the setting slowly and never above the valve\'s maximum.',
    ],
    related: ['directional-control-valves', 'check-valves', 'pressure-gauges'],
  },
  'flow-control-valves': {
    heading: 'Choosing a flow control valve or needle valve',
    paragraphs: [
      'A flow control valve sets the speed of a cylinder or hydraulic motor by controlling how much oil passes. A flow control valve with check (Asian Hydraulic DRV and the manifold mounted DRVP), also called a one way flow control or throttle check valve, controls the flow in one direction and lets it return freely. Valves without a check (DV, DVP) throttle both ways, and a hydraulic needle valve (NV) gives fine adjustment or shut-off.',
      'Where the speed must stay steady as the load changes, use a pressure compensated flow control valve (Polyhydron 2PF*10). The FDTA flow divider splits one flow equally between two outlets, Yuken deceleration valves slow an actuator smoothly near the end of its stroke, and modular throttle check valves (TCM06 for CETOP 3, TCM10) fit straight into a valve stack.',
      'Share the flow range, the working pressure, the port size or mounting, and whether you need a built-in check valve or pressure compensation. Start with the valve nearly closed and open it gradually while the actuator runs, and mind the flow arrow on the body. Needle valves for pressure gauges and transmitters are listed under instrument valves.',
    ],
    related: ['check-valves', 'directional-control-valves', 'instrument-valves-accessories'],
  },
  'check-valves': {
    heading: 'Choosing a hydraulic check valve (non-return valve)',
    paragraphs: [
      'A check valve, or non-return valve (NRV), lets oil flow one way and blocks it in reverse. Our inline high pressure check valves (Asian Hydraulic CV) have hexagon bodies with BSP ports from 1/4" to 2" and a cracking pressure of 0.5 or 1 bar. There are also tube-fitting check valves, Hydroline inline (CUT) and lock check valves (DLVT, SLVT), and Yuken in-line, pilot controlled and cartridge check valves (CK-08, CK-10).',
      'Use a check valve to stop back-flow to the pump, to isolate an accumulator, or to bypass a filter or cooler. A pilot operated check valve, also called a lock valve, holds a cylinder in position and opens in reverse only when pilot pressure is applied, so the load stays put until the circuit releases it.',
      'Send the port size or mounting, the working pressure, the flow and the cracking pressure you need. Fit the valve with the arrow pointing in the direction of free flow, and connect the pilot line on pilot operated versions.',
    ],
    related: ['pressure-control-valves', 'flow-control-valves', 'hydraulic-ball-valves'],
  },
  'hydraulic-pumps': {
    heading: 'Choosing a vane pump or gear pump',
    paragraphs: [
      'A hydraulic pump turns the power of an electric motor or engine into oil flow. We supply Yuken pumps: fixed displacement vane pumps in the PVR, PVM, PV2R, SVP and HPV series, each in single and double versions, variable displacement vane pumps (PVV-10, PVV20, RV20) and PG series gear pumps (PG0 to PG3).',
      'Vane pumps run quietly and suit machine tools, presses and injection moulding machines. A double vane pump gives two separate flows from one shaft, for example a large flow for fast approach and a small one for pressing. Variable displacement vane pumps adjust their output to demand and waste less power, while gear pumps are compact and robust for simpler power packs.',
      'The quickest way to match a pump is the model code on the old pump\'s nameplate. Otherwise tell us the flow or displacement, the pressure, the motor speed and mounting, and the shaft type. Fill a new pump with clean oil before the first start, check the direction of rotation, and keep the suction line short and unrestricted.',
    ],
    related: ['hydraulic-filters', 'pressure-control-valves', 'tank-accessories'],
  },
  'quick-release-couplings': {
    heading: 'Choosing a hydraulic quick release coupling',
    paragraphs: [
      'A quick release coupling (QRC) connects and disconnects a hydraulic hose by hand, without tools; self-sealing types close off both halves so very little oil escapes. Our Asian Hydraulic range covers flat face couplings to ISO 16028 (AHF04, 350–500 bar working pressure, BSP or NPT threads), ISO A couplings to ISO 7241 Series A in 1/4" to 2" body sizes (AH series male and female, BSPP or NPTF threads) and quick disconnect couplings (QDC).',
      'Flat face quick couplings spill almost no oil when they are disconnected and let very little air or dirt in, which is why they are common on construction machinery and attachments. ISO A couplings are the general purpose poppet type used on tractors, implements, jacks and hydraulic tools. The two types do not connect to each other, so match the standard already on the machine.',
      'Send the coupling standard (flat face or ISO A), the thread type and size and the working pressure, or the code stamped on your existing coupling. Wipe both faces clean before connecting, and don\'t couple under residual pressure unless the coupling is made for it.',
    ],
    related: ['tube-fittings-adaptors', 'hydraulic-ball-valves', 'check-valves'],
  },
  'tube-fittings-adaptors': {
    heading: 'Choosing hydraulic tube fittings and adaptors',
    paragraphs: [
      'Hydraulic tube fittings join steel tubes to pumps, valves, cylinders and hoses. Our Asian Hydraulic range includes tube to male stud fittings with BSP, BSPT, NPTF, metric and SAE/UNF threads (with O-ring and elastomeric sealing versions), tube couplings, female connectors, bulkhead and weld couplings, reducers and expanders, banjo and swivel fittings, adjustable fittings, weld nipples, plugs and blanking ends, gauge adaptors and SAE flanged connections.',
      'To choose a fitting you need three things: the tube outside diameter, the series (light or heavy, which sets the pressure rating) and the port thread at the other end. Parallel threads such as BSP seal with an O-ring or a bonded seal, while tapered BSPT and NPTF threads seal on the thread itself, so mixing the two is a common cause of leaks.',
      'Cut the tube square, deburr it and tighten the fitting as the maker instructs; over-tightening damages threads and seals. Send the tube OD, the series, the thread type and the quantities, and we will match the hydraulic fittings and adaptors.',
    ],
    related: ['quick-release-couplings', 'hydraulic-ball-valves', 'spanners-wrenches'],
  },
  'hydraulic-filters': {
    heading: 'Choosing a hydraulic filter or suction strainer',
    paragraphs: [
      'Clean oil is the cheapest way to make pumps, valves and seals last. Hydroline makes a filter for each point in the circuit. Suction strainers (SC 2, SC 3, SE) protect the pump inlet, and tank mounted strainers (TMA, TMH, TMS, TMSU, SC2M) sit inside the reservoir. Tank top return line filters, spin-on (TFR3) and cartridge (TIF2, TIFP, FIF, RPF, SPF, JFR1), clean the oil coming back to the tank. Inline spin-on filters (IFR 2, IFR3, IFR4) and the heavy duty inline HFR clean it within the line, and the CFR is a heavy duty tank top filter.',
      'Choose by the flow, the position in the circuit (suction, pressure or return line), the port size and the micron rating. A suction strainer must be generously sized so the pump never starves of oil, while return line filters are usually finer. The GR filter gauge shows when an element is clogged, so it is changed on time rather than on a guess.',
      'Change or clean the element when the indicator says so, keep to the same micron rating, and keep the bypass working. Send us the model on your old filter housing, or the flow, port size and micron rating you need.',
    ],
    related: ['tank-accessories', 'hydraulic-pumps', 'check-valves'],
  },
  'tank-accessories': {
    heading: 'Choosing hydraulic tank accessories: level gauges and breathers',
    paragraphs: [
      'A well-equipped hydraulic reservoir keeps the oil clean, calm and easy to check. Hydroline tank accessories include oil level gauges (LG 2, LG 6, LG 7) and sight glasses (SG S / A, SGP), filler and air breathers including spin-on (AB, AB 2) and desiccant (DBT) types, return line diffusers, magnetic tank cleaners (MT), weld flanges and rubber bushings.',
      'The air breather lets the tank breathe as the oil level rises and falls without drawing in dust, and a desiccant breather also keeps moisture out. Diffusers slow the oil returning to the tank so it doesn\'t foam or stir up sediment, and a magnetic tank cleaner holds fine steel particles. Mount level gauges vertically and check the oil level with the system stopped.',
      'Send the mounting size or thread and the tank wall thickness, and for an oil level gauge the length you need. Keep breathers clean so the tank can breathe freely.',
    ],
    related: ['hydraulic-filters', 'hydraulic-pumps', 'temperature-instruments'],
  },

  // ---------------- Instrumentation
  'pressure-gauges': {
    heading: 'Choosing a pressure gauge',
    paragraphs: [
      'Delta pressure gauges cover most industrial, process and hydraulic duties: Bourdon tube gauges in steel and stainless steel cases, all-SS 316 and 316L gauges, glycerine (liquid) filled versions, capsule and diaphragm gauges for low pressures, differential pressure gauges, electric contact gauges for switching, maximum reading gauges and SS case test gauges. Dial sizes run from 40 mm to 250 mm and ranges go up to 1600 bar.',
      'Choose the range so the normal working pressure sits around the middle of the dial; for a line that runs at 6 bar, a 0–10 bar gauge is a good fit. Use a glycerine filled pressure gauge or a snubber where the pressure pulsates (pumps and hydraulics), a syphon on steam lines, and a diaphragm seal for corrosive, viscous or hygienic media. Accuracy ranges from ±2.5% of full scale on general purpose gauges to ±1.0% on industrial SS gauges and ±0.25% on test gauges.',
      'When you enquire, give the dial size (63 mm, 100 mm and 150 mm are the common ones; 100 mm is the usual "4 inch" gauge), the range and unit (bar, kg/cm² or psi), the connection thread and whether it enters from the bottom or the back, the medium, and whether you need glycerine filling.',
    ],
    related: ['diaphragm-seals', 'instrument-valves-accessories', 'temperature-instruments'],
  },
  'temperature-instruments': {
    heading: 'Choosing a temperature gauge, PT100 RTD or thermocouple',
    paragraphs: [
      'To read the temperature on site, Delta all stainless steel bimetal thermometers come in dial sizes from 40 mm to 150 mm with ranges from -80 °C to 600 °C. There are also SS dial thermometers with a rigid stem or a capillary (100 mm to 250 mm dials, up to 650 °C) for reading away from the hot point, and exhaust thermometers for engines (50 °C to 650 °C).',
      'To send a signal to a controller, PLC or display, use a PT100 RTD (SS 316 sheath, mostly 3-wire, in fixed or adjustable threaded, flanged, tri-clamp and bearing versions) or a K type (Chromel-Alumel) thermocouple. RTDs are more accurate and stable at moderate temperatures, while thermocouples reach higher temperatures.',
      'A thermowell, flanged or screwed, straight or tapered and machined from bar stock, protects the sensor and lets you remove it without draining a pressurised line. Send the temperature range, the dial size or sensor type, the stem or insertion length, the process connection, and whether you need a thermowell.',
    ],
    related: ['pressure-gauges', 'instrument-valves-accessories', 'diaphragm-seals'],
  },
  'diaphragm-seals': {
    heading: 'Choosing a diaphragm seal for a pressure gauge',
    paragraphs: [
      'A diaphragm seal, or chemical seal, keeps the process medium out of a pressure gauge or transmitter: a flexible diaphragm passes the pressure through a sealed fill liquid. It is the answer for corrosive, viscous, crystallising and slurry media, and for hygienic lines in food and pharmaceutical plants.',
      'Delta diaphragm seals come in direct flanged (flush and insert), extended neck, sanitary clamp, "I" section, wafer, floating ring, slip ring coupled, direct coupled, screwed flush, compact and heavy duty mini designs. Flanged seals match the pipeline flange standard, extended neck seals reach through thick insulation or a nozzle, and sanitary clamp seals suit lines that are cleaned in place.',
      'We also repair and refurbish diaphragm seals. The gauge and the seal are filled and assembled as one unit, so don\'t unscrew the gauge from the seal or the fill liquid is lost. To choose, send the process connection (flanged, screwed, sanitary or wafer), the medium, the pressure and temperature, and the diaphragm material.',
    ],
    related: ['pressure-gauges', 'instrument-valves-accessories'],
  },
  'instrument-valves-accessories': {
    heading: 'Choosing instrument needle valves, manifolds and gauge accessories',
    paragraphs: [
      'Instrument valves connect gauges and transmitters to the process so they can be isolated, vented and tested. Delta instrument needle valves come in SS 316, SS 316L or Monel, rated to 400 bar (NV3 in sizes from 1/8" to 1"). Two, three and five valve manifolds, rated to 6000 psi with 1/2" NPT process and instrument ports, mount pressure and differential pressure transmitters.',
      'A 2 valve manifold isolates and vents a pressure instrument; a 3 valve manifold adds an equalising valve for differential pressure transmitters; and a 5 valve manifold adds test and vent valves on each side. Operate them in the right order, equalising first, so a differential instrument is never over-ranged.',
      'Gauge accessories protect the instrument. A syphon (coil, pigtail or U type) keeps steam away from a gauge, a snubber damps pulsation, an overload protector closes at a set pressure between 1 and 400 bar, and gauge cocks and flushing rings make isolation and cleaning easy. Send the connection size and thread, the pressure rating and the material.',
    ],
    related: ['pressure-gauges', 'diaphragm-seals', 'flow-control-valves'],
  },

  // ---------------- Hand tools
  'pliers-cutters': {
    heading: 'Choosing pliers and cutters',
    paragraphs: [
      'Taparia pliers and cutters cover everyday electrical, fitting and maintenance work: combination side cutting pliers, long nose and bent nose pliers, side cutting pliers and nippers, circlip pliers, slip joint, water pump and locking pliers, wire stripping pliers and an auto wire stripper, crimping tools, and VDE insulated pliers and plier sets for electrical work.',
      'For cutting, choose by the material: cable cutters for copper and aluminium cable, bolt cutters for bolts, rod and chain, aviation and spring tin cutters for sheet, wire rope cutters, and PVC pipe cutters. Longer pliers give more leverage, while mini and micro jewellery pliers suit electronics and fine work.',
      'Don\'t use pliers on nuts (use a spanner) and cut hardened wire only with cutters made for it. Send the plier type and length, or for cutters the material and thickness to be cut, along with the quantity.',
    ],
    related: ['screwdrivers-bits', 'spanners-wrenches', 'non-sparking-tools'],
  },
  'screwdrivers-bits': {
    heading: 'Choosing screwdrivers, bits and line testers',
    paragraphs: [
      'Taparia screwdrivers come with flat, Phillips, Torx and hexagonal tips, in insulated versions for electrical work, two-in-one reversible screwdrivers, stubby and poker screwdrivers for tight spaces, and striking screwdrivers that can take a hammer blow. Screwdriver sets and kits, precision screwdriver sets for small screws, bit drivers and bit sets (including an 80 piece set and an impact driver bit set) cover mixed jobs.',
      'Match the tip type and size to the screw head; a tip that is too small slips and damages the screw. Phillips and Pozidrive heads look alike but each needs its own bit. For electrical work, use an insulated screwdriver and check for voltage with a line tester or a digital tester.',
      'Send the tip type and size, the blade length and whether you need insulation, or the screwdriver set you have in mind.',
    ],
    related: ['pliers-cutters', 'sockets', 'workshop-equipment'],
  },
  'spanners-wrenches': {
    heading: 'Choosing spanner sets, pipe wrenches and Allen keys',
    paragraphs: [
      'Taparia spanners cover every common pattern: double ended open jaw, ring, combination and single ended spanners, spanner sets in mm and inch, L spanners, box and tubular box spanners, cross rim wrenches, and slugging ring and open ended spanners for heavy bolting with a hammer. Adjustable wrenches, standard and ratchet torque wrenches, and Allen keys and Allen key sets in mm and inch complete the range.',
      'Pipe wrenches come in general purpose, heavy duty and aluminium handle types, plus chain pipe wrenches for large pipe, and are sized by length; an 18 inch pipe wrench is 450 mm long. A combination spanner has an open jaw at one end and a ring at the other; the ring grips all six sides of the nut, so it is less likely to round it off.',
      'Use the exact size so the spanner doesn\'t slip, pull rather than push, and use a torque wrench wherever a tightening torque is specified. Send the nut or bolt size in mm or inch and the spanner type, or the pipe size for a pipe wrench, with the quantity. You can also see the range at our shop on N. S. Road, Kolkata.',
    ],
    related: ['sockets', 'non-sparking-tools', 'workshop-equipment'],
  },
  sockets: {
    heading: 'Choosing a socket set and drive size',
    paragraphs: [
      'Taparia sockets and socket sets come in all five square drive sizes: 1/4" (6.3 mm), 3/8" (9.5 mm), 1/2" (12.7 mm), 3/4" (19 mm) and 1" (25.4 mm). Alongside standard hexagonal and bi-hexagonal sockets there are deep sockets, impact sockets, hex bit and Torx bit sockets, E-sockets, spark plug sockets and T socket wrenches, plus ratchets, extensions and other socket accessories.',
      'Choose the drive size to suit the torque: 1/4" for small fasteners, 3/8" and 1/2" for automotive and general maintenance, and 3/4" or 1" for heavy machinery and trucks. Use impact sockets, not chrome sockets, on an impact wrench, and deep sockets where the bolt stands proud of the nut. Hexagonal (6-point) sockets grip better on tight nuts, while bi-hexagonal (12-point) sockets are quicker to locate.',
      'Send the drive size, the socket sizes in mm or inch, and whether you need standard, deep or impact sockets, or the socket set you have in mind.',
    ],
    related: ['spanners-wrenches', 'workshop-equipment', 'non-sparking-tools'],
  },
  'hammers-chisels': {
    heading: 'Choosing hammers, chisels and punches',
    paragraphs: [
      'Taparia hammers include ball pein and cross pein hammers for metalwork, claw hammers for carpentry, club hammers, sledge hammers with hickory wood handles for heavy blows, machinist, electrician and fibreglass handle hammers, and soft faced hammers that won\'t mark finished surfaces.',
      'For cutting and marking there are flat and octagonal cold chisels, chisels with a rubber grip, SDS and pneumatic chisels for power tools, centre and drift punches, punch sets and leather punches, and a fibreglass handle axe.',
      'Choose a hammer by its head weight and the job, wear eye protection, and replace a chisel or punch once its head has mushroomed. Send the hammer type and head weight, or the chisel or punch size.',
    ],
    related: ['cutting-drilling-abrasives', 'non-sparking-tools', 'workshop-equipment'],
  },
  'cutting-drilling-abrasives': {
    heading: 'Choosing hacksaw blades, cutting wheels, drills and files',
    paragraphs: [
      'Taparia\'s cutting range covers hand and power tool work: hacksaw frames with carbon steel, flexible and bi-metal hacksaw blades, cut off wheels for metal, diamond blades with segmented, turbo and continuous rims for granite, tile and masonry, TCT wood cutting blades, utility knives and snap off cutters.',
      'For drilling there are HSS jobber drills in mm and inch, masonry drill bits and sets, SDS plus hammer drill bits, heavy duty SDS hammer drills, and TCT, bi-metal and deep hole saws. Files and rasps come in the usual shapes, including flat, square and knife files, with abrasive paper and velcro discs for finishing.',
      'Match the blade or wheel to the material (a fine-tooth hacksaw blade for thin tube, a coarser one for solid bar), let the tool cut without forcing it, and never run a cut off wheel faster than the speed marked on it. Send the material, the size or diameter, and the machine or frame you use.',
    ],
    related: ['hammers-chisels', 'workshop-equipment', 'pliers-cutters'],
  },
  'workshop-equipment': {
    heading: 'Choosing tool kits, vices, jacks and workshop tools',
    paragraphs: [
      'Set up or restock a workshop with Taparia tool kits (professional, plumber and two wheeler kits), tool bags and backpack tool bags, plastic and cantilever tool boxes, and tool trolleys. For holding work there are bench vices, pipe vices, C clamps, and light and heavy duty F clamps.',
      'For lifting vehicles and machinery there are hydraulic bottle jacks, hydraulic trolley jacks and jack stands. For lubrication there are lever grease guns, bucket grease pumps, hand oil pumps and rotary barrel pumps. There are also bearing pullers, spirit levels (0.5 mm and 1.0 mm accuracy, with or without a magnet), calipers, jack planes, wood chisels and hand riveters.',
      'Use a jack only on firm, level ground, and always support a raised load on stands before working under it. Tell us what the tool is for, along with the size or capacity, and we will suggest the right kit or tool.',
    ],
    related: ['spanners-wrenches', 'sockets', 'material-handling'],
  },
  'non-sparking-tools': {
    heading: 'Choosing non-sparking tools: beryllium copper or aluminium bronze',
    paragraphs: [
      'Non-sparking tools are made from copper alloys that don\'t throw sparks when they are struck or dropped, as steel tools can. They are used in hazardous areas with flammable gas, vapour or dust: refineries, petrochemical and chemical plants, gas installations, paint shops and explosives handling. The Taparia non-sparking range includes spanners and spanner sets, slugging spanners, pipe and adjustable wrenches, hammers, pliers, screwdrivers, sockets and socket sets, chisels, files, hacksaws and Allen keys.',
      'The tools come in two materials. Beryllium copper (Be-Cu) is the harder and stronger of the two, so it keeps its shape better under heavy use; aluminium bronze (Al-Br) is a lower-cost choice for general duty. Both are non-magnetic.',
      'Non-sparking tools reduce the ignition risk but don\'t remove it, so follow your site\'s hazardous area rules, keep the tools free of steel particles, and remember they are softer than steel. Send the tool type and size, and the material if your site specifies one.',
    ],
    related: ['spanners-wrenches', 'hammers-chisels', 'sockets'],
  },

  // ---------------- Lifting & material handling
  'hoists-trolleys': {
    heading: 'Choosing a chain pulley block or electric chain hoist',
    paragraphs: [
      'A chain pulley block, also called a chain block or hand chain hoist, lifts a load when you pull its hand chain, with no power needed. We supply heavy duty T series blocks from 0.5 to 50 tonnes (conforming to IS 3832) and B series blocks from 1 to 20 tonnes, both with Grade 80 alloy steel load chain, Revolve series blocks from 1 to 10 tonnes with a rotating hand chain guide, and ratchet lever hoists from 0.25 to 9 tons for lifting, pulling and tensioning.',
      'For frequent lifting, electric chain hoists come in single speed (0.5 to 10 tonnes, 3-phase supply) and dual speed (0.3 to 5 ton) versions with low-voltage pendant control, plus a heavy duty model. Geared trolleys (1 to 20 ton, for I-beams 90–210 mm wide) and electric trolleys carry a hoist along a beam. Wire rope and manila rope pulley blocks, pulling and lifting machines, cable pullers and spring balancers complete the range.',
      'Choose by the load (never lift more than the rated capacity), the lifting height and, for a trolley, the beam flange width. Inspect the chain and hooks before use, lift straight without side pull, and never stand under a suspended load. Send the capacity, the lift height and the beam size.',
    ],
    related: ['slings-rigging', 'material-handling'],
  },
  'slings-rigging': {
    heading: 'Choosing D shackles, slings and lifting hooks',
    paragraphs: [
      'Rigging hardware connects the load to the hoist or crane, so every piece is rated by its working load limit (WLL). Our galvanised, drop forged D shackles come in screw pin (0.5 to 55 t) and nut bolt (1 to 55 t) types, and bow shackles in screw pin (1 to 55 t) and nut bolt (1 to 150 t) types. A D shackle (dee shackle) is meant for a straight, in-line pull; a bow (anchor) shackle has a rounder body that takes loads from more than one direction, such as a two-leg sling.',
      'Polyester round slings (1,000 to 100,000 kg) and duplex webbing slings (1,000 to 50,000 kg, to EN 1492-1) are colour coded by WLL and gentle on finished surfaces. For chain slings there is Grade 80 alloy chain (6 to 32 mm) with G80 and G100 hooks, master links and connectors, plus eye bolts (DIN 580 and G80 rotating), turnbuckles, wire rope clamps, ratchet cargo lashing and sling protection sleeves.',
      'The WLL depends on how a sling is used (a choked hitch carries less than a straight lift), so check the label for your hitch, protect slings from sharp edges, and inspect everything before each lift. Send the load weight, the sling type and length, and the hitch or number of legs.',
    ],
    related: ['hoists-trolleys', 'material-handling'],
  },
  'material-handling': {
    heading: 'Choosing a hand pallet truck, stacker or plate lifting clamp',
    paragraphs: [
      'A hand pallet truck, or pallet jack, moves loaded pallets across a warehouse floor or onto a lorry. Our manual hand pallet trucks come in 2.5, 3 and 5 ton models with 1150–1220 mm forks. For other jobs there is a scissor lift pallet truck that raises the load to an 800 mm working height, a 1000 kg rough terrain pallet truck with pneumatic tyres for uneven ground, and hydraulic lifting tables of 500 kg and 1000 kg.',
      'To put pallets on racks, use a hand stacker (1000 or 2000 kg, lifting to 1600 mm) or an electric stacker (1500 kg, lifting to 3000 mm). Steel plate is handled with horizontal, vertical, lateral and universal plate lifting clamps (up to 16 t) or a permanent magnet lifter (100 to 5000 kg, no power needed), and drums with chain drum lifters, a drum lifter cum tilter and a hydraulic drum trolley. Machinery skates, beam and pipe clamps, wire mesh containers and a refurbished 40 ft marine container complete the range.',
      'Choose by the load, the lift height and the floor; a standard pallet truck needs a smooth, level floor. Send the load weight, the pallet size and how high you need to lift, and we will suggest the right equipment.',
    ],
    related: ['hoists-trolleys', 'slings-rigging', 'workshop-equipment'],
  },
};
