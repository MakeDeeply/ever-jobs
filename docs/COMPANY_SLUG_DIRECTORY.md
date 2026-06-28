# Company Slug Directory

> A curated list of verified company slugs organized by ATS platform. Use these with the `companySlug` parameter to search jobs at specific companies.

**Last Updated:** 2026-06-28

---

## Usage

```bash
# Search Greenhouse jobs for Stripe
curl -X POST http://localhost:3001/api/jobs/search \
  -H 'Content-Type: application/json' \
  -d '{"companySlug": "stripe", "siteType": ["greenhouse"]}'

# Search all ATS platforms for Spotify (auto-detect)
curl -X POST http://localhost:3001/api/jobs/search \
  -H 'Content-Type: application/json' \
  -d '{"companySlug": "spotify"}'

# CLI usage
npm run cli -- search --company-slug stripe --site greenhouse
```

When `companySlug` is provided without `siteType`, all 41 ATS scrapers run concurrently and return results from whichever platform the company uses.

---

## Greenhouse

Greenhouse slugs are the subdomain used in `boards.greenhouse.io/{slug}`.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| AccuWeather Careers | `accuweather` | Private-Sector Weather Forecasting |
| ACI Learning | `acilearning` | IT Certification Training / Audit Education |
| Ackermann Group | `ackermanngroup` | Multi-Family / Commercial Real-Estate-Services |
| ACLU - National Office | `aclu` | Civil-Liberties Advocacy / Constitutional Litigation |
| American College of Obstetricians and Gynecologists | `acog` | Medical-Specialty Membership Society / Women's-Health Clinical Guidance |
| aCommerce | `acommerce` | Southeast-Asia E-commerce Enablement / Brand-Fulfilment |
| Academy with Community Partners | `acp` | Arizona Online Instruction Charter-School / Alternative-Curriculum K-12 Education |
| Acquia | `acquia` | Drupal-based Enterprise DXP / Open-Source-Cloud Digital Experience Platform |
| Acrisure Innovation | `acrisureinnovation` | Insurance-Brokerage Innovation Unit / AI- and Data-Driven Broker Products |
| Acryl Data (DataHub) | `acryldata` | Enterprise Metadata-Platform / Steward of Open-Source DataHub |
| Acumen | `acumen` | Impact-Investing Nonprofit / Patient-Capital Social-Enterprise Fund + Acumen Academy Leadership Development |
| Acurus Solutions Private Limited | `acurussolutions` | Healthcare Revenue-Cycle-Management (RCM) Outsourcing / U.S. Hospital + Physician-Group BPO (Bengaluru-HQ) |
| Adaptive Biotechnologies | `adaptivebiotechnologies` | Commercial Immunosequencing Platform / immunoSEQ + clonoSEQ MRD Diagnostics (Seattle-HQ, NASDAQ: ADPT) |
| Airbnb | `airbnb` | Travel / Tech |
| Spotify | `spotify` | Music / Tech |
| Discord | `discord` | Social / Tech |
| SpaceX | `spacex` | Aerospace |
| Cloudflare | `cloudflare` | Infrastructure |
| Twilio | `twilio` | Communications |
| Databricks | `databricks` | Data / AI |
| Datadog | `datadog` | Monitoring |
| MongoDB | `mongodb` | Database |
| Elastic | `elastic` | Search / Analytics |
| Snowflake | `snowflakeinc` | Data Cloud |
| Roblox | `roblox` | Gaming |
| Unity | `unity3d` | Gaming / 3D |
| Shopify | `shopify` | E-commerce |
| Canva | `canva` | Design |
| Pinterest | `pinterest` | Social / Tech |
| Lyft | `lyft` | Transportation |
| DoorDash | `doordash` | Delivery |
| Instacart | `instacart` | Grocery / Delivery |
| Snap | `snap` | Social / Tech |
| Rivian | `rivian` | Electric Vehicles |
| Lucid Motors | `lucidmotors` | Electric Vehicles |
| Block (Square) | `block` | Fintech |
| Notion | `notion` | Productivity |
| Stripe | `stripe` | Payments |
| Coinbase | `coinbase` | Crypto / Finance |
| HubSpot | `hubspot` | Marketing / CRM |
| Plaid | `plaid` | Fintech |
| 10Alabs | `10alabs` | — |
| Alixpartners | `alixpartners` | — |
| Arlosolutionsllc | `arlosolutionsllc` | — |
| Bigid | `bigid` | — |
| Cadencesolutions | `cadencesolutions` | — |
| Clevelandguardiansbops | `clevelandguardiansbops` | — |
| Danieloconnellssons | `danieloconnellssons` | — |
| Effectual | `effectual` | — |
| Fastly | `fastly` | — |
| Garnerhealth | `garnerhealth` | — |
| Guild | `guild` | — |
| Iherb | `iherb` | — |
| Juvare | `juvare` | — |
| Lightningai | `lightningai` | — |
| Meridianpartners | `meridianpartners` | — |
| Nationallifeinsurancecompany | `nationallifeinsurancecompany` | — |
| Olly | `olly` | — |
| Penninteractive | `penninteractive` | — |
| Qualia | `qualia` | — |
| Royalvet | `royalvet` | — |
| Simula | `simula` | — |
| Stemhealthcare | `stemhealthcare` | — |
| Thatlot | `thatlot` | — |
| Twitch | `twitch` | — |
| Vulcanelements | `vulcanelements` | — |
| Cresta | `cresta` | AI Contact Center |
| Samsara | `samsara` | Connected Operations / IoT |
| Sezzle | `sezzle` | BNPL Payments / Fintech |
| Shopmonkey | `shopmonkey` | Vertical-SaaS Auto-Repair-Shop POS |
| SimpliSafe | `simplisafe` | DIY Wireless Home Security |
| Symphony Communication Services | `symphony` | Institutional Encrypted Collaboration |
| Tatari | `tatari` | Streaming-and-Linear-TV Connected Attribution |
| Textio | `textio` | Augmented-Writing / HR-Language-AI |
| Nubank | `nubank` | Fintech / Neobank |
| CookUnity | `cookunity` | Food-tech / Meal delivery |
| Oklo | `oklo` | Energy / Advanced nuclear |
| Fetch | `fetch` | Consumer / Loyalty & rewards |
| Zocdoc | `zocdoc` | Health-tech / Marketplace |
| Thunes | `thunes` | Fintech / Payments |
| Strive Health | `strivehealth` | Health-tech / Value-based care |
| Home Chef | `homechef` | Food-tech / Meal kits |
| Pacific Fusion | `pacificfusion` | Energy / Fusion |
| Otter.ai | `otterai` | AI / Productivity |
| Observe.AI | `observeai` | AI / Contact center |
| Honor | `honor` | Health-tech / Home care |
| Weee! | `weee` | E-commerce / Grocery |
| Narvar | `narvar` | E-commerce / Logistics SaaS |
| Transcarent | `transcarent` | Health-tech / Navigation |
| Watershed Informatics | `watershed` | Bio-tech / Computational biology |
| Quaise Energy | `quaise` | Energy / Geothermal |
| Upside | `upside` | Consumer / Retail tech |
| Hungryroot | `hungryroot` | Food-tech / Grocery |
| Nayya | `nayya` | Insurtech / Benefits |
| Caribou Financial | `caribou` | Fintech / Lending |
| HealthJoy | `healthjoy` | Health-tech / Benefits |
| Papa | `papa` | Health-tech / Care |
| AIR COMPANY | `aircompany` | Climate Tech / Carbon Conversion & Synthetic Fuels |
| Arbor Energy | `arborenergy` | Climate Tech / Carbon-Negative Power (BECCS) |
| Aurora Innovation | `aurorainnovation` | Autonomous Vehicles / Self-Driving Trucking |
| EarnIn | `earnin` | Fintech / Earned-Wage Access |
| Faraday Future | `faradayfuture` | Automotive / Electric Vehicles |
| FastSpring | `fastspring` | Fintech / Merchant-of-Record Commerce & Subscription Billing |
| Gravity R&D | `gravity` | AdTech / Recommendation & Personalization Software |
| Runwise | `runwise` | Climate Tech / Smart Building Energy Management |
| SES AI | `sesai` | Battery Technology / EV Energy Storage (Li-Metal) |
| Solaris | `solarisbank` | Fintech / Banking-as-a-Service (Embedded Finance) |
| Stack AV | `stackav` | Autonomous Vehicles / Self-Driving Trucking |
| tastytrade | `tastytrade` | Fintech / Online Brokerage (Options & Futures Trading) |
| Torc Robotics | `torcrobotics` | Autonomous Vehicles / Self-Driving Trucking |
| Ursa Major | `ursamajor` | Aerospace & Defense / Rocket Propulsion |
| Via | `via` | TransitTech / Mobility Software (SaaS + Operations) |
| Zuora | `zuora` | Enterprise SaaS / Subscription Billing & Quote-to-Cash |

---
| Accela | `accela` | Govtech (government permitting/licensing SaaS) |
| AEVEX Aerospace | `aevexaerospace` | Defense aerospace (UAS, ISR, full-spectrum) |
| Akaysha Energy | `akayshaenergy` | Grid/storage / grid-scale battery storage |
| Anduril Industries | `andurilindustries` | Defense technology (autonomous systems, C2, counter-UAS) |
| Armis | `armissecurity` | Asset/IoT security |
| At-Bay | `atbayjobs` | Cyber insurance / security |
| Atomic Machines | `atomicmachines` | Robotics, industrial automation, warehouse/manufacturing automation |
| Augury | `augury` | Industrial IoT / machine-health sensors |
| Aura | `aura` | Consumer identity / fraud protection |
| Avantus | `avantus` | Clean energy / utility-scale solar & storage |
| Avride | `avride` | Robotics, industrial automation, warehouse/manufacturing automation |
| Axonius | `axonius` | Cyber asset attack surface management |
| Beam Therapeutics | `beamtherapeutics` | Gene editing |
| Blockchain.com | `blockchain` | Fintech — crypto wallet / exchange |
| Bot Auto | `botauto` | Autonomous trucking |
| BuildOps | `buildops` | Construction tech (commercial contractor management software) |
| C3 AI | `c3iot` | Enterprise applied AI applications |
| Cabify | `cabify` | Ride-hailing / mobility platform |
| Cargomatic | `cargomatic` | Drayage / digital freight marketplace |
| Censys | `censys` | Security data / applied AI platform |
| CharterUP | `charterup` | Group transportation / charter mobility platform |
| Checkbook | `checkbook` | Fintech — digital payments / disbursements |
| CodePath | `codepath` | Edtech / tech career upskilling |
| Cognitiv | `cognitiv` | Adtech (AI/deep-learning ads) |
| Collibra | `collibra` | Compliance / data governance |
| Colossal Biosciences | `colossalbiosciences` | Genomics / synthetic biology |
| Customer.io | `customerio` | Martech (marketing automation/messaging) |
| Cypress Creek Renewables | `cypresscreekrenewables` | Clean energy / utility-scale solar & storage |
| Daybreak Game Company | `daybreakgames` | Gaming studios / interactive entertainment |
| dbt Labs | `dbtlabsinc` | Data transformation / analytics engineering platform |
| Dealpath | `dealpath` | Proptech / commercial real estate (deal management & investment platform) |
| Defense Unicorns | `defenseunicorns` | Defense software (mission infrastructure/DevSecOps) |
| Digital Extremes | `digitalextremes` | Gaming studios / interactive entertainment |
| Dorsia | `dorsia` | Restaurant tech |
| Easyship | `easyship` | E-commerce enablement (shipping/fulfillment SaaS) |
| Eleventh Hour Games | `eleventhhourgames` | Gaming studios / interactive entertainment |
| EMARKETER | `emarketer` | Martech/media (marketing research) |
| emnify | `emnify` | IoT connectivity / cellular hardware-SIM platform |
| Energy Solutions | `energysolutions` | Clean energy / efficiency & decarbonization services |
| Esusu | `esusu` | Fintech — rent reporting / credit building / consumer payments |
| Exiger | `exiger` | Regtech (supply-chain risk / AML / compliance) |
| ExtraHop | `extrahopnetworks` | Network detection & response |
| Federato | `federato` | Insurtech and insurance technology |
| Feedzai | `feedzai` | Regtech (fraud / AML) |
| Fieldwire | `fieldwire` | Construction tech (jobsite field management & coordination software) |
| Flashfood | `flashfood` | Foodtech / food waste |
| Fleetio | `fleetio` | Fleet management software / logistics |
| Forbes | `forbes` | Media (publishing) |
| Forter | `forter` | Fraud prevention / risk |
| Freeform | `freeformfuturecorp` | Aerospace & defense metal additive manufacturing |
| Galvanize Climate Solutions | `galvanizeclimatesolutions` | Climate tech / climate investment firm |
| Gatik AI | `gatikaiinc` | Robotics, industrial automation, warehouse/manufacturing automation |
| Glean | `gleanwork` | Enterprise AI search & assistant (applied AI) |
| GlossGenius | `glossgenius` | Fintech — embedded payments / SMB platform |
| Goodway Group | `goodwaygroup` | Adtech/martech (digital media agency) |
| Gotion | `gotion` | Grid/storage / EV & energy-storage lithium batteries |
| GovTech Singapore (Government Technology Agency) | `govtech` | Govtech (government digital services) |
| Ghost Story Games | `gsgcareers` | Gaming studios / interactive entertainment |
| Hanwha Renewables | `hanwharenewables` | Clean energy / utility-scale solar & storage |
| Herald | `heraldapi` | Insurtech and insurance technology |
| Homeward | `homeward` | Real estate tech (cash-offer home buying) |
| Hyliion | `hyliion` | Electrified powertrain / clean transport |
| Hyperproof | `hyperproof` | Compliance / GRC (security compliance) |
| ID.me | `idme` | Identity verification / fraud |
| InCharge Energy | `inchargeenergy` | Clean energy / fleet EV charging infrastructure |
| Innovid | `innovid` | Adtech (ad serving/CTV) |
| Instawork | `instawork` | Workforce management - hourly / flexible staffing marketplace |
| Intrinsic | `intrinsicrobotics` | Robotics, industrial automation, warehouse/manufacturing automation |
| Integrated Specialty Coverages | `isccareers` | Insurtech and insurance technology |
| ITS Logistics | `itslogisticsllc` | 3PL / freight / warehousing |
| K2 Space | `k2spacecorporation` | Satellites (large GEO/MEO buses) |
| Kasa | `kasa` | Proptech / real estate (tech-enabled hospitality & flexible accommodations) |
| KH Aerospace | `khaerospace` | Aerospace & defense (UAS manufacturing/training) |
| KnowBe4 | `knowbe4` | Compliance / security awareness training |
| Legion Technologies | `legion` | Workforce management software (scheduling / labor) |
| LogicGate | `logicgate` | Compliance / GRC (risk management) |
| Mark43 | `mark43` | Govtech / public safety (police RMS/CAD) |
| Matic Insurance | `matic` | Insurtech and insurance technology |
| May Mobility | `maymobility` | Autonomous vehicles / mobility |
| mediasmart | `mediasmart` | Adtech (omnichannel/CTV/DOOH DSP) |
| Metropolis Technologies | `metropolis` | Proptech / real estate (AI computer-vision parking & mobility platform) |
| MobilityWare | `mobilityware` | Mobile gaming / interactive entertainment |
| Modernize Home Services | `modernize` | Proptech / home services (home improvement lead generation) |
| MrBeast (Beast Industries) | `mrbeastyoutube` | Creator economy (media/YouTube) |
| Nabis | `nabis` | Distribution / last-mile delivery |
| NPR (National Public Radio) | `nationalpublicradioinc` | Media/streaming (public radio/podcasts) |
| Neon Aerospace | `neonaerospace` | Aerospace (autonomous flight / propulsion) |
| Neros Technologies | `nerostechnologies` | Robotics, industrial automation, warehouse/manufacturing automation |
| New Leaf Energy | `newleafenergy` | Clean energy / solar & storage development |
| Nex | `nex` | Gaming studios / interactive entertainment (motion gaming) |
| Next Insurance | `nextinsurance66` | Insurtech and insurance technology |
| Nimble Robotics | `nimblerobotics` | Robotics, industrial automation, warehouse/manufacturing automation |
| NMI | `nmi` | Fintech — payments gateway / embedded payments |
| Northspyre | `northspyre` | Proptech / real estate (development project & cost management software) |
| Nothing | `nothing` | Consumer electronics (smartphones, earbuds) |
| OneTrust | `onetrust` | Data privacy, security & governance |
| OpenSpace | `openspace` | Construction tech (AI jobsite capture & reality mapping) |
| OpenTable | `opentable` | Restaurant tech |
| Veo | `operationscareers` | Shared micromobility (bikes/scooters) |
| Orca Security | `orcasecurity` | Cloud security (CNAPP) |
| Origis Energy | `origisenergy` | Clean energy / utility-scale solar & storage |
| Osano | `osano` | Compliance / data privacy |
| Pacvue | `pacvue` | E-commerce enablement / retail media SaaS |
| Palmetto Clean Technology | `palmettocleantech` | Clean energy / residential solar platform |
| Pathward | `pathward` | Fintech — banking-as-a-service / sponsor bank |
| PayNearMe | `paynearmeinc` | Fintech — bill pay / payments platform |
| Payoneer | `payoneer` | Fintech — cross-border payments |
| Pixability | `pixability` | Adtech (YouTube/CTV video ads) |
| Plus Power | `pluspower` | Grid/storage / standalone battery storage developer |
| The Pokémon Company International | `pokemoncareers` | Gaming / interactive entertainment / esports |
| Prime Medicine | `primemedicine` | Gene editing |
| PubMatic | `pubmatic` | Adtech (SSP) |
| Qualia | `qualia` | Real estate tech (digital closing / title & escrow platform) |
| Razorpay | `razorpaysoftwareprivatelimited` | Fintech — payments gateway / banking-as-a-service |
| Recorded Future | `recordedfuture` | Threat intelligence |
| Renaissance Learning | `renaissancelearning-nam` | Edtech / pre-K-12 assessment & learning |
| Riskified | `riskified` | Fraud prevention / e-commerce risk |
| Rithum | `rithum` | E-commerce enablement / commerce network SaaS |
| Rocket Lawyer | `rocketlawyer` | Legaltech (online legal services) |
| Roku | `roku` | Media/streaming (CTV platform) |
| Sana Biotechnology | `sanabiotech` | Cell & gene therapy |
| Sayari | `sayari` | Regtech (corporate risk intelligence / AML) |
| Scout AI | `scoutai` | Defense robotics / autonomous drones |
| SecurityScorecard | `securityscorecard` | Compliance / cyber risk ratings |
| SeekOut | `seekout` | Recruiting tech - talent sourcing & talent intelligence AI |
| Seoul Robotics | `seoulrobotics` | Robotics, industrial automation, warehouse/manufacturing automation |
| Shift Technology | `shifttechnology` | Insurtech and insurance technology |
| ShipBob | `shipbobinc` | Fulfillment / 3PL |
| ShipMonk | `shipmonk` | Fulfillment / 3PL |
| Skillsoft | `skillsoft` | HR tech - corporate learning & talent development |
| SmartRent | `smartrent` | Proptech (smart home & access automation for rental communities) |
| Snorkel AI | `snorkelai` | Data-centric AI / data development platform |
| Sol de Janeiro | `soldejaneiro` | DTC beauty brand |
| PlayStation (Sony Interactive Entertainment) | `sonyinteractiveentertainmentglobal` | Gaming / interactive entertainment |
| Speechify | `speechify` | Edtech / assistive learning (text-to-speech) |
| Spin | `spin` | Shared micromobility (e-scooters) |
| Splice | `splice` | Creator economy (music creation platform) |
| SpotHopper | `spothopper` | Restaurant tech |
| StackAdapt | `stackadapt` | Adtech (programmatic DSP) |
| Starface World | `starfaceworld` | DTC beauty/skincare brand |
| Stoke Space | `stokespacetechnologies` | Space launch (reusable rockets) |
| Strand Therapeutics | `strandtherapeutics` | mRNA / synthetic biology |
| Sumo Logic | `sumologic` | Security analytics (SIEM) |
| Take-Two Interactive | `taketwo` | Gaming studios / interactive entertainment |
| Tebra | `tebra` | Digital health (practice & telehealth software) |
| TEGNA | `tegnainc` | Media/streaming (broadcast TV) |
| Tenable | `tenableinc` | Vulnerability & exposure management |
| Terran Orbital | `terranorbitalcorporation` | Satellites (small-sat manufacturing) |
| Tessera Therapeutics | `tesseratherapeutics` | Gene editing / genomics |
| Dutchie | `thedutchie` | Retail tech (POS + e-commerce platform) |
| The New York Times | `thenewyorktimes` | Media (news publishing) |
| The Trade Desk | `thetradedesk` | Adtech (DSP) |
| Third Wave Automation | `thirdwaveautomation` | Robotics, industrial automation, warehouse/manufacturing automation |
| Too Good To Go | `toogoodtogo` | Foodtech / food waste |
| Toradex | `toradex` | Embedded computing / IoT modules (SoMs) |
| Transmit Security | `transmitsecurity` | Identity / fraud & CIAM |
| True Anomaly | `trueanomalyinc` | Space defense / space domain awareness |
| Picnic Delivery | `try-picnic` | Foodtech / food delivery |
| Uber Freight | `uberfreight` | Freight marketplace / brokerage |
| Unqork | `unqork` | Insurtech and insurance technology |
| Varda Space Industries | `vardaspace` | Space (in-orbit manufacturing, reentry capsules) |
| Verra Mobility | `verramobility` | Smart transportation / mobility tech |
| Viant Technology | `vianttechnology` | Adtech (omnichannel DSP) |
| Viral Nation | `viralnation` | Creator economy (influencer marketing) |
| Vox Media | `voxmedia` | Media/streaming (digital publisher) |
| VTS | `vts` | Proptech / commercial real estate (leasing & asset management platform) |
| Wildlife Studios | `wildlifestudios` | Mobile gaming / interactive entertainment |
| Wiz | `wizinc` | Cloud security (CNAPP) |
| Wurl | `wurljobs` | Media/streaming + adtech (CTV distribution) |
| Zynga | `zyngacareers` | Mobile gaming / interactive entertainment |

## Workday

Workday slugs follow the pattern `{company}:{tenant}:{careerSite}`. The format varies by deployment.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| Salesforce | `salesforce:12:External` | CRM / Cloud |
| Intel | `intel:1:External` | Semiconductors |
| Cisco | `cisco:5:Cisco_External` | Networking |
| Adobe | `adobe:5:External` | Software |
| Epic Games | `epicgames:5:EpicExternalSite` | Gaming |
| Warner Bros | `warnerbros:5:WarnerBros` | Entertainment |
| Disney | `disney:5:disneycareer` | Entertainment |
| Deloitte | `deloitte:5:DeloitteUSCareers` | Consulting |
| McKinsey | `mckinsey:5:External` | Consulting |
| Tesla | `tesla:5:Tesla` | EV / Energy |
| Qualcomm | `qualcomm:5:External` | Semiconductors |
| AMD | `amd:5:External` | Semiconductors |
| Broadcom | `broadcom:5:External` | Semiconductors |
| Samsung | `samsung:3:Global` | Electronics |
| Siemens | `siemens:3:External` | Industrial |
| Lockheed Martin | `lmco:5:LMCareers` | Aerospace / Defense |

---

## Lever

Lever slugs are the subdomain at `jobs.lever.co/{slug}`.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| Palantir | `palantir` | Data Analytics / Defense |
| Netflix | `netflix` | Streaming |
| Atlassian | `atlassian` | Developer Tools |
| Eventbrite | `eventbrite` | Events |
| KPMG | `kpmg` | Consulting |
| 100Ms | `100ms` | — |
| Allegiantair | `allegiantair` | — |
| Asapp 2 | `asapp-2` | — |
| Blablacar | `blablacar` | — |
| Cartrawler | `cartrawler` | — |
| Coinmarketcap | `coinmarketcap` | — |
| Deepsky | `deepsky` | — |
| Ekohealth | `ekohealth` | — |
| Findhelp | `findhelp` | — |
| Glass Health Inc | `glass-health-inc` | — |
| Hivemapper | `hivemapper` | — |
| Jamcity | `jamcity` | — |
| Lamudi | `lamudi` | — |
| Madhappy | `madhappy` | — |
| Monkshillventures | `monkshillventures` | — |
| Numeris | `numeris` | — |
| Peoplegrove | `peoplegrove` | — |
| Princesspolly | `princesspolly` | — |
| Redwoodcu | `redwoodcu` | — |
| Sandboxvr | `sandboxvr` | — |
| Snappr | `snappr` | — |
| Sure | `sure` | — |
| Thrivecausemetics | `thrivecausemetics` | — |
| Unusual | `unusual` | — |
| Waveapps | `waveapps` | — |

---

## Ashby

Ashby slugs are used in `jobs.ashbyhq.com/{slug}`.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| OpenAI | `openai` | AI |
| Ramp | `ramp` | Fintech |
| Figma | `figma` | Design |
| Linear | `linear` | Developer Tools |
| Vercel | `vercel` | Developer Tools |
| Plaid | `plaid` | Fintech |
| Retool | `retool` | Developer Tools |
| Notion | `notion` | Productivity |

---

## Taleo

Taleo slugs follow the pattern `{company}:{careerSection}`.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| Oracle | `oracle:ORACLEEXT` | Enterprise Software |
| JPMorgan Chase | `jpmorganchase:ExternalCareerSite` | Banking |
| PepsiCo | `pepsico:ExternalSite` | Consumer Goods |

---

## iCIMS

iCIMS slugs are typically company identifiers found in the career page URL.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| EA (Electronic Arts) | `ea` | Gaming |
| Take-Two Interactive | `take2games` | Gaming |
| Goldman Sachs | `goldmansachs` | Banking |
| UPS | `ups` | Logistics |

---

## SmartRecruiters

SmartRecruiters slugs are company identifiers at `jobs.smartrecruiters.com/{slug}`.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| Visa | `Visa` | Payments |
| Bosch | `BoschGroup` | Industrial / Tech |
| Equinox | `Equinox` | Fitness |
| Skechers | `Skechers` | Footwear |
| 10Minuteschool | `10minuteschool` | — |
| Ajua | `ajua` | — |
| Artelia | `artelia` | — |
| Blueally | `blueally` | — |
| Check24 | `check24` | — |
| Continental | `continental` | — |
| Deloittenordic | `deloittenordic` | — |
| Elizabethglaserpediatricaidsfoundation3 | `elizabethglaserpediatricaidsfoundation3` | — |
| Firstdrivelogisticsinc | `firstdrivelogisticsinc` | — |
| Ginastechjobs | `ginastechjobs` | — |
| Hexagroup | `hexagroup` | — |
| Ingramcontentgroup1 | `ingramcontentgroup1` | — |
| Kanadeviainova | `kanadeviainova` | — |
| Liftedanupworkcompany | `liftedanupworkcompany` | — |
| Mcwaneinc | `mcwaneinc` | — |
| Mytime | `mytime` | — |
| Nxtkeycorporation | `nxtkeycorporation` | — |
| Primark | `primark` | — |
| Renaud Bray | `renaud-bray` | — |
| Samsungena | `samsungena` | — |
| Siloamcareers | `siloamcareers` | — |
| Sterlingenterprisellc | `sterlingenterprisellc` | — |
| Telefonicatech | `telefonicatech` | — |
| Trustonic | `trustonic` | — |
| Virtuaadvancedsolution | `virtuaadvancedsolution` | — |

---

## SuccessFactors

SuccessFactors (SAP) slugs vary by company deployment.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| SAP | `sap:SAP` | Enterprise Software |
| Accenture | `accenture:Accenture` | Consulting |
| Siemens | `siemens:SiemensExternal` | Industrial |

---

## Workable

Workable slugs are the company subdomain at `apply.workable.com/{slug}`.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| Sephora | `sephora` | Retail / Beauty |
| Forbes | `forbes` | Media |
| Our Home | `-our-home` | — |
| Alliedteam | `alliedteam` | — |
| Auprosports | `auprosports` | — |
| Blitzoo Games | `blitzoo-games` | — |
| Cdr Companies | `cdr-companies` | — |
| Constructor 1 | `constructor-1` | — |
| Deep Science Ventures | `deep-science-ventures` | — |
| Elevated Hiring | `elevated-hiring` | — |
| Fergus | `fergus` | — |
| Gamigo | `gamigo` | — |
| Healthsnap | `healthsnap` | — |
| Infini Capital Management Limited | `infini-capital-management-limited` | — |
| Karohealthcare | `karohealthcare` | — |
| Lingoace | `lingoace` | — |
| Mention Me Ltd | `mention-me-ltd` | — |
| Nawy Real Estate | `nawy-real-estate` | — |
| Optibpo | `optibpo` | — |
| Pinnacle Middle East | `pinnacle-middle-east` | — |
| Radley Yeldar | `radley-yeldar` | — |
| Samsung Sds America | `samsung-sds-america` | — |
| Snowed In Studios 3 | `snowed-in-studios-3` | — |
| Switchboard Hiring 1 | `switchboard-hiring-1` | — |
| Thetsuigroup | `thetsuigroup` | — |
| University Of Mount Saint Vincent | `university-of-mount-saint-vincent` | — |
| Wearenoble | `wearenoble` | — |

---

## BambooHR

BambooHR slugs are the subdomain at `{slug}.bamboohr.com/careers`.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| StackOverflow | `stackoverflow` | Developer Community |
| Zapier | `zapier` | Automation |
| Buffer | `buffer` | Social Media |

---

## Recruitee

Recruitee slugs are the subdomain at `{slug}.recruitee.com`.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| Toggl | `toggl` | Productivity |
| Hostinger | `hostinger` | Web Hosting |

---

## Manatal

Manatal slugs are the career page identifier. No auth required.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| Manatal | `manatal` | HR Tech |

---

## Paylocity

Paylocity uses GUID identifiers found in the company's Paylocity career page URL.

| Company | Slug (GUID) | Industry |
| ------- | ----------- | -------- |
| (Discover from company career page URL pattern: `recruiting.paylocity.com/Recruiting/Jobs/Details/{guid}`) | | |

---

## Phenom

Phenom slugs are the company domain used in their Phenom-powered career site.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| Boeing | `boeing` | Aerospace |
| Hilton | `hilton` | Hospitality |
| Nestle | `nestle` | Consumer Goods |
| Comcast | `comcast` | Telecom |
| Verizon | `verizon` | Telecom |

---

## Bullhorn

Bullhorn slugs follow the pattern `{cls}:{corpToken}` (found in career portal JavaScript).

| Company | Slug | Industry |
| ------- | ---- | -------- |
| (Discover from staffing agency career portal source code) | | |

## Avature

Avature slugs are the subdomain used in `<slug>.avature.net` (default-tenant pattern). For custom-domain tenants like `careers.ibm.com`, pass the full URL via `companyUrl` instead of a slug. Slugs sampled from the upstream `OTHERS/Ats-scrapers/avature/avature_companies.csv` reference list.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| Bloomberg | `bloomberg` | Financial Data |
| KPMG Ireland | `kpmgireland` | Professional Services |
| Deloitte (PNG) | `deloittepng` | Professional Services |
| Maximus | `maximus` | Government Services |
| Plante Moran | `plantemoran` | Accounting |
| NVA (Vet Group) | `nva` | Veterinary |
| Delta | `delta` | Aviation |
| One800Flowers | `one800flowers` | Retail / E-commerce |
| Ally | `ally` | Banking / Finance |
| Astellas | `astellas` | Pharmaceuticals |
| Bupa ANZ | `bupaanz` | Healthcare / Insurance |
| CBRE Global | `cbreglobal` | Real Estate |
| GPS Hospitality | `gpshospitality` | Restaurants / Franchising |
| Monadelphous | `monadelphous` | Engineering / Construction |
| Resource Bank | `resourcebank` | Financial Services |

## Gem

Gem boards are hosted at `jobs.gem.com/<slug>`. Slugs sampled from the upstream `OTHERS/Ats-scrapers/gem/gem_companies.csv` reference list — the corpus skews towards venture-backed and AI-first companies.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| Accel | `accel` | Venture Capital |
| 43North | `43north` | Startup Accelerator |
| 8020 Consulting | `8020-consulting` | Consulting |
| A16Z Speedrun | `a16z-speedrun` | Venture Capital |
| Acre | `acre` | Climate / Sustainability |
| Agora | `agora` | Real Estate Tech |
| Airframe | `airframe` | Developer Tools |
| Alex and Ani | `alex-and-ani` | Retail / Jewelry |
| 11X AI | `11x-ai` | AI / SaaS |
| 10X Construction AI | `10xconstruction-ai` | Construction Tech |
| Aarden AI | `aarden-ai` | AI / Sales |
| Acely | `acely` | Education Tech |
| Afterquery | `afterquery` | AI / Data |
| Agenta AI | `agenta-ai` | LLM Ops |

## Join.com

Join.com career pages live at `join.com/companies/<slug>`. Slugs sampled from the upstream `OTHERS/Ats-scrapers/join_com/join_companies.csv` reference list — the corpus skews towards European (especially DACH) tech and consumer brands.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| Awork | `awork` | Productivity / SaaS |
| Alteos | `alteos` | Insurance Tech |
| Aitad | `aitad` | AI / Data |
| Capitalmind | `capitalmind` | Asset Management |
| Brandcircle | `brandcircle` | Marketing / E-commerce |
| Cinnamood | `cinnamood` | Food / Hospitality |
| Brandneo | `brandneo` | Marketing |
| Brunathelabel | `brunathelabel` | Fashion / Apparel |
| Allunity | `allunity` | Crypto / DeFi |
| Citychickennhas490 | `citychickennhas490` | Restaurants / QSR |
| Caiz | `caiz` | Crypto / Fintech |
| Cannaleo | `cannaleo` | Cannabis Retail |
| Big City Beats | `bigcitybeats` | Music / Events |
| AXSOL | `axsol` | Power / Energy Storage |
| Career Sancovia | `career-sancovia` | Career Services |

## Oracle HCM Cloud

Oracle slugs follow the `<subdomain>-<region>` form (e.g. `eeho-us2`) — they expand into the canonical career-portal URL `https://<subdomain>.fa.<region>.oraclecloud.com`. For multi-segment subdomains like `careers-portal-us2`, the resolver splits on the LAST `-` (`subdomain=careers-portal`, `region=us2`). Operators with a non-default `siteNumber` finder parameter pass it via `ScraperInputDto.siteNumber` (defaults to `'CX_45001'` per Q-030). Slugs sampled from the upstream `OTHERS/Ats-scrapers/oracle/oracle_companies.csv` reference list — the corpus is dominated by enterprises across financial services, retail, healthcare, and government.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| Oracle | `eeho-us2` | Enterprise Software |
| City of Atlanta | `ehxr-us2` | Government |
| TTX | `ejjc-us6` | Rail / Logistics |
| CooperCompanies | `hcjy-us2` | Healthcare / MedTech |
| EXP | `elcn-us2` | Engineering Consulting |
| Kroll | `hcxs-us2` | Risk / Financial Advisory |
| Macy's | `ebwh-us2` | Retail |
| Westpac Group | `ebuu-ap1` | Banking |
| DTCC | `ebxr-us2` | Financial Infrastructure |
| Hologic | `ebwb-us2` | Medical Devices |
| Mountaire | `ebtg-us2` | Food / Poultry |
| Mouser | `eabw-us2` | Electronics Distribution |
| Ricoh | `cbha-us2` | Imaging / Technology |
| Galliford Try | `cbct-em2` | Construction |
| Apollo Hospitals | `cgs-ap2` | Healthcare |

## Mercor

Mercor is a **catalogue-wide** scraper — the explore-page endpoint returns the entire public listing set in one GET, with no per-company URL segmentation. The "slug" passed via `ScraperInputDto.companySlug` is therefore a **case-insensitive substring filter** on `companyName` rather than a URL-keyed identifier. Empty slug returns the full catalogue (capped by `resultsWanted`, default 100); populated slug narrows the result via `companyName.toLowerCase().includes(slug.toLowerCase())`. Sample employers below are taken from the explore-page corpus at time of writing — Mercor's catalogue is fluid, so the list evolves as companies post and close roles.

| Company | Slug | Industry |
| ------- | ---- | -------- |
| Stripe | `stripe` | Payments |
| OpenAI | `openai` | AI / Foundation Models |
| Anthropic | `anthropic` | AI / Foundation Models |
| Notion | `notion` | Productivity SaaS |
| Airbnb | `airbnb` | Travel / Marketplace |
| Figma | `figma` | Design Tools |
| Vercel | `vercel` | Developer Infrastructure |
| Linear | `linear` | Productivity / DevTools |
| Discord | `discord` | Social / Communication |
| Coinbase | `coinbase` | Crypto / Finance |
| Plaid | `plaid` | Fintech / Open Banking |
| Ramp | `ramp` | Fintech / Spend Management |

## Tesla

Tesla is a **single-tenant** scraper — `companyUrl` and `companySlug` are both ignored; the service always targets `https://www.tesla.com/careers/search/`. Operators don't pass a slug; the single canonical entry below is documented for symmetry with the other plugins and for the directory's auto-discovery tooling. Operators control output volume via `resultsWanted` (cap on listings) and `descriptionDepth` (per-job detail-fetch budget — `'board'` skips details, `'detail-25'` default caps at 25 follow-ups, `'detail-all'` fetches every job).

| Company | Slug | Industry |
| ------- | ---- | -------- |
| Tesla | `tesla` | Electric Vehicles / Energy |
| Upstart | `upstart` | Fintech / AI Lending |
| Tamara | `tamara` | Fintech / BNPL |
| TrueLayer | `truelayer` | Fintech / Open Banking |
| Public | `public` | Fintech / Retail Investing |
| Paystack | `paystack` | Fintech / Payments |
| Moniepoint | `moniepoint` | Fintech / Business Banking |
| Thrive Market | `thrivemarket` | E-commerce / Online Grocery |
| Form3 | `form3` | Fintech / Payments Infrastructure |
| Marvel Fusion | `marvelfusion` | Energy / Fusion |
| Kairos Power | `kairospower` | Energy / Advanced Nuclear |
| Wolt | `wolt` | Food Delivery / Local Commerce |
| Redwood Materials | `redwoodmaterials` | Energy / Battery Materials |
| Group14 Technologies | `group14` | Energy / Battery Materials |
| Carbon | `carbon` | Manufacturing / Additive Manufacturing |
| Forward | `forward` | Digital Health / Primary Care |
| Tia | `tia` | Digital Health / Women’s Health |
| Headway | `headway` | Digital Health / Mental Health |
| Talkspace | `talkspace` | Digital Health / Mental Health |
| Octave | `octave` | Digital Health / Mental Health |
| Freenome | `freenome` | Biotech / Diagnostics |
| Natera | `natera` | Biotech / Genetic Diagnostics |
| Generate Biomedicines | `generatebiomedicines` | Biotech / AI Drug Discovery |
| Oura | `oura` | Consumer Health Hardware |
| Carvana | `carvana` | E-commerce / Auto Retail |
| unybrands | `unybrands` | E-commerce / Brand Aggregator |
| Yotpo | `yotpo` | MarTech / E-commerce |
| TaxBit | `taxbit` | Fintech / Crypto Tax |
| Culture Amp | `cultureamp` | HR Tech / People Analytics |
| Energage | `energage` | HR Tech / Employee Engagement |
| Veriff | `veriff` | Identity / KYC |
| Thoropass | `thoropass` | Security / Compliance |
| Endor Labs | `endorlabs` | Security / AppSec |
| Cybereason | `cybereason` | Security / Endpoint |
| Tanium | `tanium` | Security / Endpoint Management |
| Expel | `expel` | Security / MDR |
| Figure | `figureai` | Humanoid Robotics / AI |
| Slice | `slice` | SMB Fintech / Restaurant Technology |
| Chowbus | `chowbus` | Restaurant Technology / Food Delivery |
| TabaPay | `tabapay` | Payments / Fintech Infrastructure |
| PathAI | `pathai` | Healthcare AI / Digital Pathology |
| Found | `found` | SMB Fintech / Business Banking |
| Parsley Health | `parsleyhealth` | Healthcare / Telehealth |
| Neuralink | `neuralink` | Neurotechnology / Brain-Computer Interface |
| CLEAR | `clear` | Identity / Biometric Security |

The OPTIONAL `source-tesla-playwright` companion plugin is opt-in (per Q-028 / FR-13) — operators must manually import `TeslaPlaywrightModule` AND install `playwright` (`npm install playwright && npx playwright install chromium`) to enable the Akamai-bypass path. Both plugins emit jobs against the same single `tesla` slug; the dedup engine collapses cross-plugin duplicates by `externalId` per Spec 003 / FR-3.

---

## Tips for Finding Company Slugs

### Greenhouse
Visit `boards.greenhouse.io/{company-name}` or check the company's career page source for `greenhouse.io` links.

### Lever
Visit `jobs.lever.co/{company-name}` or check career page source for `lever.co` links.

### Workday
Look at the company's career page URL — it typically contains `{company}.wd{N}.myworkdayjobs.com`.

### Ashby
Visit `jobs.ashbyhq.com/{company-name}` or check the career page source.

### Taleo
Check the career page URL for `taleo.net` — the slug is derived from the company and career section identifiers.

### iCIMS
Check the career page URL for `icims.com` — look for the company portal identifier.

### Phenom
Check if the company's career site uses `jobs.{company}.com` — Phenom-powered sites have a consistent API pattern.

### Avature
Check the career page URL for `*.avature.net` (default tenant) — the slug is the leftmost subdomain. For custom-domain tenants (e.g. `careers.ibm.com`), pass the full URL via the `companyUrl` input override; the plugin handles both.

### Gem
Visit `jobs.gem.com/{slug}` directly. The slug appears in the URL path; multi-word company names use hyphens (e.g. `alex-and-ani`).

### Join.com
Visit `join.com/companies/{slug}`. The slug is the URL path segment after `/companies/`. The plugin then issues a public-API call to fetch the numeric `companyId` automatically.

### General Strategy
1. Go to the company's career page
2. View page source (Ctrl+U)
3. Search for ATS platform domains (greenhouse.io, lever.co, ashbyhq.com, etc.)
4. Extract the slug from the URL pattern
