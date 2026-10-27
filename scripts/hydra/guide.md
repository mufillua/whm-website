# Hydra guide

Hand-written knowledge that Hydra learns together with the PDF catalogues when you run `npm run hydra:train`.
Edit it freely, then train again.

* `## category: <slug>` adds general notes to one of the 25 product categories. The slug must match
  `src/app/data/taxonomy.data.ts`. The fields are `what`, `uses`, `howto` and `choose`.
* `## term: <name>` adds a glossary entry ("what is a relief valve?"), with `aka`, `what`, `uses` and optionally `howto`.
* `## faq: <id>` adds a shop question. `ask:` holds the words and phrases that trigger it, separated by
  commas. `answer:` holds the reply.
* Keep everything general and true. Product sizes and specifications come from the product data and the
  catalogues, not from here. Never write prices here; Hydra always sends price questions to the team.

## category: hydraulic-ball-valves
what: High pressure ball valves open or shut off a hydraulic line with a quarter turn of the handle. 2-way valves isolate a line, while 3-way and 4-way valves divert flow between ports.
uses: Isolating pumps, filters, accumulators, gauges and actuators in hydraulic power packs, presses, machine tools, mobile equipment and test benches, and switching flow between two circuits.
howto: Use a ball valve fully open or fully closed rather than for throttling. Turn it slowly on pressurised lines, and depressurise the line before fitting or removing the valve. Choose seal material to suit the fluid and temperature.
choose: Tell our team the line size and thread (BSP, NPT, SAE or flange), the working pressure, the number of ways (2, 3 or 4) and the fluid.

## category: directional-control-valves
what: Directional control valves start, stop and change the direction of oil flow to cylinders and hydraulic motors. They can be operated by solenoid, pilot pressure, hand lever, cam or rotary knob. Modular valves stack under them to add functions without extra piping.
uses: Moving cylinders forward and back and running hydraulic motors in machine tools, presses, injection moulding machines, material handling equipment and hydraulic power packs.
howto: Mount the valve on a subplate or manifold with the matching mounting pattern (for example CETOP 3 / NG6 or CETOP 5 / NG10), use the right coil voltage, and keep the oil clean to the cleanliness level stated in the catalogue.
choose: Share the valve size or mounting pattern, the spool type or circuit, the operation (solenoid voltage AC/DC, lever, pilot), the flow and the pressure.

## category: pressure-control-valves
what: Pressure control valves limit, reduce or sequence pressure in a hydraulic circuit. They include relief valves, pressure reducing valves, sequence valves, counterbalance valves, unloading valves and pressure control modules.
uses: Protecting pumps and circuits from over-pressure (relief valves), feeding a lower-pressure branch such as clamping (reducing valves), making actuators move in order (sequence valves), and holding loads on vertical cylinders, cranes and hoists (counterbalance valves).
howto: Set the pressure gradually with a gauge fitted on the circuit, never above the maximum setting of the valve, and lock the adjustment once it is set.
choose: Tell our team the function you need, the pressure setting range, the flow, and the mounting (threaded, subplate, modular or cartridge).

## category: flow-control-valves
what: Flow control valves set the speed of cylinders and hydraulic motors by controlling how much oil passes through. Throttle-check valves control flow in one direction and let it return freely. Pressure compensated valves keep the speed steady as the load changes. Flow dividers split flow between two lines. Needle and shut-off valves allow fine adjustment or isolation.
uses: Adjusting feed speeds on machine tools and presses, synchronising actuators, and slowing or isolating lines in hydraulic power units.
howto: Start with the valve nearly closed and open it gradually while the actuator runs until you reach the speed you want. Mind the flow direction marked on the valve.
choose: Share the flow range, the pressure, the port size or mounting, and whether you need pressure compensation or a built-in check valve.

## category: check-valves
what: Check valves (non-return valves) let oil flow in one direction only. Pilot operated check valves can also be opened in reverse by pilot pressure to hold and then release a load.
uses: Stopping back-flow to pumps, holding cylinders in position, isolating accumulators, and bypassing filters or coolers.
howto: Fit the valve with the flow arrow pointing in the direction of free flow. Pilot operated versions need a pilot line connected.
choose: Tell our team the port size or mounting, the pressure, the flow and the cracking pressure you need.

## category: hydraulic-pumps
what: Hydraulic pumps turn the power of an electric motor or engine into oil flow for the hydraulic system. Vane pumps are quiet and available in fixed and variable displacement versions. Gear pumps are compact and robust.
uses: Hydraulic power packs, machine tools, presses, injection moulding machines and mobile equipment.
howto: Fill the pump with clean oil before the first start, check the direction of rotation, keep the suction line short and unrestricted, and use the filtration level the maker recommends.
choose: Share the flow (or displacement), the pressure, the speed and mounting of the motor, and the shaft type.

## category: quick-release-couplings
what: Quick release couplings (QRC) connect and disconnect hydraulic hoses quickly. Flat face couplings (ISO 16028) spill almost no oil and let little air in. ISO A couplings (ISO 7241) are a general purpose poppet type.
uses: Tractors and agricultural implements, construction and mobile machinery, hydraulic tools and jacks, test points and any line that is connected and disconnected often.
howto: Clean both faces before connecting. Couple the halves fully until the locking balls engage, and do not connect or disconnect under residual pressure unless the coupling is designed for it.
choose: Tell our team the coupling standard (flat face or ISO A), the thread type and size, and the working pressure.

## category: tube-fittings-adaptors
what: Tube fittings and adaptors join hydraulic tubes, hoses, valves and ports. They include male studs, banjo and swivel fittings, plugs and SAE flanges.
uses: Building and repairing hydraulic piping on power packs, machines and mobile equipment.
howto: Cut the tube square and deburr it. Assemble the fitting as the maker instructs and tighten it to the right torque. Over-tightening damages threads and seals.
choose: Share the tube outside diameter, the series (light or heavy), the thread type (BSP, NPT, metric) and the pressure.

## category: hydraulic-filters
what: Hydraulic filters and strainers remove dirt from the oil. Suction strainers protect the pump inlet, return-line and tank-top filters clean the oil going back to the tank, and filter indicators show when the element is clogged.
uses: Every hydraulic power pack and machine, because clean oil greatly extends the life of pumps, valves and seals.
howto: Change or clean the element when the indicator shows it is clogged, use the correct micron rating, and keep the bypass working.
choose: Tell our team the flow, the position in the circuit (suction, pressure or return), the port size and the micron rating.

## category: tank-accessories
what: Tank accessories are fitted on the hydraulic reservoir. They include level gauges and sight glasses to check the oil, air breathers and filler caps, and diffusers to calm the oil coming back to the tank.
uses: Hydraulic power packs, gearboxes and lubrication tanks.
howto: Mount level gauges vertically and check the oil level with the system stopped. Keep breathers clean so the tank can breathe without taking in dust.
choose: Share the mounting size or thread, the tank wall thickness and the length you need.

## category: pressure-gauges
what: Pressure gauges show the pressure in a line or vessel. The range includes Bourdon tube gauges in stainless steel and brass, glycerine filled gauges for pulsating pressure, diaphragm, capsule and differential gauges, and test and electric contact gauges.
uses: Process plants such as fertilisers, petrochemicals, refineries and chemicals, power plants, pulp and paper, food and pharma, refrigeration and air conditioning, compressors, and hydraulic machines and power packs.
howto: Choose a range so the normal working pressure sits around the middle of the dial. Use a glycerine filled gauge or a snubber where pressure pulsates, a syphon on steam lines, and a diaphragm seal for corrosive, viscous or hygienic media. Tighten the gauge with a spanner on its socket, never by the case.
choose: Tell our team the dial size, the pressure range and unit, the connection (thread and bottom or back entry), the medium and whether you need glycerine filling.

## category: temperature-instruments
what: Temperature instruments include bimetal and capillary thermometers (temperature gauges), thermowells that protect the sensor, and RTDs and thermocouples for electrical temperature measurement.
uses: Boilers, heat exchangers, process lines, tanks, engines and exhausts, HVAC and hydraulic oil tanks.
howto: Insert the stem far enough into the medium to read correctly, and use a thermowell where the line is pressurised or the medium is corrosive, so the instrument can be removed without draining the line.
choose: Share the temperature range, the dial size, the stem length and connection, and whether you need a thermowell.

## category: diaphragm-seals
what: Diaphragm seals (chemical seals) separate a pressure gauge or transmitter from the process medium with a flexible diaphragm.
uses: Corrosive, viscous, crystallising or hygienic media, such as chemicals, slurries, food and pharmaceutical processes, where the medium must not enter the gauge.
howto: The gauge and seal are filled and assembled as one unit. Do not unscrew the gauge from the seal, or the fill liquid is lost.
choose: Tell our team the process connection (flanged, screwed, sanitary or wafer), the medium, the pressure and temperature, and the diaphragm material.

## category: instrument-valves-accessories
what: Instrument valves and accessories connect gauges and transmitters to the process. They include needle valves, 2, 3 and 5-valve manifolds, syphons, snubbers, gauge cocks and over-pressure protectors.
uses: Isolating and venting instruments for maintenance, damping pulsation (snubbers), protecting gauges from steam (syphons), and connecting differential pressure transmitters (manifolds).
howto: Open and close needle valves gently by hand. With manifolds, follow the correct opening sequence (equalise first) to avoid over-ranging differential instruments.
choose: Share the connection size and thread, the pressure rating and the material.

## category: pliers-cutters
what: Pliers and cutters grip, bend, twist and cut wire and small parts. The range includes combination, nose and circlip pliers, VDE insulated pliers for electrical work, crimping tools, and bolt, cable and tin cutters.
uses: Electrical installation, maintenance, fitting and assembly work, and cutting wire, cable, bolts and sheet.
howto: Use VDE insulated pliers for electrical work, but always isolate the supply where possible. Do not use pliers as a hammer or on nuts (use a spanner), and cut hardened wire only with cutters rated for it.
choose: Tell our team the type of plier, the length and, for cutters, the material and size to be cut.

## category: screwdrivers-bits
what: Screwdrivers, bits and testers include flat, Phillips and Torx screwdrivers, insulated screwdrivers, screwdriver sets and bits, and line testers.
uses: Assembly, electrical and maintenance work.
howto: Match the tip type and size to the screw head so it does not slip or damage the screw. Use insulated screwdrivers for electrical work, and do not use a screwdriver as a chisel or lever.
choose: Share the tip type and size, the blade length and whether you need insulation.

## category: spanners-wrenches
what: Spanners, wrenches and keys tighten and loosen nuts, bolts and pipes. They include open-end, ring, combination and slugging spanners, pipe wrenches, torque wrenches, adjustable wrenches and Allen (hex) keys.
uses: Mechanical maintenance, plant and machinery fitting, automotive, plumbing and pipe work, and heavy bolting with slugging spanners.
howto: Use the exact size so the spanner does not slip and round off the nut. Pull rather than push, and use a torque wrench where a tightening torque is specified. Strike only spanners made for striking (slugging spanners).
choose: Tell our team the nut or bolt size (mm or inch), the spanner type and, for pipe wrenches, the pipe size.

## category: sockets
what: Sockets and socket sets fit a ratchet or wrench handle to turn nuts and bolts quickly. They come in 1/4", 3/8", 1/2", 3/4" and 1" square drives, with standard, deep and impact versions plus extensions, joints and adaptors.
uses: Automotive, machinery maintenance and assembly work, including bolts in confined or recessed places.
howto: Choose the drive size to suit the torque. Use impact sockets on impact wrenches, and seat the socket fully on the nut before turning.
choose: Share the drive size, the socket sizes (mm or inch) and whether you need standard, deep or impact sockets.

## category: hammers-chisels
what: Hammers, chisels and punches include ball pein, sledge and soft-faced hammers, cold chisels, punches and axes.
uses: Fitting, fabrication, construction, maintenance and assembly work, and marking and driving pins.
howto: Wear eye protection, keep handles tight and undamaged, and replace chisels and punches with mushroomed heads. Use soft-faced hammers on finished surfaces.
choose: Tell our team the hammer type and head weight, or the chisel or punch size.

## category: cutting-drilling-abrasives
what: Cutting, drilling and abrasive tools include hacksaw frames and blades, cut-off wheels, drills, hole saws, files and abrasive papers.
uses: Cutting metal, pipe and rod, drilling holes, and deburring and finishing in workshops, fabrication and maintenance.
howto: Match the blade teeth or wheel to the material, let the tool cut without forcing it, and wear eye protection. Never exceed the maximum speed marked on a cut-off wheel.
choose: Share the material, the size or diameter and the machine or frame you use.

## category: workshop-equipment
what: Workshop equipment and tool storage covers clamps, vices, hydraulic jacks, grease guns and oil pumps, spirit levels, tool bags, tool kits, tool boxes and tool trolleys.
uses: Workshops, maintenance departments, garages and site work.
howto: Use jacks only on firm level ground and always support a raised load with stands before working under it. Clamp work securely in a vice before cutting or filing.
choose: Tell our team what you need it for, along with the size or capacity.

## category: non-sparking-tools
what: Non-sparking tools are made of beryllium copper or aluminium bronze, so they do not create sparks when struck or dropped like steel tools can.
uses: Hazardous areas with flammable gases, vapours or dust, such as refineries, petrochemical and chemical plants, gas installations, paint shops and explosives handling.
howto: Use them like normal tools, but keep them clean of steel particles and remember they are softer than steel tools. Non-sparking tools reduce but do not remove all ignition risk, so follow your site's safety rules.
choose: Share the tool type and size, and the material if your site specifies one.

## category: hoists-trolleys
what: Hoists, trolleys and pullers lift and move loads. They include chain pulley blocks, lever hoists, electric chain hoists, beam trolleys, pulley blocks and pullers.
uses: Workshops, factories, warehouses, construction sites and maintenance work, and lifting machines, motors and materials.
howto: Never lift more than the rated capacity (SWL), inspect the chain and hooks before use, lift vertically without side pull, and never stand under a suspended load.
choose: Tell our team the load capacity, the lifting height and, for trolleys, the beam size.

## category: slings-rigging
what: Slings and rigging hardware connect a load to the hoist or crane. They include webbing and round slings, alloy chain and hooks, shackles, eye bolts, turnbuckles and lashing.
uses: Lifting and securing loads in factories, construction, shipping, logistics and maintenance.
howto: Check the working load limit (WLL) for the hitch you use, protect slings from sharp edges, inspect them before each use, and discard damaged slings and hardware.
choose: Share the load weight, the sling type and length, and the hitch or number of legs.

## category: material-handling
what: Material handling and storage covers pallet trucks, stackers, lifting tables, plate clamps, drum handling equipment, wire mesh and marine containers.
uses: Warehouses, factories, loading bays, plate and drum handling, and site storage.
howto: Stay within the rated capacity, keep loads centred and stable, and train operators before use.
choose: Tell our team the load, the lift height and how you will use it.

## faq: manufacture
ask: do you manufacture, are you manufacturer, are you a manufacturer, manufacturer, do you make, you make, factory, own brand, produce
answer: Western Hardware Mart is a supplier and stockist in Kolkata. We don't manufacture. We supply products from established brands such as Asian Hydraulic, Polyhydron, Yuken, Hydroline, Delta and Taparia, along with lifting and material handling equipment.

## faq: delivery
ask: delivery, deliver, shipping, ship, courier, dispatch, transport, outside kolkata, other city, other state, pan india, send to
answer: Our team will confirm delivery options and timelines for your location when you enquire. Message us on WhatsApp with what you need and where it should go.

## faq: payment
ask: payment, pay, gst, invoice, bill, credit, upi, bank transfer, cash
answer: For payment terms and invoicing, please speak to our team on WhatsApp or by phone. They will explain the options when they send your quote.

## faq: bulk
ask: bulk, wholesale, quantity, large order, dealer price, distributor, resell, tender, project
answer: Yes, we handle trade and bulk enquiries. Send the item list and quantities on WhatsApp or through the Get a Quote page, and our team will reply with availability and a quote.

## faq: catalogue
ask: catalogue, catalog, brochure, pdf, price list, datasheet, data sheet, drawing
answer: I've learned the product catalogues, so ask me about any product, its sizes or its uses. If you need a datasheet or drawing for a specific item, our team can help on WhatsApp.

## faq: custom
ask: custom, special, not listed, cannot find, can't find, source, sourcing, arrange, other brand, any other brand
answer: If you can't find an item, our team can usually source it for you. Send the details (brand, model or size and quantity) on WhatsApp and they will get back to you.

## faq: warranty
ask: warranty, guarantee, return, replace, replacement, refund, defect, defective, damaged
answer: Warranty and returns depend on the product and brand. Please contact our team with the product name and your invoice details and they will help.

## faq: technical
ask: which one should i, which is better, recommend, suggest, selection, help me choose, right product, suitable product
answer: Tell me what the product is for and the size or pressure you need, and I'll show matching products. Our team can also help you choose. Send the application details on WhatsApp.

## faq: visit
ask: visit, come to shop, walk in, showroom, meet, office
answer: You're welcome to visit our shop at Basundra Tower, 22 Netaji Subhas Road, Kolkata. It's best to message us first so we can keep your items ready.

## faq: repair
ask: repair, service, servicing, refurbish, calibration, calibrate, overhaul
answer: Diaphragm seal repair and refurbishment is part of our range. For other repairs or calibration, ask our team on WhatsApp and they will tell you what's possible.

## term: relief valve
aka: pressure relief valve, relief valves, pressure relief valves, relieving valve
what: A relief valve limits the maximum pressure in a hydraulic circuit. When the pressure reaches its setting, it opens and sends oil back to the tank, which protects the pump, hoses and components.
uses: Every hydraulic power pack (usually just after the pump) and any circuit that needs a pressure limit.
howto: Fit a pressure gauge on the line, start from a low setting and raise it slowly to the pressure you need, staying below the rating of the weakest component. Then lock the adjuster.

## term: pressure reducing valve
aka: reducing valve, reducing valves, pressure reducing valves, pressure regulator valve
what: A pressure reducing valve keeps a lower, steady pressure in one branch of a circuit, even when the main system pressure is higher. It is normally open and closes as the outlet pressure reaches its setting.
uses: Clamping and gripping circuits, pilot supplies, and any branch that must work at a lower pressure than the pump.

## term: sequence valve
aka: sequence valves, sequencing valve
what: A sequence valve makes actuators move in a set order. It opens the second circuit only after the pressure in the first circuit reaches its setting.
uses: Clamp-then-work sequences on machine tools and presses, and other step-by-step operations.

## term: counterbalance valve
aka: counter balance valve, counterbalance valves, load holding valve, load holding valves
what: A counterbalance valve holds a load in place and stops it from running away while it is being lowered. Oil flows freely into the cylinder, but can only flow out once the set pressure (or pilot pressure) is reached.
uses: Vertical cylinders, cranes, hoists, booms, platforms and presses — anywhere a suspended load must be held and lowered under control.

## term: unloading valve
aka: unloader valve, unloading valves
what: An unloading valve sends a pump's flow back to the tank at low pressure once the system reaches a set pressure. This saves power and reduces heat.
uses: Hi-Lo (double pump) systems and accumulator circuits.

## term: check valve
aka: non return valve, check valves, nrv, one way valve
what: A check valve lets oil flow in one direction only and blocks flow in the reverse direction.
uses: Preventing back-flow to the pump, isolating accumulators, and bypassing filters or coolers.

## term: pilot operated check valve
aka: pilot check valve, pilot operated check valves, lock valve, hydraulic lock
what: A pilot operated check valve works like a check valve, but pilot pressure can open it in reverse. It holds a cylinder in position and releases it when commanded.
uses: Holding cylinders in position on clamps, lifts, presses and similar equipment.

## term: directional control valve
aka: direction control valve, directional valve, directional control valves, dcv, spool valve
what: A directional control valve starts, stops and changes the direction of oil flow, so a cylinder extends or retracts and a motor turns one way or the other. It can be operated by a solenoid, lever, pilot pressure, cam or knob.
uses: Controlling cylinders and hydraulic motors on machines, presses and power packs.

## term: solenoid valve
aka: solenoid operated valve, solenoid valves, solenoid operated directional valve
what: A solenoid operated valve is a directional control valve switched electrically by a solenoid coil (AC or DC), so a PLC, switch or relay can control it.
uses: Automated machines and power packs where the valves are switched from a control panel.

## term: modular valve
aka: sandwich valve, stack valve, modular valves
what: Modular (sandwich) valves stack between a directional valve and its subplate. They add functions such as pressure relief, flow control or check valves without extra piping.
uses: Compact manifolds on power packs and machine hydraulics.

## term: flow control valve
aka: flow control valves, speed control valve, fcv
what: A flow control valve sets how much oil passes through, and so sets the speed of a cylinder or motor. Pressure compensated versions keep the speed steady even when the load changes.
uses: Controlling feed speed on machine tools and presses, and any actuator that needs an adjustable speed.

## term: throttle check valve
aka: throttle valve, throttle check valves, one way flow control valve
what: A throttle check valve restricts the flow in one direction and lets it pass freely in the other, so an actuator can be slowed one way only (meter-in or meter-out).
uses: Adjusting the extend or retract speed of a cylinder.

## term: needle valve
aka: needle valves
what: A needle valve uses a fine tapered needle to open or close a passage very gradually, for precise flow adjustment or isolation.
uses: Fine flow adjustment in hydraulic lines, and isolating gauges and instruments.

## term: flow divider
aka: flow dividers, flow divider valve
what: A flow divider splits the incoming flow into two (usually equal) outlet flows, whatever the pressure at each outlet.
uses: Running two cylinders or motors at the same speed, for example for synchronised lifting.

## term: ball valve
aka: ball valves, high pressure ball valve
what: A ball valve opens or closes a line with a quarter turn of its handle, using a ball with a hole through it. High pressure hydraulic ball valves are built for pressures of several hundred bar.
uses: Isolating lines, pumps, accumulators and gauges. 3-way versions switch flow between two circuits.

## term: vane pump
aka: vane pumps
what: A vane pump moves oil with sliding vanes in a rotor. It runs quietly and is available in fixed and variable displacement versions.
uses: Machine tools, injection moulding machines and industrial power packs.

## term: gear pump
aka: gear pumps
what: A gear pump moves oil between the teeth of two meshing gears. It is compact, robust and economical.
uses: Mobile equipment, small power packs, lubrication and general hydraulics.

## term: flat face coupling
aka: flat face, flat face couplings, flat face qrc, flat face quick release coupling, iso 16028
what: A flat face quick release coupling (ISO 16028) has flat mating faces. It spills almost no oil when disconnected and lets very little dirt or air in.
uses: Construction and agricultural machinery, hydraulic attachments and tools — wherever hoses are connected and disconnected often in dirty conditions.

## term: iso a coupling
aka: iso a, iso a couplings, iso 7241, poppet coupling, poppet type coupling
what: An ISO A coupling (ISO 7241 Series A) is a general purpose poppet type quick release coupling with a ball lock.
uses: General hydraulics and agricultural, mobile and construction equipment.

## term: quick release coupling
aka: quick release couplings, qrc, quick coupling, quick couplings, quick disconnect coupling, qdc
what: A quick release coupling (QRC) lets you connect and disconnect a hydraulic hose by hand, without tools, while the valves inside each half stop the oil from escaping.
uses: Tractors and implements, construction machines, hydraulic tools and jacks, and test points.

## term: glycerine filled gauge
aka: glycerin filled gauge, glycerine filled pressure gauge, liquid filled gauge, oil filled gauge
what: A glycerine filled gauge has its case filled with glycerine. The liquid damps the pointer and internal parts, so the gauge stays readable and lasts longer under vibration and pulsating pressure.
uses: Hydraulic systems, pumps, compressors and machines that vibrate.

## term: differential pressure gauge
aka: differential pressure gauges, dp gauge
what: A differential pressure gauge shows the difference between two pressures.
uses: Monitoring how clogged a filter is, flow measurement and level measurement.

## term: thermowell
aka: thermowells, thermo well
what: A thermowell is a protective tube fitted into a pipe or vessel, so a thermometer or sensor can be inserted and removed without draining the line.
uses: Pressurised, fast-flowing or corrosive process lines.

## term: rtd
aka: resistance temperature detector, pt100, pt 100
what: An RTD (resistance temperature detector, such as a Pt100) measures temperature from the change in electrical resistance of a platinum element.
uses: Accurate temperature measurement with transmitters and controllers.

## term: thermocouple
aka: thermocouples
what: A thermocouple measures temperature from the small voltage produced where two different metals are joined. It covers a wide range, including very high temperatures.
uses: Furnaces, kilns, exhausts, boilers and process heating.

## term: snubber
aka: snubbers, pulsation dampener
what: A snubber damps pressure pulsations and spikes before they reach a gauge.
uses: Pumps and lines with pulsating pressure.

## term: syphon
aka: siphon, syphon tube, pigtail syphon
what: A syphon (pigtail) is a coiled tube that holds condensate, protecting a pressure gauge from live steam.
uses: Steam lines and hot vapour.

## term: instrument manifold
aka: valve manifold, 2 valve manifold, 3 valve manifold, 5 valve manifold
what: An instrument valve manifold mounts on a pressure or differential pressure transmitter. It is used to isolate, equalise and vent the transmitter for calibration or maintenance.
uses: Pressure and flow transmitter installations.

## term: chain pulley block
aka: chain block, chain pulley blocks, manual chain hoist, chain hoist
what: A chain pulley block is a manual hoist. Pulling the hand chain lifts the load through a gear reduction, so one person can lift heavy loads.
uses: Workshops, maintenance, construction, and lifting machines and motors.
howto: Hang it from a support rated for the load, check the chain is not twisted, and lift straight up by pulling the hand chain steadily. Never exceed the rated capacity, never lift people, and never stand under the load.

## term: lever hoist
aka: ratchet lever hoist, lever block, come along
what: A lever hoist lifts, pulls or tensions loads when its ratchet lever is worked back and forth. It can be used in any direction, including horizontally.
uses: Pulling, positioning and tensioning loads in maintenance and rigging.

## term: shackle
aka: shackles, d shackle, bow shackle, dee shackle
what: A shackle is a U-shaped metal link closed with a pin. It connects slings, chains and hooks in lifting and rigging.
uses: Lifting and rigging connections.

## term: vde pliers
aka: insulated pliers, vde plier, electrician pliers
what: VDE pliers have insulated handles that are made and tested for working on electrical installations.
uses: Electrical installation and maintenance work.

## term: slugging spanner
aka: striking spanner, hammer spanner, slugging spanners
what: A slugging (striking) spanner has a heavy head and a striking face, so it can be hit with a hammer to loosen or tighten large, tight nuts and bolts.
uses: Heavy bolting on flanges, plant and structural work.

## term: torque wrench
aka: torque wrenches, torque spanner
what: A torque wrench tightens nuts and bolts to a set torque, so joints are neither too loose nor over-tightened.
uses: Automotive work, flange bolting and assembly work where a torque is specified.
howto: Set the required torque on the scale, then pull the handle smoothly at a right angle until it clicks or reaches the reading. Stop as soon as it clicks, don't use it to loosen seized nuts, and wind a click-type wrench back to its lowest setting after use.

## term: pallet truck
aka: hand pallet truck, pallet jack, hand pallet
what: A hand pallet truck lifts a pallet just off the floor with a hydraulic pump handle so it can be moved by hand.
uses: Warehouses, stores and loading bays.

## term: stacker
aka: hand stacker, stackers, pallet stacker
what: A stacker lifts pallets and loads to height so they can be stacked on racks.
uses: Warehouses and stores with racking.
