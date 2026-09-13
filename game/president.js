const presidents = [
  { name: "Ali Karahan", type: "Sabırsız Başkan", patience: 30, bonus: "transfer" },
  { name: "Mehmet Yılmaz", type: "Altyapı Başkanı", patience: 80, bonus: "academy" },
  { name: "Serdar Aydın", type: "Medya Başkanı", patience: 50, bonus: "media" }
];

function getRandomPresident(){
  return presidents[Math.floor(Math.random() * presidents.length)];
}
