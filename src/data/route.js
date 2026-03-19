const routes_part_1 = {
  route_01: ["Barrier (Naya Gaon)", "PEC Main Gate", "Sector 10/3 Chowk", "Sector 9/4 Chowk", "Sector 8 Market", "Sector 7 Market", "Sector 7/26 Police Station Chowk", "Sector 26 Grain Market", "CU (Pb)"],
  route_02: ["Sector 22 (Kisan Bhawan)", "Sector 22/35 Picadilly", "Labour Chowk", "Sector 20 Gurudwara", "Sector 32 Hospital Chowk", "Old Airport Lights", "Zirakpur Patiala Lights", "Housefed Banur", "CU (Pb)"],
  route_03: ["P.U Gate No 03", "Sector 15 Market", "Sector 15/16 Lights", "Sector 24/15/16 Chowk", "Sector 23/16 Dividing", "Sector 17 Bus Stand", "Sector 19/27 Chowk", "Hallo Majra Lights", "Paras Downtown Zirakpur", "CU (Pb)"],
  route_04: ["Sector 24 Market", "Sector 23 Market", "Sector 22 Market", "Sector 22 Aroma Lights", "Sector 21 Market", "CU (Pb)"],
  route_05: ["Sector 38 Market", "Sector 37 Market", "Sector 43/44/34/35 Chowk", "Sector 43/44 Dividing", "Sector 44/45/33/34 Chowk", "CU (Pb)"]
};

const routes_part_2 = {
  route_06: ["Sector 36 Market", "Sector 35 Market", "Sector 34 Market", "Sector 33 Market", "Sector 32 Market", "Sector 31 Market", "CU (Pb)"],
  route_07: ["Sector 38 West Chowk", "Sector 38 West Lights", "Sector 38/40 Chowk", "Sector 41/37/38 Chowk", "Sector 37/41 Dividing", "Attawa Chowk", "CU (Pb)"],
  route_08: ["Sector 45/33 Dividing Lights", "Sector 45 Stephen Chowk", "Sector 46 Market", "Sector 47 Market", "Sector 47 (T-Point)", "CU (Pb)"],
  route_09: ["Maloya Bus Stand", "Sector 39 Mini Market", "Sector 40 Market", "Sector 41 Market", "Sector 42 Market", "CU (Pb)"],
  route_10: ["Sector 43 Market", "Sector 44 Market", "Sector 45 Market", "CU (Pb)"]
};

const routes_part_3 = {
  route_11: ["Sector 49/50 Chowk", "Sector 49 BSNL Chowk", "Sector 48 Motor Market Chowk", "CU (Pb)"],
  route_12: ["Sector 51 Market Jail Road (Beat Box)", "Sector 51/50 Chowk", "Sector 50 BSNL Colony", "Aerocity Lights (Falkon JLPL)", "Aerocity Lights (B Block)", "Aerocity Lights (I Block)", "CU (Pb)"],
  route_13: ["Khudda Lahora Bridge", "PGI Main Gate", "Sector 16 Hospital Lights", "Sector 09", "Sector 17/18 Lights (E-Sampark)", "Sector 18 (Tagore Theatre)", "Sector 18/19 Lights", "Sector 19 Market (Post Office)", "Sector 19/27 Lights", "Sector 27/28 Lights", "CU (Pb)"],
  route_14: ["Sector 20 Market", "Sector 30 Market", "Sector 29/30 Lights", "Sector 29 Market", "CU (Pb)"],
  route_15: ["Sector 28 Market", "Sector 28/29 Chowk", "Sector 28/27 Chowk", "Sector 27 Market", "CU (Pb)"],
  route_16: ["Sector 25 Market", "Sector 24/25 Chowk", "Sector 23/24 Chowk", "Sector 22/23 Chowk", "CU (Pb)"],
  route_17: ["Sector 21 Market", "Sector 21/22 Chowk", "Sector 20/21 Chowk", "Sector 19/20 Chowk", "CU (Pb)"],
  route_18: ["Sector 18 Market", "Sector 18/17 Chowk", "Sector 17/16 Chowk", "Sector 16 Market", "CU (Pb)"],
  route_19: ["Sector 15 Market", "Sector 14/15 Chowk", "Sector 14 Market", "Sector 13/14 Chowk", "CU (Pb)"],
  route_20: ["Sector 12 Market", "Sector 12/11 Chowk", "Sector 11 Market", "Sector 10 Market", "CU (Pb)"]
};

const routes_part_4 = {
  route_21: ["Sector 9 Market", "Sector 9/10 Chowk", "Sector 8/9 Chowk", "Sector 8 Market", "CU (Pb)"],
  route_22: ["Sector 7 Market", "Sector 7/8 Chowk", "Sector 6/7 Chowk", "Sector 6 Market", "CU (Pb)"],
  route_23: ["Sector 5 Market", "Sector 5/6 Chowk", "Sector 4/5 Chowk", "Sector 4 Market", "CU (Pb)"],
  route_24: ["Sector 3 Market", "Sector 3/4 Chowk", "Sector 2/3 Chowk", "Sector 2 Market", "CU (Pb)"],
  route_25: ["Sector 1 Market", "Sector 1/2 Chowk", "MDC Chowk", "IT Park Lights", "CU (Pb)"],
  route_26: ["Manimajra Town", "Housing Board Chowk", "Modern Housing Complex", "Railway Crossing", "CU (Pb)"],
  route_27: ["Zirakpur Lights", "VIP Road", "Baltana Lights", "Peer Muchalla", "CU (Pb)"],
  route_28: ["Derabassi Bus Stand", "Bhankarpur", "Lalru", "Handesra", "CU (Pb)"],
  route_29: ["Kharar Bus Stand", "Sunny Enclave", "Gillco Valley", "Landran", "CU (Pb)"],
  route_30: ["Mohali Phase 1", "Phase 2", "Phase 3", "Phase 4", "CU (Pb)"]
};

const routes_part_5 = {
  route_31: ["Mohali Phase 5", "Phase 6", "Phase 7", "Phase 8", "CU (Pb)"],
  route_32: ["Phase 9", "Phase 10", "Phase 11", "Phase 3B2", "CU (Pb)"],
  route_33: ["Phase 4", "Phase 5 Market", "Phase 6 Market", "Phase 7 Market", "CU (Pb)"],
  route_34: ["3B2 Market", "Phase 11 Market", "Phase 10 Market", "Phase 9 Market", "CU (Pb)"],
  route_35: ["Kumbra", "Sohana", "Sector 78", "Sector 79", "CU (Pb)"],
  route_36: ["Sector 80", "Sector 81", "Sector 82", "Sector 83", "CU (Pb)"],
  route_37: ["Sector 84", "Sector 85", "Sector 86", "Sector 87", "CU (Pb)"],
  route_38: ["Sector 88", "Sector 89", "Sector 90", "Sector 91", "CU (Pb)"],
  route_39: ["Sector 92", "Sector 93", "Sector 94", "Sector 95", "CU (Pb)"],
  route_40: ["Sector 96", "Sector 97", "Sector 98", "Sector 99", "CU (Pb)"]
};

const routes_part_6 = {
  route_41: ["Sector 100", "Sector 101", "Sector 102", "Sector 103", "CU (Pb)"],
  route_42: ["Baltana Phatak", "Sabzi Market Baltana", "Tribune Colony", "CU (Pb)"],
  route_43: ["Sector 10/11 Panchkula", "Amartex", "Sector 12 Bridge", "Dhakoli Bridge", "CU (Pb)"],
  route_44: ["Dhakoli Village", "Peer Muchalla", "High Ground Road", "CU (Pb)"],
  route_45: ["Zirakpur Bus Stand", "Patiala Chowk", "Lohgarh", "CU (Pb)"],
  route_46: ["Dera Bassi", "Barwala Road", "Handesra", "CU (Pb)"],
  route_47: ["Pinjore", "Kalka Bus Stand", "Parwanoo", "CU (Pb)"],
  route_48: ["Sector 6 Panchkula", "Sector 7 Panchkula", "Sector 8 Panchkula", "Sector 9 Panchkula", "CU (Pb)"],
  route_49: ["Dharampur", "Raunak Hotel", "Pinjore Police Station", "CU (Pb)"],
  route_50: ["Manimajra", "Railway Station", "IT Park", "CU (Pb)"]
};

const routes_part_7 = {
  route_51: ["Chandimandir", "Mansa Devi Complex", "Sector 5 Panchkula", "Sector 4 Panchkula", "CU (Pb)"],
  route_52: ["HMT", "Majri Chowk", "NIS", "Officer Colony", "Polo Ground", "CU (Pb)"],
  route_53: ["Raipur Rani", "Barwala", "Bhogpur", "CU (Pb)"],
  route_54: ["Morni Road", "Tikkar Taal", "Morni Hills", "CU (Pb)"],
  route_55: ["Kharar Bus Stand", "Sunny Enclave", "Sector 125", "Sector 127", "CU (Pb)"],
  route_56: ["Landran", "Sante Majra", "Gillco Valley", "CU (Pb)"],
  route_57: ["Phase 1 Mohali", "Phase 2 Mohali", "Phase 3 Mohali", "Phase 4 Mohali", "CU (Pb)"],
  route_58: ["Phase 5 Mohali", "Phase 6 Mohali", "Phase 7 Mohali", "Phase 8 Mohali", "CU (Pb)"],
  route_59: ["Sector 70 Mohali", "Sector 71", "Sector 72", "Sector 73", "CU (Pb)"],
  route_60: ["Sector 74", "Sector 75", "Sector 76", "Sector 77", "CU (Pb)"],
  route_61: ["Sector 78", "Sector 79", "Sector 80", "Sector 81", "CU (Pb)"],
  route_62: ["Sector 82", "Sector 83", "Sector 84", "Sector 85", "CU (Pb)"],
  route_63: ["Sector 86", "Sector 87", "Sector 88", "Sector 89", "CU (Pb)"],
  route_64: ["Sector 90", "Sector 91", "Sector 92", "Sector 93", "CU (Pb)"],
  route_65: ["Sector 94", "Sector 95", "Sector 96", "Sector 97", "CU (Pb)"],
  route_66: ["Sector 98", "Sector 99", "Sector 100", "Sector 101", "CU (Pb)"],
  route_67: ["Sector 102", "Sector 103", "Sector 104", "Sector 105", "CU (Pb)"],
  route_68: ["Verka Chowk", "Thapar College", "Police Lines", "Dukh Niwaran Sahib", "New Bus Stand", "CU (Pb)"],
  route_69: ["Shahbad", "Saha", "Indra Chowk", "CU (Pb)"],
  route_70: ["Ambala Cantt", "Ambala City", "Baldev Nagar", "CU (Pb)"]
};

const routes_part_8 = {
  route_71: ["Preet Nagar", "Mahesh Nagar", "CU (Pb)"],
  route_72: ["Shahbad Bus Stand", "Mohra", "CU (Pb)"],
  route_73: ["Khanna Bus Stand", "CU (Pb)"],
  route_74: ["Samrala Chowk", "Machhiwara", "CU (Pb)"],
  route_75: ["Sanipur Road", "Madhavpur Chowk", "Basantpura", "Simran Dhaba", "CU (Pb)"],
  route_76: ["Ludhiana Bus Stand", "Sherpur Chowk", "Sahnewal", "CU (Pb)"],
  route_77: ["Doraha", "Payal", "Khamano", "CU (Pb)"],
  route_78: ["Sirhind", "Fatehgarh Sahib", "Bassi Pathana", "CU (Pb)"],
  route_79: ["Rajpura Bus Stand", "Banur", "CU (Pb)"],
  route_80: ["Patiala Bus Stand", "Rajpura", "Banur", "CU (Pb)"]
};

const routes_part_9 = {
  route_81: ["Derabassi", "Barwala", "CU (Pb)"],
  route_82: ["Zirakpur", "VIP Road", "CU (Pb)"],
  route_83: ["Baltana", "Peer Muchalla", "CU (Pb)"],
  route_84: ["Dhakoli", "High Ground Road", "CU (Pb)"],
  route_85: ["Panchkula Sector 20", "Sector 21", "Sector 25", "CU (Pb)"],
  route_86: ["Panchkula Sector 15", "Sector 14", "Sector 11", "CU (Pb)"],
  route_87: ["Pinjore", "Kalka", "Parwanoo", "CU (Pb)"],
  route_88: ["Chandigarh Railway Station", "Industrial Area Phase 1", "Industrial Area Phase 2", "CU (Pb)"],
  route_89: ["IT Park", "Manimajra", "Housing Board", "CU (Pb)"],
  route_90: ["Naya Gaon", "Dhanas", "CU (Pb)"]
};

const routes_part_10 = {
  route_91: ["Preet Nagar", "Mahesh Nagar", "CU (Pb)"],
  route_92: ["Baldev Nagar Phatak", "Manji Sahib Gurudwara", "CU (Pb)"],
  route_93: ["Sector 09", "CU (Pb)"],
  route_94: ["Session Court", "Prem Nagar P.P", "Inko", "Model Town", "CU (Pb)"],
  route_95: ["Police Line", "Kalka Chowk", "CU (Pb)"],
  route_96: ["Sector 10", "Sector 10 Gurudwara Sahib", "CU (Pb)"],
  route_97: ["Moon Palace", "New Grain Market (TVS Motors)", "Polytechnic Chowk (Panchayat Bhawan)", "CU (Pb)"],
  route_98: ["Anand Nishikawa (Laja Dhaba)", "Omaxe", "Sadopur Phatak", "Naraingarh Chowk", "CU (Pb)"],
  route_99: ["Durga Nagar P.P", "Agrasen Chowk", "Shambu Petrol Pump", "CU (Pb)"],
  route_100: ["Galaxy Fun Cinema", "Jandli", "CU (Pb)"],
  route_101: ["Manji Sahib Gurudwara", "Punjabi Dhaba (Shambhu)", "CU (Pb)"],
  route_102: ["Sector 08", "Manav Chowk", "CU (Pb)"],
  route_107: ["Savita Hospital", "K K School", "Anaj Mandi", "Durga Mandir Gate", "Sat Narayan Mandir", "Singh Sabha Gurudwara", "AP Jain Hospital", "Alpus Cinema", "Bus Stand", "Dalima Vihar", "ITI Lights", "CU (Pb)"],
  route_110: ["Metro", "M Care Hospital", "Surya Tower", "Jayapuria Market", "Maya Garden", "CU (Pb)"],
  route_111: ["Domino's", "CU (Pb)"],
  route_112: ["Trishala City", "Highland Park", "Leaf Stone Society", "Mysp Society", "CU (Pb)"],
  route_113: ["Behlana (Airforce Chowk)", "Zirakpur (Fauji Dhaba)", "Keshav Hospital", "CU (Pb)"],
  route_115: ["Axis Bank ATM", "Gulmohar City (DAV School)", "Silver City Theme", "Mubarikpur", "Bhankarpur", "Bela Home", "CU (Pb)"],
  route_116: ["Derabassi Bus Stand", "Jangpura", "CU (Pb)"],
  route_117: ["Raipur Rani Bus Stand", "Mouli (Police Station)", "Barwala Bus Stand", "Derabassi Bus Stand", "CU (Pb)"],
  route_121: ["Sanipur Road", "New Bus Stand", "Madhavpur Chowk", "Basantpura", "Simran Dhaba", "Amarjit Palace", "Gagan Chowk", "CU (Pb)"],
  route_122: ["Khanna Bus Stand", "Gobindgarh Bus Stand", "Amloh Chowk", "CU (Pb)"],
  route_123: ["Khanna Bus Stand", "CU (Pb)"],
  route_124: ["Bassi Pathana Bus Stand", "Bassi ITI Chowk", "Fatehgarh Sahib", "Jyoti Swarup Lights", "Dashmesh Hospital", "4 No Chungi", "Chawla Chowk", "CU (Pb)"],
  route_125: ["Shahbad Bus Stand", "Mohra", "CU (Pb)"]
};

export const MASTER_ROUTES = {
  ...routes_part_1,
  ...routes_part_2,
  ...routes_part_3,
  ...routes_part_4,
  ...routes_part_5,
  ...routes_part_6,
  ...routes_part_7,
  ...routes_part_8,
  ...routes_part_9,
  ...routes_part_10
};