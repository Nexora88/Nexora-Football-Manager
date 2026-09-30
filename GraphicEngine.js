// Nexora AAA 2.5D Grafik Motoru Başlatıcı
(async () => {
    // 1. Ekran Kartı Tabanlı (WebGL) Yeni Grafik Alanı Oluştur
    const app = new PIXI.Application();
    
    // 2. Grafik Ayarlarını Yapılandır (Koyu Siber Tema Altyapısı)
    await app.init({ 
        background: '#0a0d14', // Premium koyu askeri komuta merkezi arka planı
        resizeTo: window,      // Ekran boyutuna otomatik uyum sağla
        antialias: true        // AAA Kalite için pürüzsüz kenarlar (Anti-aliasing)
    });

    // 3. Oluşturulan 2.5D Ekranı index.html İçine Enjekte Et
    document.body.appendChild(app.canvas);

    console.log("Nexora WebGL AAA 2.5D Grafik Motoru Başarıyla Devreye Girdi!");

    // --- ÖRNEK: ULTRA AKICI BİR FUTBOLCU / ASKER PİYONU ÇİZELİM ---
    
    // Bir grafik objesi oluşturuyoruz (Neon Parlamalı Oyuncu İkonu)
    const playerNode = new PIXI.Graphics();
    
    // Siber/Neon Yeşil Renk (Border ve İç Dolgu)
    playerNode.stroke({ width: 3, color: 0x00ffcc });
    playerNode.fill({ color: 0x0a2f29 });
    playerNode.drawCircle(0, 0, 20); // 20px çapında bir piyon çiz
    
    // Piyonun başlangıç pozisyonu (Sahanın/Haritanın ortası)
    playerNode.x = window.innerWidth / 2;
    playerNode.y = window.innerHeight / 2;
    
    // Ekrana ekle
    app.stage.addChild(playerNode);

    // --- ANIMASYON VE OYUN DÖNGÜSÜ (60-144 FPS Ticker) ---
    let time = 0;
    app.ticker.add((ticker) => {
        time += ticker.deltaTime * 0.05;
        
        // Piyonun havada süzülüyormuş gibi yumuşakça hareket etmesini sağlayan 2.5D efekti
        playerNode.y = (window.innerHeight / 2) + Math.sin(time) * 30;
        playerNode.x = (window.innerWidth / 2) + Math.cos(time) * 10;
    });

})();
