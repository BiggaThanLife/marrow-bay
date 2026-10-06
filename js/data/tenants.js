"use strict";
/* Tenant data: names, jobs, backgrounds, traits, and the problems a landlord deals with. */
const T_FIRST=['Ada','Bram','Cass','Dario','Elin','Farid','Greta','Hugo','Imani','Joss','Kenji','Lucia','Mateo','Noor','Orla','Pavel','Quinn','Rosa','Sven','Tamsin','Uma','Viktor','Wanda','Xavi','Yara','Zane','Bea','Cyrus','Dell','Esme','Finn','Gus','Hallie','Ines','Jun','Kira','Leif','Mara','Nico','Opal'];
const T_FEM=['Ada','Elin','Greta','Imani','Lucia','Noor','Orla','Rosa','Tamsin','Uma','Wanda','Yara','Bea','Esme','Hallie','Ines','Kira','Mara','Opal'];
const T_NEUTRAL=['Cass','Joss','Quinn','Dell','Jun'];
const T_LAST=['Alder','Brandt','Castillo','Dunn','Egan','Frost','Gallo','Hart','Iyer','Jansen','Kovac','Lowry','Marsh','Nakamura','Okafor','Pruitt','Quill','Rivera','Stroud','Tran','Ulrich','Vega','Wexler','Yates','Zhou','Ashby','Boyd','Crane','Doyle','Ellis'];
/* inc scales the rent they can pay */
const T_JOBS=[
  {j:'dock hand',inc:.9},{j:'line cook',inc:.85},{j:'night clerk',inc:.85},{j:'courier',inc:.8},{j:'busker',inc:.7},{j:'student',inc:.7},
  {j:'retired fisher',inc:.8},{j:'foundry welder',inc:1.1},{j:'nurse',inc:1.15},{j:'bank teller',inc:1.25},{j:'market trader',inc:1.15},
  {j:'tram driver',inc:1.0},{j:'electrician',inc:1.2},{j:'barista',inc:.8},{j:'bookkeeper',inc:1.2},{j:'farmhand',inc:.75},{j:'bouncer',inc:1.0},{j:'fixer\'s runner',inc:1.05}
];
const T_BACK=[
  'moved in from the Greenbelt after the harvest came up short.','lost a place to the rising tide and needs somewhere dry.','just broke up with a flatmate and needs their own door.',
  'has worked the same shift for nine years and wants a quiet life.','grew up two streets over and never left.','came to Marrow Bay for a job that fell through, and stayed anyway.',
  'is saving up to open a stall of their own.','sends half of every pay home.','got out of a bad lease across the bridge.','is new in town and does not say much about before.',
  'used to own a boat. Does not talk about the boat.','is between jobs and swears it is temporary.','takes night work and sleeps all day.','has a cat and a long story about the cat.'
];
const T_TRAITS={
  tidy:{n:'Tidy',hint:'Spotless references and a neat handshake.',chat:['Keeps the hallway swept without being asked.','Shows you a very clean kitchen. They are proud of it.']},
  noisy:{n:'Noisy',hint:'Mentions a drum kit, then laughs it off.',chat:['Has friends over most nights. They all seem lovely, and loud.','Apologizes in advance for "some music."']},
  behind:{n:'Always short',hint:'Asks if the due date is "flexible."',chat:['Says money has been tight. It has been tight for a while.','Promises the rest on Friday. Which Friday is unclear.']},
  nosy:{n:'Nosy',hint:'Asks about every neighbour before even seeing the room.',chat:['Knows who is dating whom on the whole street.','Leans in. "You did not hear it from me."']},
  handy:{n:'Handy',hint:'Arrived with their own toolbox.',chat:['Already fixed a hinge that was not on any list.','Offers to look at the pipes themselves.']},
  secretive:{n:'Secretive',hint:'Gives no previous address.',chat:['Keeps the blinds shut. Pays on time, though.','Changes the subject when you ask what they do for work.']}
};
const T_TRAIT_IDS=Object.keys(T_TRAITS);
const T_GRIPE=['Mentions that the building is not what they expected.','Sighs and says some things around here need attention.','Is polite, but clearly counting the days left on the lease.'];
/* problems: cost to hire out, parts to do it yourself */
const T_ISSUES={
  leak:{n:'Leaking pipe',cost:45,parts:1,text:'There is a leak under the kitchen sink.'},
  heat:{n:'No heating',cost:70,parts:2,text:'The heating has died and the nights are cold.'},
  pests:{n:'Pests',cost:35,parts:0,text:'Something has been in the pantry. Several somethings.'},
  noise:{n:'Noise complaints',cost:0,parts:0,text:'The neighbours say the noise from this flat goes on past midnight.'},
  late:{n:'Rent overdue',cost:0,parts:0,text:'They have fallen several days behind on rent.'},
  secret:{n:'Unwelcome visitors',cost:0,parts:0,text:'Two people in coats came asking after this tenant.'}
};
