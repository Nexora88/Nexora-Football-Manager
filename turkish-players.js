/* NEXORA FOOTBALL MANAGER — FICTIONAL TURKISH PLAYER DATABASE
   All names below are fictional. No real-player names, images or likenesses are used. */
(function(){
  const P=(id,name,pos,rating,pace,passing,shooting,defending,dribbling,physical,vision,value,age)=>({id,name,pos,rating,pace,passing,shooting,defending,dribbling,physical,vision,value,fitness:92,morale:80,age});
  const S={
    ays:['Efe Karaca','Mertcan Yıldız','Kaan Şahin','Berkay Tunç','Emirhan Koç','Alp Demir','Doruk Aydın','Yiğit Kılıç','Oğuzhan Kaya','Aras Çelik','Kerem Aksoy','Bora Yalın','Umut Ersoy','Canberk Polat','Mete Arslan','Burak Keskin','Furkan Taş','Deniz Güneş'],
    mrk:['Barış Koral','Emrehan Sönmez','Tuna Arslan','Mert Ekin','Kıvanç Demir','Okan Yüce','Berk Özdem','Eren Kılıç','Alperen Çetin','Doruk Vural','Keremcan Şen','Batuhan Kaya','Arda Koral','Serhat Aydın','Onur Polat','Metehan Akın','Cemreş Yıldız','Tolga Erdem'],
    eaf:['Aras Yılmaz','Egehan Demir','Mertcan Özkan','Bora Kılıç','Kuzey Aydın','Emir Şen','Yiğit Karaca','Cenk Kaya','Doruk Ergin','Kaan Yalçın','Berkay Güneş','Alper Çetin','Eren Vural','Can Aksoy','Umut Demir','Mete Korkut','Baran Tunç','Ozan Yıldız'],
    tb26:['Eren Kalkan','Muratcan Şen','Berk Efe','Kaan Kurt','Arda Tunç','Yiğit Keskin','Emir Korkmaz','Doruk Çakır','Metehan Yıldız','Cem Arslan','Oğuz Kılıç','Baran Acar','Umut Güler','Efe Korkut','Serkan Demir','Alp Şahin','Deniz Polat','Burak Ekin'],
    ib:['Kuzey Demir','Mert Koral','Emirhan Arslan','Bora Ekin','Kerem Şahin','Aras Korkmaz','Berkay Yalçın','Ege Tunç','Yiğit Acar','Kaan Erdem','Doruk Kaya','Barış Çelik','Ozan Kılıç','Mete Yüce','Can Polat','Eren Akın','Umut Şen','Tolga Demir'],
    kfk:['Tuna Karaca','Efe Yıldız','Mertcan Kaya','Emir Korkmaz','Bora Şahin','Kaan Aydın','Alp Eren','Doruk Demir','Yiğit Çelik','Berkay Korkut','Arda Polat','Metehan Şen','Eren Aksoy','Baran Yalçın','Caner Tunç','Oğuz Arslan','Umut Kalkan','Serhat Kaya'],
    b1910:['Anıl Demir','Mert Kılıç','Emirhan Aydın','Kaan Şen','Bora Kaya','Efe Yalçın','Yiğit Arslan','Doruk Polat','Berk Ekin','Arda Çelik','Mete Kurt','Ozan Koral','Eren Tunç','Baran Demir','Can Korkut','Umut Acar','Kerem Güneş','Tolga Şahin'],
    akb:['Ege Korkmaz','Mertcan Acar','Emir Yalın','Bora Demir','Kaan Güneş','Efe Şen','Arda Kılıç','Yiğit Kaya','Doruk Yüce','Berkay Polat','Metehan Tunç','Eren Karaca','Caner Aydın','Ozan Çelik','Umut Arslan','Serhat Demir','Alp Kalkan','Baran Ekin'],
    kps:['Kuzey Şahin','Efe Korkut','Mertcan Kaya','Emirhan Demir','Berk Yalçın','Kaan Çelik','Arda Ekin','Yiğit Acar','Doruk Kılıç','Metehan Kaya','Eren Şen','Bora Polat','Ozan Aydın','Can Demir','Umut Koral','Alp Tunç','Baran Şahin','Serkan Yıldız'],
    dys:['Efe Arslan','Kaan Kurt','Mertcan Demir','Bora Yıldız','Emir Kılıç','Yiğit Aydın','Arda Şen','Berkay Kaya','Doruk Korkmaz','Mete Ekin','Eren Polat','Can Yalçın','Umut Çelik','Ozan Tunç','Baran Acar','Alp Demir','Serhat Güneş','Tolga Kılıç'],
    m1907:['Mert Koral','Ege Demir','Emirhan Şahin','Kaan Yüce','Bora Kılıç','Efe Arslan','Yiğit Kaya','Arda Tunç','Berk Ekin','Doruk Çelik','Metehan Korkut','Eren Aydın','Ozan Polat','Can Kılıç','Umut Demir','Baran Şen','Alp Yalçın','Serkan Acar'],
    cuk:['Aras Demir','Mertcan Şahin','Efe Kaya','Emirhan Korkmaz','Kaan Aydın','Bora Yüce','Yiğit Kılıç','Arda Demir','Berkay Tunç','Doruk Arslan','Mete Koral','Eren Çelik','Can Polat','Ozan Güneş','Umut Kaya','Baran Korkut','Alp Şen','Serhat Yalçın'],
    ban:['Ege Yalın','Mert Korkut','Kaan Demir','Bora Şen','Emir Acar','Efe Çelik','Arda Kaya','Yiğit Polat','Berk Yüce','Doruk Tunç','Metehan Demir','Eren Güneş','Can Arslan','Ozan Kılıç','Umut Aydın','Baran Ekin','Alp Şahin','Serkan Kaya'],
    k1967:['Mertcan Kalkan','Efe Demir','Emirhan Yıldız','Kaan Kılıç','Bora Acar','Arda Şahin','Yiğit Demir','Berkay Kaya','Doruk Yalçın','Mete Tunç','Eren Korkut','Can Çelik','Ozan Arslan','Umut Polat','Baran Aydın','Alp Koral','Serhat Ekin','Tolga Demir'],
    ias:['Kuzey Acar','Mertcan Kaya','Efe Yalçın','Emir Demir','Kaan Korkut','Bora Şahin','Arda Kılıç','Yiğit Tunç','Berk Ekin','Doruk Aydın','Metehan Çelik','Eren Polat','Can Güneş','Ozan Demir','Umut Şahin','Baran Koral','Alp Yıldız','Serkan Kaya'],
    ak07:['Efe Kalkan','Mert Demir','Emirhan Acar','Kaan Şahin','Bora Korkmaz','Arda Yalçın','Yiğit Kaya','Berkay Ekin','Doruk Kılıç','Mete Tunç','Eren Demir','Can Aydın','Ozan Çelik','Umut Arslan','Baran Polat','Alp Şen','Serhat Korkut','Tolga Kaya'],
    eb:['Mertcan Yüce','Efe Arslan','Emir Demir','Kaan Tunç','Bora Korkut','Arda Kaya','Yiğit Aydın','Berk Şahin','Doruk Ekin','Metehan Polat','Eren Çelik','Can Demir','Ozan Kılıç','Umut Yalçın','Baran Kaya','Alp Güneş','Serkan Tunç','Tolga Acar'],
    bog:['Aras Koral','Mert Demir','Emirhan Kaya','Kaan Şahin','Bora Yalçın','Efe Kılıç','Yiğit Demir','Arda Ekin','Berkay Acar','Doruk Kaya','Metehan Şen','Eren Çelik','Can Polat','Ozan Demir','Umut Korkut','Baran Arslan','Alp Yüce','Serhat Kılıç']
  };
  const pos=['GK','GK','RB','CB','CB','LB','DM','CM','CM','AM','RW','LW','ST','ST','CB','RB','LB','CM'];
  const make=(club,names)=>names.map((name,i)=>{
    const p=pos[i], base=club==='ib'?68:club==='mrk'||club==='b1910'||club==='bog'?65:61;
    const r=base+((i*7+club.length*3)%15)-4;
    const pace=62+((i*9+club.length)%32), passing=58+((i*11+3)%35), shooting=48+((i*13+7)%43), defending=50+((i*17+5)%43), dribbling=55+((i*8+2)%40), physical=60+((i*6+club.length)%35), vision=55+((i*12+4)%40);
    return P(`${club}-${i+1}`,name,p,Math.min(84,Math.max(57,r)),pace,passing,shooting,defending,dribbling,physical,vision,Math.round((r-50)*150000+700000),19+(i%13));
  });
  const DB={}; Object.keys(S).forEach(id=>DB[id]=make(id,S[id]));
  window.NEXORA_TURKISH_PLAYER_FACTORY=(club)=>DB[club?.id]||null;
})();