/**
 * Urwatal Vusqa Mega Quiz - Official Candidate Registry
 * Extracted from official candidate code list (MAICQ01 - MAICQ30).
 * Only candidates present in this list are authorized to register and participate.
 */

export const CANDIDATES = [
  { code: 'MAICQ01', name: 'Junaitha', place: 'Arattupuza' },
  { code: 'MAICQ02', name: 'Shamna Navab Aslami', place: 'Arattupuzha' },
  { code: 'MAICQ03', name: 'Jasira', place: 'Kottakkal,Indianoor' },
  { code: 'MAICQ04', name: 'Adil muhammed H', place: 'Arattupuzha' },
  { code: 'MAICQ05', name: 'Jaseela Suhail', place: 'Arattupuzha' },
  { code: 'MAICQ06', name: 'Muhammed Haseer', place: 'Tanur' },
  { code: 'MAICQ07', name: 'Juvairiya .k', place: 'Areekode' },
  { code: 'MAICQ08', name: 'Thasleem', place: 'Kodur' },
  { code: 'MAICQ09', name: 'Afroos', place: 'Malappuram' },
  { code: 'MAICQ10', name: 'Mashithath beevi', place: 'Arattupuzha' },
  { code: 'MAICQ11', name: 'JUMAILAH M', place: 'KOLAPPURAM' },
  { code: 'MAICQ12', name: 'SAYYID JUNAID AHAMMED KV', place: 'MALAPPURAM' },
  { code: 'MAICQ13', name: 'Fathimathul Fasna', place: 'Kannur' },
  { code: 'MAICQ14', name: 'Suhail', place: 'Thazhekode' },
  { code: 'MAICQ15', name: 'Muhammed Aslam O', place: 'Kottopadam' },
  { code: 'MAICQ16', name: 'Muhammed Midlaj M P', place: 'Pandallur' },
  { code: 'MAICQ17', name: 'Sayedmujthabahadi', place: 'Manjeshwar' },
  { code: 'MAICQ18', name: 'Muhammed raazy', place: 'Palakkad' },
  { code: 'MAICQ19', name: 'MUHAMMED ABDUL VASIH EK', place: 'THRIPPANACHI' },
  { code: 'MAICQ20', name: 'Saifunnisa', place: 'Manalippuzha' },
  { code: 'MAICQ21', name: 'Noorjahan', place: 'Aarattupuzha' },
  { code: 'MAICQ22', name: 'Naseema Suhaila Bahira', place: 'Malappuram' },
  { code: 'MAICQ23', name: 'MUHAMMED SUHAD Y', place: 'MAMPATTUMOOLA' },
  { code: 'MAICQ24', name: 'Subaida Thajudheen', place: 'Arattupuzha' },
  { code: 'MAICQ25', name: 'Hanna Bathul', place: 'Athippatta' },
  { code: 'MAICQ26', name: 'Iyas Aboobacker Mc', place: 'Nellikuth' },
  { code: 'MAICQ27', name: 'MOHAMMED BASIM.P', place: 'Malappuram' },
  { code: 'MAICQ28', name: 'Muhammed Munawar Vp', place: 'Paravanna' },
  { code: 'MAICQ29', name: 'MuhammadAzeem', place: 'Uliyathadika, kasaragod' },
  { code: 'MAICQ30', name: 'Muhammed Aman', place: 'Arattupuzha' },
  { code: 'MAICQ31', name: 'Savaad Test', place: 'Kannur' },
  { code: 'MAICQ32', name: 'Sinan', place: 'Malappuram' },
  { code: 'MAICQ33', name: 'Salman Test', place: 'Calicut' },
  { code: 'MAICQ34', name: 'Shameem Test', place: 'Wayanad' },
  { code: 'MAICQ35', name: 'Shamil Test', place: 'Thrissur' },
];

/**
 * Normalizes input candidate code and looks up the candidate in the official list.
 * @param {string} code 
 * @returns {{code: string, name: string, place: string} | null}
 */
export const findCandidateByCode = (code) => {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  return CANDIDATES.find((c) => c.code === normalized) || null;
};

/**
 * Check whether a code belongs to the authorized candidate list.
 * @param {string} code 
 * @returns {boolean}
 */
export const isCandidateAuthorized = (code) => {
  return findCandidateByCode(code) !== null;
};
