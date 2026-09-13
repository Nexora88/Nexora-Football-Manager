/* NEXORA FOOTBALL MANAGER — FICTIONAL WORLD PLAYER DATABASE
   Every generated player is fictional. No real-player names, images or likenesses are used. */
(()=>{
  const first={gb:['Jack','Liam','Noah','Theo','Mason','Elliot','Harvey','Callum','Oscar','Finley','Lewis','Archie','Reece','Jude','Charlie','Ben','Ryan','Tom'],es:['Alejandro','Mateo','Hugo','Diego','Iker','Sergio','Adrián','Álvaro','Nico','Gael','Pablo','Mario','Iván','Bruno','Dani','Marcos','Leo','Unai'],it:['Luca','Matteo','Davide','Marco','Alessio','Tommaso','Federico','Riccardo','Andrea','Gabriele','Nicolò','Samuele','Edoardo','Filippo','Pietro','Michele','Daniele','Lorenzo'],de:['Lukas','Jonas','Finn','Leon','Noah','Emil','Felix','Paul','Max','Julian','Moritz','Niklas','Timo','Jan','Ben','Mats','Oskar','Anton']};
  const last={gb:['Bennett','Carter','Hayes','Turner','Foster','Mills','Cooper','Walsh','Parker','Collins','Reed','Morgan','Brooks','Ward','Hughes','Price','Dawson','Clarke'],es:['Navarro','Serrano','Vidal','Molina','Rivas','Campos','Santos','Ortega','Paredes','Fuentes','Cabrera','Méndez','Pastor','Ibáñez','Soler','Rey','Nieto','Vega'],it:['Rossi','Conti','Marino','Rinaldi','Ferrari','Moretti','Gallo','Costa','De Luca','Romano','Bianchi','Esposito','Fabbri','Greco','Fontana','Caruso','Villa','Serra'],de:['Schneider','Wagner','Fischer','Weber','Meyer','Klein','Wolf','Schulz','Neumann','Kraus','Hoffmann','Bauer','Richter','Keller','Brandt','Vogel','Hartmann','Becker']};
  const pos=['GK','GK','RB','CB','CB','LB','DM','CM','CM','AM','RW','LW','ST','ST','CB','RB','LB','CM','AM','RW','ST','GK'];
  const make=(club)=>{
    const league=club.leagueCountry||'gb', a=first[league]||first.gb, b=last[league]||last.gb;
    const seed=[...club.id].reduce((n,c)=>n+c.charCodeAt(0),0);
    return Array.from({length:22},(_,i)=>{
      const age=i<5?17+(seed+i)%4:19+((seed+i*3)%13);
      const prospect=i<6;
      const base=Math.max(54,Math.min(83,(club.reputation||60)-18+((seed+i*7)%18)));
      const rating=Math.min(84,base+(prospect?Math.floor((seed+i)%4):0));
      const potential=Math.min(92,Math.max(rating+2,rating+(prospect?10+((seed+i)%9):3+((seed+i)%7))));
      const name=`${a[(seed+i*5)%a.length]} ${b[(seed+i*7)%b.length]}`;
      const pace=58+((seed+i*9)%38), passing=56+((seed+i*11)%39), shooting=48+((seed+i*13)%45), defending=49+((seed+i*17)%44), dribbling=53+((seed+i*8)%43), physical=57+((seed+i*6)%40), vision=52+((seed+i*12)%44);
      return {id:`${club.id}-p${i+1}`,name,pos:pos[i],rating,pace,passing,shooting,defending,dribbling,physical,vision,value:Math.round((rating-45)*220000+(potential-rating)*350000+500000),fitness:90,morale:78,age,potential,growth:prospect?'HIGH':potential-rating>=8?'MEDIUM':'LOW',role:prospect?'YOUNG TALENT':'FIRST TEAM',wage:Math.round(5000+rating*950),contract:2+(i%4),nationality:league,academy:prospect};
    });
  };
  window.NEXORA_FICTIONAL_PLAYER_FACTORY=club=>club?.leagueCountry==='tr'?null:make(club);
  window.NEXORA_FICTIONAL_ACADEMY=club=>make({...club,id:`${club.id}-academy`}).filter(p=>p.academy).slice(0,6);
})();