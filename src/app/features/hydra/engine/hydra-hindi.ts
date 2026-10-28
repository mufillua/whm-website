/**
 * Hindi and Hinglish for Hydra.
 *
 * Customers often type Hindi in English letters ("screwdriver ka size kya hai", "kaise use karte hai") or in
 * Devanagari ("स्क्रूड्राइवर का साइज़ क्या है"). `readHindi` turns such a message into the plain English question the
 * engine already answers ("screwdriver sizes", "how to use it"). Messages in English pass through untouched, so
 * English answers never change.
 *
 * How it reads a message:
 *  1. Devanagari is written out in Roman letters (क्या → kya, पेचकस → pechkas).
 *  2. Spelling variants become one form (kese/kaisa → kaise, chaiye/chahie → chahiye), Hindi trade names become the
 *     catalogue word (pechkas → screwdriver, pana → spanner, hathoda → hammer) and Hindi sizes become numbers
 *     (aadha inch → 1/2", 4 sut → 1/2", do ton → 2 ton).
 *  3. The question is recognised from its Hindi wording (kaise use → how to use, kahan use hota → where is it used,
 *     kitne ka → price, milega → do you have…) and the product words are kept.
 *  4. An English question is written from those parts.
 */

export interface HindiReading {
  /** The message was read as Hindi / Hinglish. */
  hindi: boolean;
  /** The question for the engine: English when `hindi`, otherwise the message itself. */
  text: string;
  /** The message in Roman letters (Devanagari written out), lower case, for FAQ phrases written in Hinglish. */
  roman: string;
}

/** Finds the catalogue word for a Hindi-spelt English word ("silendar" -> "cylinder"), if there is one. */
export type WordResolver = (word: string, fromDevanagari: boolean) => string | undefined;

// ======================================================================================== Devanagari

const VOWELS: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ii', 'उ': 'u', 'ऊ': 'uu', 'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ऑ': 'o', 'ऍ': 'e',
};
const MATRAS: Record<string, string> = {
  'ा': 'aa', 'ि': 'i', 'ी': 'ii', 'ु': 'u', 'ू': 'uu', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ॉ': 'o', 'ॅ': 'e',
};
const CONSONANTS: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n', 'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'n', 'ट': 't', 'ठ': 'th', 'ड': 'd',
  'ढ': 'dh', 'ण': 'n', 'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n', 'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm', 'य': 'y',
  'र': 'r', 'ल': 'l', 'ळ': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क़': 'q', 'ख़': 'kh', 'ग़': 'g', 'ज़': 'z', 'ड़': 'd', 'ढ़': 'dh', 'फ़': 'f', 'य़': 'y',
};
/** Consonant + nukta (़). */
const NUKTA: Record<string, string> = { 'क': 'q', 'ख': 'kh', 'ग': 'g', 'ज': 'z', 'ड': 'd', 'ढ': 'dh', 'फ': 'f', 'य': 'y' };
const VIRAMA = '्';
const NUKTA_SIGN = '़';

interface Unit {
  c: string;
  v: string;
  /** The vowel is the consonant's built-in "a", which Hindi often doesn't pronounce. */
  inherent: boolean;
  nasal?: boolean;
}

function romaniseWord(word: string): string {
  const ch = [...word];
  const units: Unit[] = [];
  for (let i = 0; i < ch.length; i++) {
    const x = ch[i];
    if (CONSONANTS[x] !== undefined) {
      let c = CONSONANTS[x];
      if (ch[i + 1] === NUKTA_SIGN) {
        c = NUKTA[x] ?? c;
        i++;
      }
      const next = ch[i + 1];
      if (next === VIRAMA) {
        units.push({ c, v: '', inherent: false });
        i++;
      } else if (next !== undefined && MATRAS[next] !== undefined) {
        units.push({ c, v: MATRAS[next], inherent: false });
        i++;
      } else units.push({ c, v: 'a', inherent: true });
    } else if (VOWELS[x] !== undefined) units.push({ c: '', v: VOWELS[x], inherent: false });
    else if (x === 'ं' || x === 'ँ') units.push({ c: 'n', v: '', inherent: false, nasal: true });
    else if (x === 'ः') units.push({ c: 'h', v: '', inherent: false });
  }
  // the built-in "a" is silent at the end of a word (पेचकस = pechkas) and between a vowel and a full syllable (करते = karte)
  const last = units[units.length - 1];
  if (units.length > 1 && last?.inherent) last.v = '';
  for (let i = 1; i < units.length - 1; i++) {
    const u = units[i];
    const prev = units[i - 1];
    const next = units[i + 1];
    if (u.inherent && u.v && prev.v && !prev.nasal && next.c && !next.nasal && next.v) {
      u.v = '';
      i++;
    }
  }
  // a nasal before p/b/m sounds like m (नंबर = number, कंपनी = company)
  units.forEach((u, i) => {
    if (u.nasal && /^(p|b|m)/.test(units[i + 1]?.c ?? '')) u.c = 'm';
  });
  return units
    .map((u) => u.c + u.v)
    .join('')
    .replace(/chchh/g, 'chh')
    .replace(/aa/g, 'a')
    .replace(/ii/g, 'i')
    .replace(/uu/g, 'u');
}

const DEVA_DIGITS = '०१२३४५६७८९';

/** Writes Devanagari in Roman letters, word by word; anything else is left as it is. */
export function romanise(text: string): string {
  return text
    .replace(/[०-९]/g, (d) => String(DEVA_DIGITS.indexOf(d)))
    .replace(/[।॥]/g, '.')
    .replace(/[ऀ-ॿ‌‍]+/g, (w) => romaniseWord(w.replace(/[‌‍]/g, '')));
}

// ====================================================================================== sound keys

/**
 * A rough sound key, so the same word spelt the English way and the Hindi way meet:
 * "cylinder" and "silendar" -> "slndr", "screwdriver" and "skrudraivar" -> "skrdrvr".
 */
export function soundKey(word: string): string {
  let s = word.toLowerCase().replace(/[^a-z]/g, '');
  s = s
    .replace(/ph/g, 'f')
    .replace(/t?chh?/g, 'C')
    .replace(/sh|zh/g, 's')
    .replace(/([kgtdbj])h/g, '$1')
    .replace(/ck/g, 'k')
    .replace(/q/g, 'k')
    .replace(/x/g, 'ks')
    .replace(/c(?=[eiy])/g, 's')
    .replace(/c/g, 'k')
    .replace(/C/g, 'c')
    .replace(/z/g, 's')
    .replace(/w(?=[aeiou])/g, 'v')
    .replace(/w/g, '')
    .replace(/(?!^)h/g, '')
    .replace(/[aeiouy]/g, '');
  return s.replace(/(.)\1+/g, '$1');
}

/** English words customers write the Hindi way; added to the engine's own words for sound-key matching. */
export const LOANWORDS = (
  'screwdriver spanner wrench plier hammer valve gauge pressure temperature thermometer hydraulic coupling filter pump ' +
  'cylinder hose pipe fitting adaptor nipple socket chisel file drill hacksaw blade cutter scissor chain hook pulley block ' +
  'hoist sling shackle rope wire jack trolley truck stacker container clamp vice allen tester bolt washer seal gasket ' +
  'diaphragm manifold needle relief solenoid directional flow control ball gear vane motor tank strainer breather level ' +
  'thermocouple thermowell sensor switch stainless steel brass aluminium electric magnetic insulated taparia delta yuken ' +
  'polyhydron hydroline asian lifting pallet spring balancer cartridge modular sequence counterbalance check toolkit toolbox'
).split(' ');

// ==================================================================================== Hinglish words

/** Spelling variants -> one form. Includes English words as Hindi speakers write them (saiz, yuz, prais). */
const VARIANTS: Record<string, string> = {};
const variant = (canon: string, forms: string) => forms.split(' ').forEach((f) => (VARIANTS[f] = canon));
variant('kya', 'kya kia kyaa ky kyaaa');
variant('kyon', 'kyon kyu kyun kyo kyoun');
variant('hai', 'hai he hei hy hae h hain hein hen haii');
variant('kaise', 'kaise kese kaisay kaisey kase kaisa kaisi kesa kesi kaisee');
variant('kahan', 'kahan kaha kahaan kahn kidhar kidar kaahan');
variant('kitna', 'kitna kitne kitni ktna ktne kitana kitany');
variant('kaun', 'kaun kon koun kaon');
variant('kaunsa', 'kaunsa konsa kaunsi konsi kaunse konse kounsa kaunsaa konsaa');
variant('chahiye', 'chahiye chaiye chahie chahiya chaahiye chahye chaiyee chaiya chahiyee chhaiye chahia chahiy chaahie chahta chahte chahti chahenge');
variant('milega', 'milega milegi milenge milta milti milte mila mili milenga milengi milegaa');
variant('kar', 'kar karte karta karti karna karni karne kare karein karen karu karun kru krte krna krta kiya kiye kijiye kijie kariye karo karenge karega karoge karwana karwa krna krein kren');
variant('hota', 'hota hoti hote hoga hogi honge hua hui hue');
variant('use', 'use yuz yuj yous istemal istemaal istmal istamal istemaal upyog upayog prayog');
variant('size', 'size sizes saiz saij saaiz sise saize naap akar aakar');
variant('dam', 'dam daam keemat kimat kimmat kimaat bhav bhaav rate rates price prise prais praais ret reat');
variant('lag', 'lag lagta lagti lagte lagaya lagaye lagate lagana lagaana lagao laga lagai lagaate');
variant('chal', 'chal chalate chalata chalaye chalana chalta chalti chalte chalao chalayen chalaen');
variant('jod', 'jod jode jodte jodna jodo jodein jodein jodta');
variant('khul', 'khul khulta khulti khulte khulega khulegi khula khuli khulti khulna');
variant('batao', 'batao bataiye bataye batana bata batayiye bataen bataiyega btao bataie');
variant('dikhao', 'dikhao dikhaiye dikhaye dikhana dikha dikhaie');
variant('kaam', 'kaam');
variant('fark', 'fark farak farq antar');
variant('accha', 'accha acha achha achchha acchha achaa');
variant('theek', 'theek thik thek theek thiik');
variant('me', 'me mein mai men mae');
variant('paas', 'paas pas paass');
variant('aapke', 'aapke apke aapka apka aapki apki aapko apko aapne apne aapse apse aap ap');
variant('barein', 'barein baarein bareme baareme');
variant('range', 'range renj rainj reinj ranj');
// English words as written in Hindi
variant('delivery', 'delivery dilivri dilivary dilivery delivri delevery delivary');
variant('address', 'address adres edres addres adress');
variant('number', 'number nambar numbar nmbr');
variant('phone', 'phone fon fone');
variant('whatsapp', 'whatsapp vatsap whatsap watsapp watsap vhatsap vhatsep');
variant('timing', 'timing timings taiming taimings');
variant('sunday', 'sunday sande sandey');
variant('company', 'company kampani kampni kampny compani');
variant('product', 'product prodakt prodact');
variant('model', 'model modal maadal');
variant('stock', 'stock stok staak');
variant('available', 'available aveleble avelebal availabel avelable');
variant('catalogue', 'catalogue catalog katalog kaitalog ketalog');
variant('quality', 'quality kvaliti kwality kvality');
variant('service', 'service sarvis sarvice');
variant('order', 'order ordar');
variant('brand', 'brand braand brend');

/** Hindi trade names -> the word the catalogue uses. */
const TRADE: Record<string, string> = {};
const trade = (english: string, forms: string) => forms.split(' ').forEach((f) => (TRADE[f] = english));
trade('screwdriver', 'pechkas pechkash pechkus pechkush penchkas pechkas skrudraivar sakrudraivar');
trade('spanner', 'pana paana pane paane spana spaana spainar spanar');
trade('wrench', 'rench renchh rinch rinj');
trade('key', 'chabi chaabi chabhi chaabhi');
trade('hammer', 'hathoda hathauda hathora hathaura hathodi hathaudi hathori hathodaa');
trade('plier', 'plas plaas pilas pilaas palas plaiyar playar plaayar plaiers plaayer jamboor jambur');
trade('hacksaw', 'aari aaree aary aree ari haikso hacksa');
trade('chisel', 'chheni chhaini chhenni cheni chhainee');
trade('file', 'reti rethi retee phail');
trade('drill', 'barma barmi dril');
trade('clamp', 'shikanja sikanja shikanji');
trade('scissor', 'kainchi kenchi kaichi qainchi kaenchi');
trade('wire', 'taar tar');
trade('chain', 'zanjeer janjeer zanjir janjir chen chain');
trade('hook', 'kunda kundi huk');
trade('pulley', 'ghirni ghirri girri charkhi gharri puli pulli pully');
trade('rope', 'rassi rassa');
trade('sling', 'patta');
trade('jack', 'jaik jek');
trade('pressure', 'dabav dabaav dabaw daab preshar presar pressar');
trade('temperature', 'tapman taapmaan tapmaan tapmaan taapman');
trade('gauge', 'gej gaij gaje geij');
trade('valve', 'valv walv vaalv');
trade('ball', 'bol');
trade('pipe', 'paip paaip');
trade('hose', 'hoz hoj hoze');
trade('pump', 'pamp');
trade('coupling', 'kapling kupling koopling kaplin');
trade('filter', 'filtar philtar philtr filtr');
trade('cylinder', 'silendar silinder silindar silender cylender');
trade('fitting', 'fiting fitin');
trade('socket', 'soket sokit');
trade('oil', 'tel');
trade('water', 'pani paani');
trade('air', 'hawa hava');
trade('steam', 'bhap bhaap');
trade('steel', 'loha lohe lohaa');
trade('brass', 'pital peetal pitaal');
trade('copper', 'tamba taamba');
trade('rubber', 'rabar rabbar');
trade('electric', 'bijli bijlee bijali');
trade('hand', 'haath hath');
trade('small', 'chhota chota chhoti choti chhote chote');
trade('big', 'bada badi bade bara bari bare');
trade('long', 'lamba lambi lambe');
trade('heavy', 'bhari bhaari');
trade('light', 'halka halki halke');
trade('new', 'naya nayi naye nai');
trade('box', 'dabba dibba peti petti');
trade('bag', 'thaila thela');
trade('trolley', 'gaadi gadi');
trade('screw', 'pench pech skru skrew sakru');
trade('torque', 'tork tark torq');
trade('breather', 'bridar breedar brithar bridhar');
trade('nut', 'dibri dhibri');
trade('nail', 'kil keel');
trade('ring', 'chhalla challa');
trade('tap', 'nal');
trade('without', 'bina');
trade('and', 'aur evam tatha');
trade('or', 'ya athva');
trade('thermometer', 'tharmamitar tharmameter thermamiter');
// catalogue words as they come out of Devanagari (क्विक → kvik, टेम्परेचर → temparechar)
trade('quick', 'kvik kwik kuik');
trade('counter', 'kauntar kaunter');
trade('balance', 'bailens bailans belens');
trade('counterbalance', 'kauntarbailens kaunterbailens');
trade('temperature', 'temparechar temprechar tamprechar temparecher tempreture temprature');
trade('tools', 'tuls tul toolz');
trade('asian', 'eshiyan eshian aishiyan asiyan');
trade('check', 'chek');
trade('directional', 'dairekshanal dayrekshanal direkshanal');
trade('modular', 'modyular madyular');
trade('control', 'kantrol kantrolar kantroling');
trade('sequence', 'sikvens sikwens');
trade('reducing', 'ridyusing reduusing');
trade('needle', 'nidal nidil nidle');
trade('diaphragm', 'dayafram daiyafram daayafram');
trade('thermowell', 'tharmovel tharmowel');
trade('sensor', 'sensar sencer');
trade('gear', 'giyar giar');
trade('motor', 'motar');
trade('magnetic', 'maignetik megnetik');
trade('insulated', 'insuletid insuleted');
trade('electric', 'ilektrik electrik ilaiktrik');
trade('combination', 'kambineshan kombineshan kambinesan');
trade('stacker', 'staikar stekar');
trade('vice', 'vais');
trade('turnbuckle', 'tarnbakal turnbakal');
trade('lashing', 'laishing leshing');
trade('webbing', 'vebing webing');
trade('siphon', 'saiphan saifan syphon');
trade('snubber', 'snabar');
trade('rope', 'rop');
trade('wire', 'vayar vaayar');

/** Words that refer back to what was just discussed ("iska size", "ye kahan use hota hai"). */
const PRONOUNS = new Set(
  'iska iski iske isko isme ismein iss is ye yeh yah woh wo vo vah uska uski uske usko usme usmein inka unka inke unke inki unki inme unme inko unko isse usse dono it this that'.split(' '),
);

/** Hindi words that carry no product meaning: grammar, verbs, fillers, and the question words once read. */
const DROP = new Set(
  (
    'kya kyon kaise kahan kitna kab kaun kaunsa kis kise kisko kiska kiski kiske kisme kisse jo jis jise jisko jab tab tak agar magar lekin ' +
    'par pe ka ki ke ko se me mujhe muje mujhko mere mera meri hum hume humein hamein humko hamko hamara hamari hamare aapke tum tumhe tumko ' +
    'tumhara tumhari tumhare tu tera teri tere hai ho hoon hu hun tha thi the hota raha rahe rahi rha rhe rhi gaya gayi gaye gya kar de do ' +
    'dena deni dene dete deta deti dijiye dijie diya diye la lao laiye lana le lo lena leni lene lu loon lun lenge lega legi chahiye milega ' +
    'mil sakta sakte sakti sake sakenge jata jati jate jaye jayega jaega jaayega batao dikhao bhejo bhejiye bhejna bhej bhejte rakhte rakhta ' +
    'rakho rakhi rakha bechte bechta bikta aata aati aate lag chal jod samjhao samjhaiye samjha socha dekh dekho dekhna dekhiye puchna ' +
    'poochna puch pooch bol bolo boliye kehna kaho kahiye kehte kehta bhi hi na nahi nahin nhi mat to toh tho haan han ha ji jee accha theek ' +
    'bas sirf zara jara thoda thodi kuch kuchh koi sab sabhi saare sare saara bahut bohot bahot bohat jyada zyada wala wali wale vala vali ' +
    'vale waala waali waale liye lie liya saath sath abhi aaj kal jaldi turant fir phir ab bhai bhaiya bhaiyya sahab saheb dost yaar yar ' +
    'zaroorat jarurat zarurat jaroorat cheez chiz chij cheeze saman samaan maal jankari jaankari baat tarika tareeka vidhi kaam matlab fark ' +
    'dam paisa paise rupaye rupay rupiya rupee size use lambai chaudai motai golai barein paas sabse best sahi khul band baje samay waqt ' +
    'kehte kise kisko kyakya kaunkaun sakti hoti hote taki jisse wahan yahan idhar udhar upar niche andar bahar pehle baad liye kripya krupya ' +
    'please plz dhanyavad dhanyawad shukriya namaste namaskar madad sahayata kitni kitne apna apni apne khud uthane wala hisaab hisab ' +
    'mujhko humlog aaplog log raha rehta rehti rahta rahti matlab dikhaiye mangana mangwana mangaye mangwaye kharid kharidna kharidu khareed ' +
    'kharidna lena tha thhe chahta suggest bataiye fayda faida kahiye wajah karan isliye kyunki bana hua bani kis ' +
    'ghanta ghante hafta hafte mahina mahine saal roz rozana'
  ).split(' '),
);

const NUMBERS: Record<string, number> = {
  ek: 1, do: 2, teen: 3, tin: 3, char: 4, chaar: 4, panch: 5, paanch: 5, paach: 5, chhe: 6, chhah: 6, che: 6, saat: 7, sat: 7, aath: 8,
  ath: 8, nau: 9, das: 10, gyarah: 11, barah: 12, baarah: 12, terah: 13, chaudah: 14, pandrah: 15, solah: 16, satrah: 17, atharah: 18,
  unnis: 19, bees: 20, bis: 20, pachis: 25, pachees: 25, tees: 30, chalis: 40, pachas: 50, pachaas: 50, sau: 100,
};
/** aadha inch = 1/2", dedh inch = 1-1/2"… */
const FRACTIONS: Record<string, string> = {
  aadha: '1/2', adha: '1/2', aada: '1/2', paav: '1/4', pav: '1/4', pao: '1/4', pauna: '3/4', pona: '3/4', sava: '1-1/4', sawa: '1-1/4',
  dedh: '1-1/2', derh: '1-1/2', dhai: '2-1/2', dhaai: '2-1/2', dhaee: '2-1/2',
};
const UNITS: Record<string, string> = {
  inch: 'inch', inchi: 'inch', inches: 'inch', ench: 'inch', inchh: 'inch', '"': 'inch', sut: 'sut', soot: 'sut', suta: 'sut', sutt: 'sut',
  mm: 'mm', milimeter: 'mm', millimeter: 'mm', mili: 'mm', cm: 'cm', ton: 'ton', tan: 'ton', tonn: 'ton', tun: 'ton', tonne: 'ton',
  pcs: 'pcs', pc: 'pcs', piece: 'pcs', pieces: 'pcs', pis: 'pcs', nag: 'pcs', adad: 'pcs', dozen: 'dozen', darjan: 'dozen', set: 'set',
  meter: 'meter', metre: 'meter', mitar: 'meter', mtr: 'meter', feet: 'feet', fut: 'feet', foot: 'feet', ft: 'feet', kg: 'kg', kilo: 'kg',
  bar: 'bar',
};

/** Words that mark a message as Hindi (none of them is an English word). */
const MARKERS = new Set(
  (
    'kya kia kyaa kyon kyu kyun kaise kese kaisa kaisi kahan kahaan kidhar kitna kitne kitni kaun kon kaunsa konsa kaunsi konsi kaunse konse ' +
    'hai hain chahiye chaiye chahie milega milegi milenge milta milti milte karte karta karti karna karni karein kijiye kariye hota hoti hote ' +
    'batao bataiye bataye dikhao dikhaiye wala wali wale aapke apke aapka apka aapki apki aapko apko mujhe muje hume humein hamein iska iski ' +
    'iske uska uski uske isme usme ismein liye saath sath bhi nahi nahin nhi accha achha theek thik sabse kab ka ki ke ko mein daam keemat ' +
    'kimat bhav naap saiz istemal upyog tarika fark farak matlab jankari dukan dukaan khulta khulti khula paas pechkas pana hathoda plas ' +
    'chabi rassi zanjeer janjeer ghirni sut soot aadha adha dedh dhai pauna sava dhanyavad dhanyawad shukriya kitne lagta lagti aata aati ' +
    'kaam milega ye yeh woh wo hamara hamari aap kripya bhaiya haan hanji ji bas kuch kuchh'
  ).split(' '),
);

// ============================================================================================ reading

const TOKEN = /[A-Za-z0-9][A-Za-z0-9/.+*×-]*"?|"/g;

interface Tok {
  orig: string;
  low: string;
  canon: string;
}

/** Reads a message as Hindi / Hinglish when it is one; otherwise returns it unchanged. */
export function readHindi(input: string, resolve?: WordResolver): HindiReading {
  const deva = /[ऀ-ॿ]/.test(input);
  const roman = deva ? romanise(input) : input;
  const raw = roman.match(TOKEN) ?? [];
  const lows = raw.map((w) => w.toLowerCase());
  const allCaps = !/[a-z]/.test(roman) && /[A-Z]/.test(roman);
  // "KI - 10V", "KA" are model codes; a short word in capitals counts as Hindi only when the whole message is in capitals
  const marker = (w: string) => MARKERS.has(w.toLowerCase()) && (allCaps || w.length > 3 || w !== w.toUpperCase());
  const hindi = deva || raw.some(marker) || /\d\s+se\s+\d/i.test(roman);
  if (!hindi) return { hindi: false, text: input, roman: input };

  const devaWords = new Set(deva ? (input.match(/[ऀ-ॿ]+/g) ?? []).map((w) => romaniseWord(w).toLowerCase()) : []);
  const toks: Tok[] = raw.map((orig) => {
    const low = orig.toLowerCase();
    return { orig, low, canon: VARIANTS[low] ?? low };
  });

  // ---- "pressure meter" / "dabav meter" is a pressure gauge; "allen ki" an allen key; "grease gan" a grease gun;
  // "ai bolt" an eye bolt
  toks.forEach((t, i) => {
    const prev = toks[i - 1];
    const next = toks[i + 1];
    const what = prev ? (TRADE[prev.low] ?? prev.low) : '';
    if (/^(meter|metre|mitar)$/.test(t.low) && /^(pressure|temperature)$/.test(what)) setTok(t, 'gauge');
    if (/^(ki|kee|kii|chabi)$/.test(t.low) && /^(allen|elan|alan|ailan)$/.test(prev?.low ?? '')) {
      setTok(prev!, 'allen');
      setTok(t, 'key');
    }
    if (/^(gan|gun)$/.test(t.low) && /^(grease|gris|griis)$/.test(prev?.low ?? '')) setTok(t, 'gun');
    if (/^(ai|aai|aay|aayi)$/.test(t.low) && /^(bolt|bolts|nut|hook)$/.test(next?.low ?? '')) setTok(t, 'eye');
  });

  // ---- sizes and quantities said the Hindi way
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    const unit = UNITS[toks[i + 1]?.low ?? ''];
    if (!unit) continue;
    if (NUMBERS[t.low] !== undefined) setTok(t, String(NUMBERS[t.low]));
    else if (FRACTIONS[t.low] && (unit === 'inch' || unit === 'sut')) setTok(t, FRACTIONS[t.low]);
    else if (t.low === 'sadhe' && NUMBERS[toks[i + 1]?.low] !== undefined) {
      setTok(t, `${NUMBERS[toks[i + 1].low]}-1/2`);
      toks.splice(i + 1, 1);
    }
  }
  for (let i = 0; i < toks.length; i++) {
    const unit = UNITS[toks[i].low];
    if (!unit) continue;
    const prev = toks[i - 1];
    if (unit === 'sut' && prev && /^\d+$/.test(prev.low)) {
      setTok(prev, sutToInch(+prev.low));
      setTok(toks[i], 'inch');
    } else if (prev && /^[\d./-]+$/.test(prev.low)) setTok(toks[i], unit);
  }

  // ---- what the question is about
  let C = ' ' + toks.map((t) => t.canon).join(' ') + ' ';
  C = C.replace(/\bkaun (sa|si|se)\b/g, 'kaunsa')
    .replace(/\bkaun kaun\b/g, 'kaunkaun')
    .replace(/\bkya kya\b/g, 'kyakya')
    .replace(/\bmil (ja\w*|sak\w*)\b/g, 'milega')
    .replace(/\b(ka|ki|ke) (bare|baare|barein)\b/g, 'barein')
    .replace(/\b(bare|baare) me\b/g, 'barein')
    .replace(/\s+/g, ' ');

  // "0 se 10 bar" is a range: 0-10 bar
  for (let i = 1; i + 1 < toks.length; i++) {
    if (toks[i].low === 'se' && /^\d+(\.\d+)?$/.test(toks[i - 1].low) && /^\d+(\.\d+)?$/.test(toks[i + 1].low)) {
      setTok(toks[i - 1], `${toks[i - 1].low}-${toks[i + 1].low}`);
      toks.splice(i, 2);
    }
  }

  // ---- the product words
  let pronoun = false;
  const x: string[] = [];
  toks.forEach((t, i) => {
    const w = t.canon;
    if (t.low === 'din' && t.orig !== 'DIN' && !/^\d/.test(toks[i + 1]?.low ?? '')) return;
    if (PRONOUNS.has(t.low)) {
      pronoun = true;
      return;
    }
    if (UNITS[w] === w) {
      // a unit counts only after a number ("18 inch"), not in "inch me kaunsa size"; "set" alone is a product word
      if (/\d/.test(toks[i - 1]?.low ?? '') || w === 'set') x.push(w);
      return;
    }
    if (/\d/.test(w)) {
      x.push(/[a-z]/i.test(t.orig) ? t.orig : w);
      return;
    }
    if (TRADE[t.low]) {
      x.push(TRADE[t.low]);
      return;
    }
    if (DROP.has(w) || DROP.has(t.low) || SHOP_WORDS.has(w) || INTENT_CANON.has(w) || ENGLISH_FILLER.has(w)) return;
    const fromDeva = devaWords.has(t.low);
    const found = resolve?.(t.low, fromDeva);
    if (found) x.push(found === t.low ? t.orig : found);
    else if (!fromDeva || t.low.length > 2) x.push(t.orig);
  });
  const product = x
    .join(' ')
    .replace(/\b(\w+)( \1\b)+/gi, '$1')
    .replace(/^(and|or) | (and|or)$/g, '')
    .replace(/^(and|or)$/, '')
    .trim();

  const reading = (text: string): HindiReading => ({ hindi: true, text, roman: roman.toLowerCase() });

  // ---- shop questions and conversation (only when no product is named)
  if (!product && !pronoun) {
    const shop = shopQuestion(C);
    if (shop) return reading(shop);
  }

  const it = product || (pronoun ? 'it' : '');
  const of = (s: string) => (it ? `${s} of ${it}` : s);
  // "kya ye stainless steel ka hai", "iski body brass ki hai": what it is made of
  if (pronoun && MATERIAL.test(product) && /\b(ka|ki|ke|se|bana)\b/.test(C)) return reading('material of it');
  const want = intent(C);
  switch (want) {
    case 'price':
      return reading(of('price'));
    case 'compare':
      return reading(it && it !== 'it' ? `difference between ${it}` : 'difference between them');
    case 'install':
      return reading(`how to install ${it || 'it'}`);
    case 'adjust':
      return reading(`how to adjust ${it || 'it'}`);
    case 'operate':
      return reading(`how to operate ${it || 'it'}`);
    case 'howto':
      return reading(`how to use ${it || 'it'}`);
    case 'sizes':
      // a size was named ("18 inch ka pipe wrench"): look for that size
      if (SIZE_SAID.test(product)) return reading(`do you have ${product}`);
      return reading(product ? `${product} sizes` : pronoun ? 'sizes of it' : 'sizes');
    case 'uses':
      return reading(`where is ${it || 'it'} used`);
    case 'choose':
      return reading(product ? `which ${product} should i choose` : 'which one should i choose');
    case 'specs': {
      // "kitna pressure tak chalta hai": the spec asked for is not the product
      const spec = specWord(`${C} ${product}`);
      const subject = /^(pressure|bar|temperature|material|weight|accuracy|voltage)$/i.test(product) ? (pronoun ? 'it' : '') : it;
      return reading(subject ? `${spec} of ${subject}` : spec);
    }
    case 'stock':
      return reading(it ? `do you have ${it}` : 'what do you sell');
    case 'define':
      return reading(it ? `what is ${it}` : 'help');
    case 'about':
      return reading(it ? `tell me about ${it}` : 'help');
    case 'show':
      return reading(product || (pronoun ? 'tell me about it' : 'what do you sell'));
    default:
      return reading(product || (pronoun ? 'tell me about it' : 'help'));
  }
}

/** Materials a customer may ask about ("kya ye stainless steel ka hai"). */
const MATERIAL = /^((stainless|ss|mild|carbon|alloy|cast|forged) )*(steel|brass|copper|aluminium|aluminum|iron|plastic|rubber|nylon|bronze|beryllium|ss|ms|gi|pvc)( (steel|copper|iron))?$/i;

/** A size in the product words: 18 inch, 1/2, 10 x 11, 25 mm, 3 ton, 0-10 bar. */
const SIZE_SAID = /\d\s*(inch|mm|cm|ton|bar|kg|meter|feet|")|\d\s*x\s*\d|\d\/\d/i;

function setTok(t: Tok, value: string) {
  t.orig = value;
  t.low = value;
  t.canon = value;
}

/** 1 sut (soot) = 1/8 inch: 4 sut = 1/2", 6 sut = 3/4", 10 sut = 1-1/4". */
function sutToInch(n: number): string {
  const whole = Math.floor(n / 8);
  let num = n % 8;
  let den = 8;
  while (num && num % 2 === 0) {
    num /= 2;
    den /= 2;
  }
  if (!num) return String(whole);
  return whole ? `${whole}-${num}/${den}` : `${num}/${den}`;
}

/** Hindi words for the kinds of question, in the order they win. */
type HindiWant = 'price' | 'compare' | 'install' | 'adjust' | 'operate' | 'howto' | 'sizes' | 'uses' | 'choose' | 'specs' | 'stock' | 'define' | 'about' | 'show' | 'overview';

const INTENT_CANON = new Set(
  (
    'size use dam kaam fark matlab barein spec specs specification specifications material wajan vajan vazan weight accuracy voltage rating ' +
    'tarika vidhi order quote quotation discount difference compare price rate sizes uses used range'
  ).split(' '),
);
/** English filler that Hinglish messages use around the product. */
const ENGLISH_FILLER = new Set(
  'do does you have has is are am the a an of for to in on please pls plz sir madam mam ji bhai i me my we our it this that what which how where when why can could will would should any some need want looking available'.split(' '),
);
const SHOP_WORDS = new Set(
  ('dukan dukaan shop store office godown showroom address location timing sunday itwar ravivar etwar shanivar saturday chhutti chutti ' +
    'number phone mobile whatsapp call email mail delivery courier transport banate banaate banata banati manufacture manufacturer factory ' +
    'nirmata payment bhugtan upi gst bill udhar credit thok wholesale bulk dealer catalogue brochure warranty guarantee gaarantee wapas ' +
    'return marammat sampark brand brands company kampani product products saman samaan maal item items online cash paytm gpay ' +
    'phonepe neft rtgs').split(' '),
);

function intent(C: string): HindiWant {
  const has = (re: RegExp) => re.test(C);
  if (has(/\b(dam|paisa|paise|rupaye|rupay|rupees|rupiya|rs|mehenga|mehnga|mahanga|mehanga|sasta|sasti|saste|discount|chhoot|chhut|quotation|quote|price|cost)\b|\bkitna (ka|me|mein|paisa|lagega|padega)\b/)) return 'price';
  if (has(/\b(order|kharid\w*|khareed\w*|mangana|mangwana|mangaye|mangwaye|book)\b/) && has(/\bkaise\b/)) return 'price';
  if (has(/\b(fark|difference|compare|vs|versus)\b/)) return 'compare';
  if (has(/\bkaise\b/) && has(/\b(lag|jod|fit|install|fitting|laga\w*)\b/)) return 'install';
  if (has(/\bkaise\b/) && has(/\b(set|adjust|setting)\b/)) return 'adjust';
  if (has(/\bkaise\b/) && has(/\b(chal|operate)\b/)) return 'operate';
  if (has(/\bkaise\b/) && has(/\b(use|kar|kas\w*|khol\w*|tight|saaf|clean|maintain|calibrate|kaam)\b/)) return 'howto';
  if (has(/\b(tarika|tareeka|vidhi)\b|\bhow (to|do|can)\b/)) return 'howto';
  if (has(/\b(size|lambai|lambaai|chaudai|motai|golai|dimension\w*)\b|\bkitna (bada|lamba|mota|chauda|inch|mm|ton|kg|kilo|capacity|meter|feet)\b|\b(ton|kg) tak\b/)) return 'sizes';
  if (has(/\bkahan\b.*\b(use|lag|kaam)\b|\b(use|lag|kaam)\b.*\bkahan\b|\bkis (kaam|cheez|chiz|chij|jagah|liye)\b|\bkya kaam\b|\bkaam kya\b|\bkaam (aata|aati|aate|me)\b|\bkiske liye\b|\bkisme\b|\b(fayda|faida)\b|\bwhere\b|\b(used|uses|application\w*)\b/)) return 'uses';
  if (has(/\bkaunsa\b|\bsabse (accha|badhiya|best)\b|\b(best|behtar|suggest|recommend|choose)\b|\b(lena|lu|loon|lun) chahiye\b/)) return 'choose';
  if (has(/\b(spec|specs|specification\w*|material|wajan|vajan|vazan|weight|accuracy|voltage|rating|range)\b|\bkitna (pressure|bar|temperature|load|bhar|range)\b|\b(pressure|bar|load|temperature|range) kitna\b|\bkis (dhatu|material) (ka|se)\b|\bbana (hua|hai)\b/)) return 'specs';
  if (has(/\b(chahiye|milega|stock|available|rakhte|rakhta|bechte|bechta|bikta|lena|leni|kharid\w*|mangana|mangwana)\b|\baapke paas\b|\bpaas hai\b|\bhai kya\b|^ kya .* hai $|\b(do you have|have you)\b/)) return 'stock';
  if (has(/\bkya (hai|hota)\b|\bmatlab\b|\bkise kehte\b|\bkisko kehte\b|\bwhat is\b/)) return 'define';
  if (has(/\b(barein|jankari|jaankari)\b/)) return 'about';
  if (has(/\b(batao|dikhao)\b/)) return 'show';
  return 'overview';
}

function specWord(C: string): string {
  if (/\b(pressure|bar)\b/.test(C)) return 'pressure rating';
  if (/\b(temperature|tapman)\b/.test(C)) return 'temperature';
  if (/\b(material|dhatu|bana)\b/.test(C)) return 'material';
  if (/\b(wajan|vajan|vazan|weight)\b/.test(C)) return 'weight';
  if (/\baccuracy\b/.test(C)) return 'accuracy';
  if (/\bvoltage\b/.test(C)) return 'voltage';
  return 'specifications';
}

/** Shop and conversation questions in Hindi -> the English the engine knows. */
function shopQuestion(C: string): string | undefined {
  const has = (re: RegExp) => re.test(C);
  const t = C.trim();
  if (/^(namaste|namaskar|pranam|ram ram|salam|salaam|adab|adaab|(aapke )?kaise (ho|hai)|kya haal( hai)?|hello ji|hi ji|hii ji)( ji)?$/.test(t)) return 'hello';
  if (has(/\b(dhanyavad|dhanyawad|dhanyabad|dhanywad|shukriya|thanks|thank you|thnx|thx)\b/)) return 'thanks';
  if (/^((aur )?(kuch|kuchh) (nahi|nahin|nhi)( chahiye)?|(nahi|nahin|nhi)( chahiye| ji| bas)?|bas( itna( hi)?| ji)?|aur (nahi|nahin|kuch nahi))$/.test(t)) return 'nothing else';
  if (/^((ji )?(haan|han|ha|hanji)( ji)?|ok( ji)?|theek( hai)?( ji)?|accha( ji| hai)?|samajh gay[ai]|samjha)$/.test(t)) return 'ok';
  if (has(/\b(alvida|phir milenge|phir milte|chalta (hun|hu)|bye)\b/)) return 'bye';
  if (has(/\b(aapke|tum|tu) kaun\b|\bkaun ho\b|\b(naam|name) kya\b/)) return 'who are you';
  if (has(/\bkyakya\b|\brange\b|\bkya (bechte|milta|milega|rakhte|sell)\b|\bkaunkaun (se )?(product|saman|samaan|maal|item|cheez|chize)\b/)) return 'what do you sell';
  if (has(/\b(kaunkaun|kaunsa|kis) (se )?(brand|company)\b|\b(brand|company) (kaun|kaunsa)\b/)) return 'which brands do you have';
  if (has(/\b(dukan|dukaan|shop|store|office|godown|showroom)\b.*\bkahan\b|\bkahan\b.*\b(dukan|dukaan|shop|store|office)\b|\baapke( log)? kahan\b|\bkahan (par|pe) (hai|ho)\b|\b(address|location)\b|\bpata (kya|batao|do|dijiye)\b/)) return 'shop address';
  if (has(/\b(itwar|ravivar|etwar|sunday)\b/)) return 'are you open on sunday';
  if (has(/\b(shanivar|saturday)\b/)) return 'are you open on saturday';
  if (has(/\b(khul|band hota|band rehta|band rahta|baje|timing|samay|chhutti|chutti)\b/)) return 'opening hours';
  if (has(/\b(number|phone|mobile|whatsapp|call|sampark|contact|email|mail)\b|\bbaat (kar|karni|karna)\b/)) return 'phone number';
  if (has(/\b(delivery|bhej\w*|courier|transport|ghar (pe|par|tak))\b/)) return 'do you deliver';
  if (has(/\b(banate|banaate|manufacture\w*|factory|nirmata)\b/)) return 'do you manufacture';
  if (has(/\b(payment|bhugtan|upi|gst|bill|udhar|credit|online|cash|paytm|gpay|phonepe|neft|rtgs)\b/)) return 'payment';
  if (has(/\b(thok|wholesale|bulk|dealer)\b/)) return 'bulk order';
  if (has(/\b(catalogue|price list|brochure)\b/)) return 'catalogue';
  if (has(/\b(warranty|guarantee|gaarantee|wapas|return|replace\w*)\b/)) return 'warranty';
  if (has(/\b(repair|marammat|service|calibration)\b/)) return 'repair';
  if (has(/\b(madad|sahayata|help)\b/)) return 'help';
  return undefined;
}
