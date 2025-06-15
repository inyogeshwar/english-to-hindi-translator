class EnglishToHindiTranslator {
    constructor() {
        this.initializeElements();
        this.initializeTheme();
        this.bindEvents();
        this.loadHistory();
        this.translations = this.getOfflineTranslations();
        
        // Multiple API endpoints for better reliability
        this.apiEndpoints = [
            {
                name: 'MyMemory',
                url: 'https://api.mymemory.translated.net/get',
                method: 'GET',
                formatUrl: (word) => `${this.apiEndpoints[0].url}?q=${encodeURIComponent(word)}&langpair=en|hi`,
                parseResponse: (data) => data.responseStatus === 200 ? data.responseData.translatedText : null
            },
            {
                name: 'LibreTranslate',
                url: 'https://libretranslate.de/translate',
                method: 'POST',
                body: (word) => JSON.stringify({
                    q: word,
                    source: 'en',
                    target: 'hi',
                    format: 'text'
                }),
                parseResponse: (data) => data.translatedText || null
            },
            {
                name: 'LibreTranslateAlt',
                url: 'https://translate.argosopentech.com/translate',
                method: 'POST',
                body: (word) => JSON.stringify({
                    q: word,
                    source: 'en',
                    target: 'hi'
                }),
                parseResponse: (data) => data.translatedText || null
            }
        ];
        
        this.requestCount = this.loadRequestCount();
        this.maxDailyRequests = 900;
        this.initializeRippleEffect();
        this.initializeAnimations();
        this.currentApiIndex = 0;
    }

    initializeElements() {
        this.englishInput = document.getElementById('englishInput');
        this.translateBtn = document.getElementById('translateBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('errorMessage');
        this.englishWord = document.getElementById('englishWord');
        this.hindiTranslation = document.getElementById('hindiTranslation');
        this.hindiPronunciation = document.getElementById('hindiPronunciation');
        this.romanizedPronunciation = document.getElementById('romanizedPronunciation');
        this.speakBtn = document.getElementById('speakBtn');
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.themeSwitch = document.getElementById('theme-switch');
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme === 'auto' ? (prefersDark ? 'dark' : 'light') : savedTheme;
        
        this.setTheme(theme);
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (localStorage.getItem('theme') === 'auto') {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.themeSwitch.checked = theme === 'dark';
        localStorage.setItem('theme', theme);
        this.animateThemeTransition();
    }

    animateThemeTransition() {
        document.body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    bindEvents() {
        this.translateBtn.addEventListener('click', () => this.translateWord());
        this.englishInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.translateWord();
            }
        });
        
        this.speakBtn.addEventListener('click', () => this.speakHindi());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        this.themeSwitch.addEventListener('change', (e) => {
            this.setTheme(e.target.checked ? 'dark' : 'light');
        });

        this.englishInput.addEventListener('focus', () => {
            this.englishInput.style.transform = 'scale(1.02)';
            this.addInputGlow();
        });
        
        this.englishInput.addEventListener('blur', () => {
            this.englishInput.style.transform = 'scale(1)';
            this.removeInputGlow();
        });

        this.englishInput.addEventListener('input', () => {
            this.animateInputTyping();
        });

        document.querySelectorAll('.word-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const word = chip.getAttribute('data-word');
                this.animateChipClick(chip);
                this.englishInput.value = word;
                this.englishInput.focus();
                setTimeout(() => this.translateWord(), 300);
            });
        });

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.themeSwitch.click();
            }
            
            if (e.key === 'Escape' && this.englishInput.value) {
                this.englishInput.value = '';
                this.englishInput.focus();
                this.hideAll();
            }
        });
    }

    addInputGlow() {
        this.englishInput.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.3)';
    }

    removeInputGlow() {
        this.englishInput.style.boxShadow = '';
    }

    animateInputTyping() {
        this.englishInput.style.borderColor = 'var(--accent-primary)';
        setTimeout(() => {
            this.englishInput.style.borderColor = '';
        }, 200);
    }

    animateChipClick(chip) {
        chip.style.transform = 'scale(0.95)';
        chip.style.filter = 'brightness(1.2)';
        setTimeout(() => {
            chip.style.transform = '';
            chip.style.filter = '';
        }, 150);
    }

    initializeAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.translator-card, .popular-words, .history-section').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    getOfflineTranslations() {
        return {
            // ==================== HELPING VERBS ====================
            // Primary Helping Verbs
            'be': { hindi: 'होना', pronunciation: 'होना', romanized: 'hona' },
            'is': { hindi: 'है', pronunciation: 'है', romanized: 'hai' },
            'am': { hindi: 'हूँ', pronunciation: 'हूँ', romanized: 'hun' },
            'are': { hindi: 'हो/हैं', pronunciation: 'हो/हैं', romanized: 'ho/hain' },
            'was': { hindi: 'था/थी', pronunciation: 'था/थी', romanized: 'tha/thi' },
            'were': { hindi: 'थे/थीं', pronunciation: 'थे/थीं', romanized: 'the/thin' },
            'been': { hindi: 'रहा/रही', pronunciation: 'रहा/रही', romanized: 'raha/rahi' },
            'being': { hindi: 'होकर', pronunciation: 'होकर', romanized: 'hokar' },
            
            'have': { hindi: 'है/रखना', pronunciation: 'है/रखना', romanized: 'hai/rakhna' },
            'has': { hindi: 'है/रखा है', pronunciation: 'है/रखा है', romanized: 'hai/rakha hai' },
            'had': { hindi: 'था/रखा था', pronunciation: 'था/रखा था', romanized: 'tha/rakha tha' },
            'having': { hindi: 'रखकर', pronunciation: 'रखकर', romanized: 'rakhkar' },
            
            'do': { hindi: 'करना', pronunciation: 'करना', romanized: 'karna' },
            'does': { hindi: 'करता/करती है', pronunciation: 'करता/करती है', romanized: 'karta/karti hai' },
            'did': { hindi: 'किया', pronunciation: 'किया', romanized: 'kiya' },
            'done': { hindi: 'किया गया', pronunciation: 'किया गया', romanized: 'kiya gaya' },
            'doing': { hindi: 'करते हुए', pronunciation: 'करते हुए', romanized: 'karte hue' },
            
            // Modal Helping Verbs
            'can': { hindi: 'सकता/सकती है', pronunciation: 'सकता/सकती है', romanized: 'sakta/sakti hai' },
            'could': { hindi: 'सकता/सकती था', pronunciation: 'सकता/सकती था', romanized: 'sakta/sakti tha' },
            'may': { hindi: 'हो सकता है', pronunciation: 'हो सकता है', romanized: 'ho sakta hai' },
            'might': { hindi: 'शायद', pronunciation: 'शायद', romanized: 'shayad' },
            'will': { hindi: 'होगा/होगी', pronunciation: 'होगा/होगी', romanized: 'hoga/hogi' },
            'would': { hindi: 'होता/होती', pronunciation: 'होता/होती', romanized: 'hota/hoti' },
            'shall': { hindi: 'करूंगा/करूंगी', pronunciation: 'करूंगा/करूंगी', romanized: 'karunga/karungi' },
            'should': { hindi: 'चाहिए', pronunciation: 'चाहिए', romanized: 'chahiye' },
            'must': { hindi: 'जरूर/अवश्य', pronunciation: 'जरूर/अवश्य', romanized: 'zaroor/avashya' },
            'ought': { hindi: 'चाहिए', pronunciation: 'चाहिए', romanized: 'chahiye' },
            'need': { hindi: 'जरूरत', pronunciation: 'जरूरत', romanized: 'zaroorat' },
            'dare': { hindi: 'हिम्मत', pronunciation: 'हिम्मत', romanized: 'himmat' },
            'used': { hindi: 'इस्तेमाल किया', pronunciation: 'इस्तेमाल किया', romanized: 'istemal kiya' },
            
            // ==================== PRONOUNS ====================
            // Personal Pronouns (Subject)
            'i': { hindi: 'मैं', pronunciation: 'मैं', romanized: 'main' },
            'you': { hindi: 'तुम/आप', pronunciation: 'तुम/आप', romanized: 'tum/aap' },
            'he': { hindi: 'वह', pronunciation: 'वह', romanized: 'vah' },
            'she': { hindi: 'वह', pronunciation: 'वह', romanized: 'vah' },
            'it': { hindi: 'यह/वह', pronunciation: 'यह/वह', romanized: 'yah/vah' },
            'we': { hindi: 'हम', pronunciation: 'हम', romanized: 'hum' },
            'they': { hindi: 'वे', pronunciation: 'वे', romanized: 've' },
            
            // Personal Pronouns (Object)
            'me': { hindi: 'मुझे', pronunciation: 'मुझे', romanized: 'mujhe' },
            'him': { hindi: 'उसे/उसको', pronunciation: 'उसे/उसको', romanized: 'use/usko' },
            'her': { hindi: 'उसे/उसको', pronunciation: 'उसे/उसको', romanized: 'use/usko' },
            'us': { hindi: 'हमें', pronunciation: 'हमें', romanized: 'hamein' },
            'them': { hindi: 'उन्हें', pronunciation: 'उन्हें', romanized: 'unhein' },
            
            // Possessive Pronouns
            'my': { hindi: 'मेरा/मेरी', pronunciation: 'मेरा/मेरी', romanized: 'mera/meri' },
            'mine': { hindi: 'मेरा', pronunciation: 'मेरा', romanized: 'mera' },
            'your': { hindi: 'तुम्हारा/आपका', pronunciation: 'तुम्हारा/आपका', romanized: 'tumhara/aapka' },
            'yours': { hindi: 'तुम्हारा/आपका', pronunciation: 'तुम्हारा/आपका', romanized: 'tumhara/aapka' },
            'his': { hindi: 'उसका', pronunciation: 'उसका', romanized: 'uska' },
            'hers': { hindi: 'उसका', pronunciation: 'उसका', romanized: 'uska' },
            'its': { hindi: 'इसका/उसका', pronunciation: 'इसका/उसका', romanized: 'iska/uska' },
            'our': { hindi: 'हमारा', pronunciation: 'हमारा', romanized: 'hamara' },
            'ours': { hindi: 'हमारा', pronunciation: 'हमारा', romanized: 'hamara' },
            'their': { hindi: 'उनका', pronunciation: 'उनका', romanized: 'unka' },
            'theirs': { hindi: 'उनका', pronunciation: 'उनका', romanized: 'unka' },
            
            // Demonstrative Pronouns
            'this': { hindi: 'यह', pronunciation: 'यह', romanized: 'yah' },
            'that': { hindi: 'वह', pronunciation: 'वह', romanized: 'vah' },
            'these': { hindi: 'ये', pronunciation: 'ये', romanized: 'ye' },
            'those': { hindi: 'वे', pronunciation: 'वे', romanized: 've' },
            
            // Interrogative Pronouns
            'who': { hindi: 'कौन', pronunciation: 'कौन', romanized: 'kaun' },
            'whom': { hindi: 'किसे/किसको', pronunciation: 'किसे/किसको', romanized: 'kise/kisko' },
            'whose': { hindi: 'किसका', pronunciation: 'किसका', romanized: 'kiska' },
            'what': { hindi: 'क्या', pronunciation: 'क्या', romanized: 'kya' },
            'which': { hindi: 'कौन सा', pronunciation: 'कौन सा', romanized: 'kaun sa' },
            'when': { hindi: 'कब', pronunciation: 'कब', romanized: 'kab' },
            'where': { hindi: 'कहाँ', pronunciation: 'कहाँ', romanized: 'kahan' },
            'why': { hindi: 'क्यों', pronunciation: 'क्यों', romanized: 'kyon' },
            'how': { hindi: 'कैसे', pronunciation: 'कैसे', romanized: 'kaise' },
            
            // Relative Pronouns
            'whoever': { hindi: 'जो कोई भी', pronunciation: 'जो कोई भी', romanized: 'jo koi bhi' },
            'whomever': { hindi: 'जिसे भी', pronunciation: 'जिसे भी', romanized: 'jise bhi' },
            'whatever': { hindi: 'जो कुछ भी', pronunciation: 'जो कुछ भी', romanized: 'jo kuch bhi' },
            'whichever': { hindi: 'जो भी', pronunciation: 'जो भी', romanized: 'jo bhi' },
            
            // Indefinite Pronouns
            'someone': { hindi: 'कोई व्यक्ति', pronunciation: 'कोई व्यक्ति', romanized: 'koi vyakti' },
            'somebody': { hindi: 'कोई व्यक्ति', pronunciation: 'कोई व्यक्ति', romanized: 'koi vyakti' },
            'something': { hindi: 'कुछ', pronunciation: 'कुछ', romanized: 'kuch' },
            'anyone': { hindi: 'कोई भी', pronunciation: 'कोई भी', romanized: 'koi bhi' },
            'anybody': { hindi: 'कोई भी व्यक्ति', pronunciation: 'कोई भी व्यक्ति', romanized: 'koi bhi vyakti' },
            'anything': { hindi: 'कुछ भी', pronunciation: 'कुछ भी', romanized: 'kuch bhi' },
            'everyone': { hindi: 'सभी', pronunciation: 'सभी', romanized: 'sabhi' },
            'everybody': { hindi: 'सभी लोग', pronunciation: 'सभी लोग', romanized: 'sabhi log' },
            'everything': { hindi: 'सब कुछ', pronunciation: 'सब कुछ', romanized: 'sab kuch' },
            'no one': { hindi: 'कोई नहीं', pronunciation: 'कोई नहीं', romanized: 'koi nahin' },
            'nobody': { hindi: 'कोई व्यक्ति नहीं', pronunciation: 'कोई व्यक्ति नहीं', romanized: 'koi vyakti nahin' },
            'nothing': { hindi: 'कुछ नहीं', pronunciation: 'कुछ नहीं', romanized: 'kuch nahin' },
            'none': { hindi: 'कोई नहीं', pronunciation: 'कोई नहीं', romanized: 'koi nahin' },
            'few': { hindi: 'कुछ', pronunciation: 'कुछ', romanized: 'kuch' },
            'many': { hindi: 'कई', pronunciation: 'कई', romanized: 'kai' },
            'several': { hindi: 'कई', pronunciation: 'कई', romanized: 'kai' },
            'all': { hindi: 'सभी', pronunciation: 'सभी', romanized: 'sabhi' },
            'some': { hindi: 'कुछ', pronunciation: 'कुछ', romanized: 'kuch' },
            'any': { hindi: 'कोई भी', pronunciation: 'कोई भी', romanized: 'koi bhi' },
            'each': { hindi: 'प्रत्येक', pronunciation: 'प्रत्येक', romanized: 'pratyek' },
            'every': { hindi: 'हर', pronunciation: 'हर', romanized: 'har' },
            'either': { hindi: 'कोई एक', pronunciation: 'कोई एक', romanized: 'koi ek' },
            'neither': { hindi: 'कोई भी नहीं', pronunciation: 'कोई भी नहीं', romanized: 'koi bhi nahin' },
            'both': { hindi: 'दोनों', pronunciation: 'दोनों', romanized: 'donon' },
            'one': { hindi: 'एक', pronunciation: 'एक', romanized: 'ek' },
            'other': { hindi: 'दूसरा', pronunciation: 'दूसरा', romanized: 'doosra' },
            'another': { hindi: 'अन्य', pronunciation: 'अन्य', romanized: 'anya' },
            
            // ==================== COMMON NOUNS ====================
            // People & Relationships
            'person': { hindi: 'व्यक्ति', pronunciation: 'व्यक्ति', romanized: 'vyakti' },
            'people': { hindi: 'लोग', pronunciation: 'लोग', romanized: 'log' },
            'man': { hindi: 'आदमी', pronunciation: 'आदमी', romanized: 'aadmi' },
            'woman': { hindi: 'औरत', pronunciation: 'औरत', romanized: 'aurat' },
            'child': { hindi: 'बच्चा', pronunciation: 'बच्चा', romanized: 'baccha' },
            'children': { hindi: 'बच्चे', pronunciation: 'बच्चे', romanized: 'bacche' },
            'boy': { hindi: 'लड़का', pronunciation: 'लड़का', romanized: 'ladka' },
            'girl': { hindi: 'लड़की', pronunciation: 'लड़की', romanized: 'ladki' },
            'baby': { hindi: 'शिशु', pronunciation: 'शिशु', romanized: 'shishu' },
            'adult': { hindi: 'व्यस्क', pronunciation: 'व्यस्क', romanized: 'vyask' },
            'teenager': { hindi: 'किशोर', pronunciation: 'किशोर', romanized: 'kishor' },
            
            'family': { hindi: 'परिवार', pronunciation: 'परिवार', romanized: 'parivaar' },
            'mother': { hindi: 'माता', pronunciation: 'माता', romanized: 'mata' },
            'mom': { hindi: 'माँ', pronunciation: 'माँ', romanized: 'maa' },
            'father': { hindi: 'पिता', pronunciation: 'पिता', romanized: 'pita' },
            'dad': { hindi: 'पापा', pronunciation: 'पापा', romanized: 'papa' },
            'parent': { hindi: 'माता-पिता', pronunciation: 'माता-पिता', romanized: 'mata-pita' },
            'parents': { hindi: 'माता-पिता', pronunciation: 'माता-पिता', romanized: 'mata-pita' },
            'son': { hindi: 'बेटा', pronunciation: 'बेटा', romanized: 'beta' },
            'daughter': { hindi: 'बेटी', pronunciation: 'बेटी', romanized: 'beti' },
            'brother': { hindi: 'भाई', pronunciation: 'भाई', romanized: 'bhai' },
            'sister': { hindi: 'बहन', pronunciation: 'बहन', romanized: 'bahan' },
            'grandfather': { hindi: 'दादाजी', pronunciation: 'दादाजी', romanized: 'dadaji' },
            'grandmother': { hindi: 'दादीजी', pronunciation: 'दादीजी', romanized: 'dadiji' },
            'uncle': { hindi: 'चाचा', pronunciation: 'चाचा', romanized: 'chacha' },
            'aunt': { hindi: 'चाची', pronunciation: 'चाची', romanized: 'chachi' },
            'cousin': { hindi: 'चचेरा भाई', pronunciation: 'चचेरा भाई', romanized: 'chachera bhai' },
            'husband': { hindi: 'पति', pronunciation: 'पति', romanized: 'pati' },
            'wife': { hindi: 'पत्नी', pronunciation: 'पत्नी', romanized: 'patni' },
            
            'friend': { hindi: 'दोस्त', pronunciation: 'दोस्त', romanized: 'dost' },
            'neighbor': { hindi: 'पड़ोसी', pronunciation: 'पड़ोसी', romanized: 'padosi' },
            'guest': { hindi: 'मेहमान', pronunciation: 'मेहमान', romanized: 'mehman' },
            'stranger': { hindi: 'अजनबी', pronunciation: 'अजनबी', romanized: 'ajanabi' },
            
            // Occupations
            'teacher': { hindi: 'शिक्षक', pronunciation: 'शिक्षक', romanized: 'shikshak' },
            'student': { hindi: 'छात्र', pronunciation: 'छात्र', romanized: 'chhaatra' },
            'doctor': { hindi: 'डॉक्टर', pronunciation: 'डॉक्टर', romanized: 'doctor' },
            'nurse': { hindi: 'नर्स', pronunciation: 'नर्स', romanized: 'nurse' },
            'engineer': { hindi: 'इंजीनियर', pronunciation: 'इंजीनियर', romanized: 'engineer' },
            'lawyer': { hindi: 'वकील', pronunciation: 'वकील', romanized: 'vakeel' },
            'police': { hindi: 'पुलिस', pronunciation: 'पुलिस', romanized: 'police' },
            'driver': { hindi: 'ड्राइवर', pronunciation: 'ड्राइवर', romanized: 'driver' },
            'farmer': { hindi: 'किसान', pronunciation: 'किसान', romanized: 'kisan' },
            'worker': { hindi: 'मजदूर', pronunciation: 'मजदूर', romanized: 'majdoor' },
            'manager': { hindi: 'प्रबंधक', pronunciation: 'प्रबंधक', romanized: 'prabandhak' },
            'boss': { hindi: 'मालिक', pronunciation: 'मालिक', romanized: 'malik' },
            'employee': { hindi: 'कर्मचारी', pronunciation: 'कर्मचारी', romanized: 'karmchari' },
            'customer': { hindi: 'ग्राहक', pronunciation: 'ग्राहक', romanized: 'grahak' },
            'shopkeeper': { hindi: 'दुकानदार', pronunciation: 'दुकानदार', romanized: 'dukandar' },
            
            // Places
            'place': { hindi: 'जगह', pronunciation: 'जगह', romanized: 'jagah' },
            'house': { hindi: 'घर', pronunciation: 'घर', romanized: 'ghar' },
            'home': { hindi: 'घर', pronunciation: 'घर', romanized: 'ghar' },
            'room': { hindi: 'कमरा', pronunciation: 'कमरा', romanized: 'kamra' },
            'kitchen': { hindi: 'रसोई', pronunciation: 'रसोई', romanized: 'rasoi' },
            'bathroom': { hindi: 'स्नानघर', pronunciation: 'स्नानघर', romanized: 'snanghar' },
            'bedroom': { hindi: 'शयनकक्ष', pronunciation: 'शयनकक्ष', romanized: 'shayankaksh' },
            'office': { hindi: 'कार्यालय', pronunciation: 'कार्यालय', romanized: 'karyalay' },
            'school': { hindi: 'स्कूल', pronunciation: 'स्कूल', romanized: 'school' },
            'college': { hindi: 'कॉलेज', pronunciation: 'कॉलेज', romanized: 'college' },
            'university': { hindi: 'विश्वविद्यालय', pronunciation: 'विश्वविद्यालय', romanized: 'vishwavidyalay' },
            'hospital': { hindi: 'अस्पताल', pronunciation: 'अस्पताल', romanized: 'aspatal' },
            'market': { hindi: 'बाज़ार', pronunciation: 'बाज़ार', romanized: 'bazaar' },
            'shop': { hindi: 'दुकान', pronunciation: 'दुकान', romanized: 'dukan' },
            'restaurant': { hindi: 'रेस्टोरेंट', pronunciation: 'रेस्टोरेंट', romanized: 'restaurant' },
            'hotel': { hindi: 'होटल', pronunciation: 'होटल', romanized: 'hotel' },
            'bank': { hindi: 'बैंक', pronunciation: 'बैंक', romanized: 'bank' },
            'park': { hindi: 'पार्क', pronunciation: 'पार्क', romanized: 'park' },
            'garden': { hindi: 'बगीचा', pronunciation: 'बगीचा', romanized: 'bagicha' },
            'street': { hindi: 'सड़क', pronunciation: 'सड़क', romanized: 'sadak' },
            'road': { hindi: 'सड़क', pronunciation: 'सड़क', romanized: 'sadak' },
            'bridge': { hindi: 'पुल', pronunciation: 'पुल', romanized: 'pul' },
            'city': { hindi: 'शहर', pronunciation: 'शहर', romanized: 'shahar' },
            'village': { hindi: 'गाँव', pronunciation: 'गाँव', romanized: 'gaanv' },
            'country': { hindi: 'देश', pronunciation: 'देश', romanized: 'desh' },
            'world': { hindi: 'संसार', pronunciation: 'संसार', romanized: 'sansar' },
            
            // Objects & Things
            'thing': { hindi: 'चीज़', pronunciation: 'चीज़', romanized: 'cheez' },
            'object': { hindi: 'वस्तु', pronunciation: 'वस्तु', romanized: 'vastu' },
            'book': { hindi: 'किताब', pronunciation: 'किताब', romanized: 'kitaab' },
            'pen': { hindi: 'कलम', pronunciation: 'कलम', romanized: 'kalam' },
            'paper': { hindi: 'कागज़', pronunciation: 'कागज़', romanized: 'kagaz' },
            'table': { hindi: 'मेज़', pronunciation: 'मेज़', romanized: 'mez' },
            'chair': { hindi: 'कुर्सी', pronunciation: 'कुर्सी', romanized: 'kursi' },
            'bed': { hindi: 'बिस्तर', pronunciation: 'बिस्तर', romanized: 'bistar' },
            'door': { hindi: 'दरवाज़ा', pronunciation: 'दरवाज़ा', romanized: 'darwaza' },
            'window': { hindi: 'खिड़की', pronunciation: 'खिड़की', romanized: 'khidki' },
            'wall': { hindi: 'दीवार', pronunciation: 'दीवार', romanized: 'deevar' },
            'floor': { hindi: 'फ़र्श', pronunciation: 'फ़र्श', romanized: 'farsh' },
            'roof': { hindi: 'छत', pronunciation: 'छत', romanized: 'chhat' },
            'car': { hindi: 'कार', pronunciation: 'कार', romanized: 'kaar' },
            'bus': { hindi: 'बस', pronunciation: 'बस', romanized: 'bus' },
            'train': { hindi: 'ट्रेन', pronunciation: 'ट्रेन', romanized: 'train' },
            'bicycle': { hindi: 'साइकिल', pronunciation: 'साइकिल', romanized: 'cycle' },
            'phone': { hindi: 'फ़ोन', pronunciation: 'फ़ोन', romanized: 'phone' },
            'computer': { hindi: 'कंप्यूटर', pronunciation: 'कंप्यूटर', romanized: 'computer' },
            'television': { hindi: 'टेलीविज़न', pronunciation: 'टेलीविज़न', romanized: 'television' },
            'radio': { hindi: 'रेडियो', pronunciation: 'रेडियो', romanized: 'radio' },
            'clock': { hindi: 'घड़ी', pronunciation: 'घड़ी', romanized: 'ghadi' },
            'watch': { hindi: 'घड़ी', pronunciation: 'घड़ी', romanized: 'ghadi' },
            'bag': { hindi: 'थैला', pronunciation: 'थैला', romanized: 'thaila' },
            'box': { hindi: 'डिब्बा', pronunciation: 'डिब्बा', romanized: 'dibba' },
            'bottle': { hindi: 'बोतल', pronunciation: 'बोतल', romanized: 'botal' },
            'cup': { hindi: 'कप', pronunciation: 'कप', romanized: 'cup' },
            'glass': { hindi: 'गिलास', pronunciation: 'गिलास', romanized: 'gilas' },
            'plate': { hindi: 'प्लेट', pronunciation: 'प्लेट', romanized: 'plate' },
            'spoon': { hindi: 'चम्मच', pronunciation: 'चम्मच', romanized: 'chammach' },
            'knife': { hindi: 'चाकू', pronunciation: 'चाकू', romanized: 'chaaku' },
            'fork': { hindi: 'कांटा', pronunciation: 'कांटा', romanized: 'kanta' },
            
            // Food & Drinks
            'food': { hindi: 'खाना', pronunciation: 'खाना', romanized: 'khaana' },
            'water': { hindi: 'पानी', pronunciation: 'पानी', romanized: 'paani' },
            'milk': { hindi: 'दूध', pronunciation: 'दूध', romanized: 'doodh' },
            'tea': { hindi: 'चाय', pronunciation: 'चाय', romanized: 'chai' },
            'coffee': { hindi: 'कॉफ़ी', pronunciation: 'कॉफ़ी', romanized: 'coffee' },
            'bread': { hindi: 'रोटी', pronunciation: 'रोटी', romanized: 'roti' },
            'rice': { hindi: 'चावल', pronunciation: 'चावल', romanized: 'chawal' },
            'fruit': { hindi: 'फल', pronunciation: 'फल', romanized: 'phal' },
            'vegetable': { hindi: 'सब्जी', pronunciation: 'सब्जी', romanized: 'sabji' },
            'meat': { hindi: 'मांस', pronunciation: 'मांस', romanized: 'mans' },
            'fish': { hindi: 'मछली', pronunciation: 'मछली', romanized: 'machhli' },
            'egg': { hindi: 'अंडा', pronunciation: 'अंडा', romanized: 'anda' },
            'sugar': { hindi: 'चीनी', pronunciation: 'चीनी', romanized: 'cheeni' },
            'salt': { hindi: 'नमक', pronunciation: 'नमक', romanized: 'namak' },
            'oil': { hindi: 'तेल', pronunciation: 'तेल', romanized: 'tel' },
            
            // Nature & Animals
            'nature': { hindi: 'प्रकृति', pronunciation: 'प्रकृति', romanized: 'prakriti' },
            'animal': { hindi: 'जानवर', pronunciation: 'जानवर', romanized: 'janwar' },
            'cat': { hindi: 'बिल्ली', pronunciation: 'बिल्ली', romanized: 'billi' },
            'dog': { hindi: 'कुत्ता', pronunciation: 'कुत्ता', romanized: 'kutta' },
            'bird': { hindi: 'पक्षी', pronunciation: 'पक्षी', romanized: 'pakshi' },
            'cow': { hindi: 'गाय', pronunciation: 'गाय', romanized: 'gay' },
            'horse': { hindi: 'घोड़ा', pronunciation: 'घोड़ा', romanized: 'ghoda' },
            'elephant': { hindi: 'हाथी', pronunciation: 'हाथी', romanized: 'hathi' },
            'lion': { hindi: 'शेर', pronunciation: 'शेर', romanized: 'sher' },
            'tiger': { hindi: 'बाघ', pronunciation: 'बाघ', romanized: 'bagh' },
            'tree': { hindi: 'पेड़', pronunciation: 'पेड़', romanized: 'ped' },
            'flower': { hindi: 'फूल', pronunciation: 'फूल', romanized: 'phool' },
            'leaf': { hindi: 'पत्ता', pronunciation: 'पत्ता', romanized: 'patta' },
            'grass': { hindi: 'घास', pronunciation: 'घास', romanized: 'ghas' },
            'mountain': { hindi: 'पहाड़', pronunciation: 'पहाड़', romanized: 'pahaad' },
            'river': { hindi: 'नदी', pronunciation: 'नदी', romanized: 'nadi' },
            'sea': { hindi: 'समुद्र', pronunciation: 'समुद्र', romanized: 'samudra' },
            'ocean': { hindi: 'महासागर', pronunciation: 'महासागर', romanized: 'mahasagar' },
            'lake': { hindi: 'झील', pronunciation: 'झील', romanized: 'jheel' },
            'forest': { hindi: 'जंगल', pronunciation: 'जंगल', romanized: 'jangal' },
            'desert': { hindi: 'रेगिस्तान', pronunciation: 'रेगिस्तान', romanized: 'registan' },
            'island': { hindi: 'द्वीप', pronunciation: 'द्वीप', romanized: 'dweep' },
            'beach': { hindi: 'समुद्र तट', pronunciation: 'समुद्र तट', romanized: 'samudra tat' },
            'sky': { hindi: 'आकाश', pronunciation: 'आकाश', romanized: 'aakash' },
            'sun': { hindi: 'सूर्य', pronunciation: 'सूर्य', romanized: 'surya' },
            'moon': { hindi: 'चाँद', pronunciation: 'चाँद', romanized: 'chaand' },
            'star': { hindi: 'तारा', pronunciation: 'तारा', romanized: 'tara' },
            'cloud': { hindi: 'बादल', pronunciation: 'बादल', romanized: 'badal' },
            'rain': { hindi: 'बारिश', pronunciation: 'बारिश', romanized: 'barish' },
            'snow': { hindi: 'बर्फ', pronunciation: 'बर्फ', romanized: 'barf' },
            'wind': { hindi: 'हवा', pronunciation: 'हवा', romanized: 'hawa' },
            'fire': { hindi: 'आग', pronunciation: 'आग', romanized: 'aag' },
            'earth': { hindi: 'पृथ्वी', pronunciation: 'पृथ्वी', romanized: 'prithvi' },
            'stone': { hindi: 'पत्थर', pronunciation: 'पत्थर', romanized: 'patthar' },
            'sand': { hindi: 'रेत', pronunciation: 'रेत', romanized: 'ret' },
            
            // Time & Numbers
            'time': { hindi: 'समय', pronunciation: 'समय', romanized: 'samay' },
            'day': { hindi: 'दिन', pronunciation: 'दिन', romanized: 'din' },
            'night': { hindi: 'रात', pronunciation: 'रात', romanized: 'raat' },
            'morning': { hindi: 'सुबह', pronunciation: 'सुबह', romanized: 'subah' },
            'afternoon': { hindi: 'दोपहर', pronunciation: 'दोपहर', romanized: 'dopahar' },
            'evening': { hindi: 'शाम', pronunciation: 'शाम', romanized: 'shaam' },
            'week': { hindi: 'सप्ताह', pronunciation: 'सप्ताह', romanized: 'saptah' },
            'month': { hindi: 'महीना', pronunciation: 'महीना', romanized: 'mahina' },
            'year': { hindi: 'साल', pronunciation: 'साल', romanized: 'saal' },
            'today': { hindi: 'आज', pronunciation: 'आज', romanized: 'aaj' },
            'yesterday': { hindi: 'कल', pronunciation: 'कल', romanized: 'kal' },
            'tomorrow': { hindi: 'कल', pronunciation: 'कल', romanized: 'kal' },
            'hour': { hindi: 'घंटा', pronunciation: 'घंटा', romanized: 'ghanta' },
            'minute': { hindi: 'मिनट', pronunciation: 'मिनट', romanized: 'minute' },
            'second': { hindi: 'सेकंड', pronunciation: 'सेकंड', romanized: 'second' },
            
            // Colors
            'color': { hindi: 'रंग', pronunciation: 'रंग', romanized: 'rang' },
            'red': { hindi: 'लाल', pronunciation: 'लाल', romanized: 'laal' },
            'blue': { hindi: 'नीला', pronunciation: 'नीला', romanized: 'neela' },
            'green': { hindi: 'हरा', pronunciation: 'हरा', romanized: 'hara' },
            'yellow': { hindi: 'पीला', pronunciation: 'पीला', romanized: 'peela' },
            'white': { hindi: 'सफ़ेद', pronunciation: 'सफ़ेद', romanized: 'safed' },
            'black': { hindi: 'काला', pronunciation: 'काला', romanized: 'kaala' },
            'brown': { hindi: 'भूरा', pronunciation: 'भूरा', romanized: 'bhoora' },
            'pink': { hindi: 'गुलाबी', pronunciation: 'गुलाबी', romanized: 'gulabi' },
            'purple': { hindi: 'बैंगनी', pronunciation: 'बैंगनी', romanized: 'baingani' },
            'orange': { hindi: 'नारंगी', pronunciation: 'नारंगी', romanized: 'narangi' },
            'gray': { hindi: 'स्लेटी', pronunciation: 'स्लेटी', romanized: 'sleti' },
            'grey': { hindi: 'स्लेटी', pronunciation: 'स्लेटी', romanized: 'sleti' },
            
            // Abstract Concepts
            'love': { hindi: 'प्रेम', pronunciation: 'प्रेम', romanized: 'prem' },
            'hate': { hindi: 'नफ़रत', pronunciation: 'नफ़रत', romanized: 'nafrat' },
            'happiness': { hindi: 'खुशी', pronunciation: 'खुशी', romanized: 'khushi' },
            'sadness': { hindi: 'उदासी', pronunciation: 'उदासी', romanized: 'udasi' },
            'anger': { hindi: 'गुस्सा', pronunciation: 'गुस्सा', romanized: 'gussa' },
            'fear': { hindi: 'डर', pronunciation: 'डर', romanized: 'dar' },
            'hope': { hindi: 'आशा', pronunciation: 'आशा', romanized: 'asha' },
            'peace': { hindi: 'शांति', pronunciation: 'शांति', romanized: 'shanti' },
            'war': { hindi: 'युद्ध', pronunciation: 'युद्ध', romanized: 'yuddh' },
            'truth': { hindi: 'सच', pronunciation: 'सच', romanized: 'sach' },
            'lie': { hindi: 'झूठ', pronunciation: 'झूठ', romanized: 'jhooth' },
            'knowledge': { hindi: 'ज्ञान', pronunciation: 'ज्ञान', romanized: 'gyan' },
            'wisdom': { hindi: 'बुद्धि', pronunciation: 'बुद्धि', romanized: 'buddhi' },
            'life': { hindi: 'जीवन', pronunciation: 'जीवन', romanized: 'jeevan' },
            'death': { hindi: 'मृत्यु', pronunciation: 'मृत्यु', romanized: 'mrityu' },
            'birth': { hindi: 'जन्म', pronunciation: 'जन्म', romanized: 'janma' },
            'health': { hindi: 'स्वास्थ्य', pronunciation: 'स्वास्थ्य', romanized: 'swasthya' },
            'disease': { hindi: 'बीमारी', pronunciation: 'बीमारी', romanized: 'bimari' },
            'money': { hindi: 'पैसा', pronunciation: 'पैसा', romanized: 'paisa' },
            'work': { hindi: 'काम', pronunciation: 'काम', romanized: 'kaam' },
            'job': { hindi: 'नौकरी', pronunciation: 'नौकरी', romanized: 'naukri' },
            'business': { hindi: 'व्यापार', pronunciation: 'व्यापार', romanized: 'vyapar' },
            'education': { hindi: 'शिक्षा', pronunciation: 'शिक्षा', romanized: 'shiksha' },
            'government': { hindi: 'सरकार', pronunciation: 'सरकार', romanized: 'sarkar' },
            'law': { hindi: 'कानून', pronunciation: 'कानून', romanized: 'kanoon' },
            'religion': { hindi: 'धर्म', pronunciation: 'धर्म', romanized: 'dharma' },
            'culture': { hindi: 'संस्कृति', pronunciation: 'संस्कृति', romanized: 'sanskriti' },
            'language': { hindi: 'भाषा', pronunciation: 'भाषा', romanized: 'bhasha' },
            'music': { hindi: 'संगीत', pronunciation: 'संगीत', romanized: 'sangeet' },
            'art': { hindi: 'कला', pronunciation: 'कला', romanized: 'kala' },
            'sport': { hindi: 'खेल', pronunciation: 'खेल', romanized: 'khel' },
            'game': { hindi: 'खेल', pronunciation: 'खेल', romanized: 'khel' },
            'story': { hindi: 'कहानी', pronunciation: 'कहानी', romanized: 'kahani' },
            'news': { hindi: 'समाचार', pronunciation: 'समाचार', romanized: 'samachar' },
            'information': { hindi: 'जानकारी', pronunciation: 'जानकारी', romanized: 'jankari' },
            'question': { hindi: 'प्रश्न', pronunciation: 'प्रश्न', romanized: 'prashna' },
            'answer': { hindi: 'उत्तर', pronunciation: 'उत्तर', romanized: 'uttar' },
            'problem': { hindi: 'समस्या', pronunciation: 'समस्या', romanized: 'samasya' },
            'solution': { hindi: 'समाधान', pronunciation: 'समाधान', romanized: 'samadhan' },
            'reason': { hindi: 'कारण', pronunciation: 'कारण', romanized: 'karan' },
            'result': { hindi: 'परिणाम', pronunciation: 'परिणाम', romanized: 'parinam' },
            'way': { hindi: 'तरीका', pronunciation: 'तरीका', romanized: 'tarika' },
            'method': { hindi: 'विधि', pronunciation: 'विधि', romanized: 'vidhi' },
            'idea': { hindi: 'विचार', pronunciation: 'विचार', romanized: 'vichar' },
            'thought': { hindi: 'सोच', pronunciation: 'सोच', romanized: 'soch' },
            'mind': { hindi: 'मन', pronunciation: 'मन', romanized: 'man' },
            'heart': { hindi: 'दिल', pronunciation: 'दिल', romanized: 'dil' },
            'soul': { hindi: 'आत्मा', pronunciation: 'आत्मा', romanized: 'aatma' },
            'body': { hindi: 'शरीर', pronunciation: 'शरीर', romanized: 'sharir' },
            'hand': { hindi: 'हाथ', pronunciation: 'हाथ', romanized: 'haath' },
            'foot': { hindi: 'पैर', pronunciation: 'पैर', romanized: 'pair' },
            'head': { hindi: 'सिर', pronunciation: 'सिर', romanized: 'sir' },
            'eye': { hindi: 'आँख', pronunciation: 'आँख', romanized: 'aankh' },
            'ear': { hindi: 'कान', pronunciation: 'कान', romanized: 'kaan' },
            'nose': { hindi: 'नाक', pronunciation: 'नाक', romanized: 'naak' },
            'mouth': { hindi: 'मुंह', pronunciation: 'मुंह', romanized: 'munh' },
            'face': { hindi: 'चेहरा', pronunciation: 'चेहरा', romanized: 'chehra' },
            
            // Basic words from before
            'hello': { hindi: 'नमस्ते', pronunciation: 'नमस्ते', romanized: 'namaste' },
            'hi': { hindi: 'हाय', pronunciation: 'हाय', romanized: 'haay' },
            'goodbye': { hindi: 'अलविदा', pronunciation: 'अलविदा', romanized: 'alvida' },
            'bye': { hindi: 'बाय', pronunciation: 'बाय', romanized: 'bye' },
            'good': { hindi: 'अच्छा', pronunciation: 'अच्छा', romanized: 'accha' },
            'bad': { hindi: 'बुरा', pronunciation: 'बुरा', romanized: 'bura' },
            'big': { hindi: 'बड़ा', pronunciation: 'बड़ा', romanized: 'bada' },
            'small': { hindi: 'छोटा', pronunciation: 'छोटा', romanized: 'chhota' },
            'beautiful': { hindi: 'सुंदर', pronunciation: 'सुंदर', romanized: 'sundar' },
            'ugly': { hindi: 'बदसूरत', pronunciation: 'बदसूरत', romanized: 'badsurat' },
            'hot': { hindi: 'गर्म', pronunciation: 'गर्म', romanized: 'garam' },
            'cold': { hindi: 'ठंडा', pronunciation: 'ठंडा', romanized: 'thanda' },
            'new': { hindi: 'नया', pronunciation: 'नया', romanized: 'naya' },
            'old': { hindi: 'पुराना', pronunciation: 'पुराना', romanized: 'purana' },
            'young': { hindi: 'जवान', pronunciation: 'जवान', romanized: 'jawan' },
            'fast': { hindi: 'तेज़', pronunciation: 'तेज़', romanized: 'tez' },
            'slow': { hindi: 'धीमा', pronunciation: 'धीमा', romanized: 'dheema' },
            'high': { hindi: 'ऊंचा', pronunciation: 'ऊंचा', romanized: 'ooncha' },
            'low': { hindi: 'नीचा', pronunciation: 'नीचा', romanized: 'neecha' },
            'long': { hindi: 'लंबा', pronunciation: 'लंबा', romanized: 'lamba' },
            'short': { hindi: 'छोटा', pronunciation: 'छोटा', romanized: 'chhota' },
            'wide': { hindi: 'चौड़ा', pronunciation: 'चौड़ा', romanized: 'chauda' },
            'narrow': { hindi: 'संकरा', pronunciation: 'संकरा', romanized: 'sankara' },
            'thick': { hindi: 'मोटा', pronunciation: 'मोटा', romanized: 'mota' },
            'thin': { hindi: 'पतला', pronunciation: 'पतला', romanized: 'patla' },
            'heavy': { hindi: 'भारी', pronunciation: 'भारी', romanized: 'bhari' },
            'light': { hindi: 'हल्का', pronunciation: 'हल्का', romanized: 'halka' },
            'strong': { hindi: 'मज़बूत', pronunciation: 'मज़बूत', romanized: 'mazboot' },
            'weak': { hindi: 'कमज़ोर', pronunciation: 'कमज़ोर', romanized: 'kamzor' },
            'easy': { hindi: 'आसान', pronunciation: 'आसान', romanized: 'aasan' },
            'difficult': { hindi: 'कठिन', pronunciation: 'कठिन', romanized: 'kathin' },
            'hard': { hindi: 'कठिन', pronunciation: 'कठिन', romanized: 'kathin' },
            'soft': { hindi: 'मुलायम', pronunciation: 'मुलायम', romanized: 'mulayam' },
            'clean': { hindi: 'साफ़', pronunciation: 'साफ़', romanized: 'saaf' },
            'dirty': { hindi: 'गंदा', pronunciation: 'गंदा', romanized: 'ganda' },
            'empty': { hindi: 'खाली', pronunciation: 'खाली', romanized: 'khali' },
            'full': { hindi: 'भरा', pronunciation: 'भरा', romanized: 'bhara' },
            'open': { hindi: 'खुला', pronunciation: 'खुला', romanized: 'khula' },
            'close': { hindi: 'बंद', pronunciation: 'बंद', romanized: 'band' },
            'closed': { hindi: 'बंद', pronunciation: 'बंद', romanized: 'band' },
            'right': { hindi: 'सही/दाएं', pronunciation: 'सही/दाएं', romanized: 'sahi/dayen' },
            'wrong': { hindi: 'गलत', pronunciation: 'गलत', romanized: 'galat' },
            'left': { hindi: 'बाएं', pronunciation: 'बाएं', romanized: 'bayen' },
            'up': { hindi: 'ऊपर', pronunciation: 'ऊपर', romanized: 'upar' },
            'down': { hindi: 'नीचे', pronunciation: 'नीचे', romanized: 'neeche' },
            'inside': { hindi: 'अंदर', pronunciation: 'अंदर', romanized: 'andar' },
            'outside': { hindi: 'बाहर', pronunciation: 'बाहर', romanized: 'bahar' },
            'front': { hindi: 'आगे', pronunciation: 'आगे', romanized: 'aage' },
            'back': { hindi: 'पीछे', pronunciation: 'पीछे', romanized: 'peeche' },
            'near': { hindi: 'पास', pronunciation: 'पास', romanized: 'paas' },
            'far': { hindi: 'दूर', pronunciation: 'दूर', romanized: 'door' },
            'here': { hindi: 'यहाँ', pronunciation: 'यहाँ', romanized: 'yahan' },
            'there': { hindi: 'वहाँ', pronunciation: 'वहाँ', romanized: 'vahan' },
            'now': { hindi: 'अब', pronunciation: 'अब', romanized: 'ab' },
            'then': { hindi: 'तब', pronunciation: 'तब', romanized: 'tab' },
            'always': { hindi: 'हमेशा', pronunciation: 'हमेशा', romanized: 'hamesha' },
            'never': { hindi: 'कभी नहीं', pronunciation: 'कभी नहीं', romanized: 'kabhi nahin' },
            'sometimes': { hindi: 'कभी कभी', pronunciation: 'कभी कभी', romanized: 'kabhi kabhi' },
            'often': { hindi: 'अक्सर', pronunciation: 'अक्सर', romanized: 'aksar' },
            'usually': { hindi: 'आमतौर पर', pronunciation: 'आमतौर पर', romanized: 'aamtaur par' },
            'maybe': { hindi: 'शायद', pronunciation: 'शायद', romanized: 'shayad' },
            'perhaps': { hindi: 'शायद', pronunciation: 'शायद', romanized: 'shaya
        };
    }

    async tryApiTranslation(word, apiIndex = 0) {
        if (apiIndex >= this.apiEndpoints.length) {
            return null;
        }

        const api = this.apiEndpoints[apiIndex];
        console.log(`Trying ${api.name} API for word: ${word}`);

        try {
            let response;
            
            if (api.method === 'GET') {
                response = await fetch(api.formatUrl(word), {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'User-Agent': 'English-Hindi-Translator/2.1'
                    }
                });
            } else {
                response = await fetch(api.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'User-Agent': 'English-Hindi-Translator/2.1'
                    },
                    body: api.body(word)
                });
            }

            if (!response.ok) {
                throw new Error(`${api.name} HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const translatedText = api.parseResponse(data);

            if (translatedText && translatedText.trim()) {
                console.log(`✅ Success with ${api.name}:`, translatedText);
                return {
                    hindi: translatedText,
                    pronunciation: translatedText,
                    romanized: this.generateRomanized(translatedText),
                    source: api.name
                };
            } else {
                throw new Error(`${api.name} returned empty translation`);
            }

        } catch (error) {
            console.warn(`❌ ${api.name} failed:`, error.message);
            // Try next API
            return await this.tryApiTranslation(word, apiIndex + 1);
        }
    }

    async getOnlineTranslation(word) {
        // Check rate limits for MyMemory
        if (this.requestCount >= this.maxDailyRequests) {
            console.log('MyMemory rate limit reached, skipping to other APIs');
            return await this.tryApiTranslation(word, 1); // Skip MyMemory
        }

        const translation = await this.tryApiTranslation(word, 0);
        
        if (translation && translation.source === 'MyMemory') {
            this.requestCount++;
            this.saveRequestCount();
        }

        return translation;
    }

    generateRomanized(hindiText) {
        const devanagariToRoman = {
            // Vowels
            'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ii', 'उ': 'u', 'ऊ': 'uu',
            'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
            
            // Consonants
            'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
            'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
            'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
            'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
            'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
            'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va', 'श': 'sha',
            'ष': 'sha', 'स': 'sa', 'ह': 'ha', 'क्ष': 'ksha', 'त्र': 'tra',
            'ज्ञ': 'gya',
            
            // Vowel signs
            'ा': 'aa', 'ि': 'i', 'ी': 'ii', 'ु': 'u', 'ू': 'uu',
            'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
            '्': '', 'ं': 'n', 'ः': 'h', 'ँ': 'n',
            
            // Numbers
            '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
            '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
        };

        let romanized = '';
        for (let i = 0; i < hindiText.length; i++) {
            const char = hindiText[i];
            const nextChar = hindiText[i + 1] || '';
            
            const compound = char + nextChar;
            if (devanagariToRoman[compound]) {
                romanized += devanagariToRoman[compound];
                i++;
            } else if (devanagariToRoman[char]) {
                romanized += devanagariToRoman[char];
            } else {
                romanized += char;
            }
        }
        
        return romanized || 'pronunciation guide';
    }

    async translateWord() {
        const word = this.englishInput.value.trim().toLowerCase();
        
        if (!word) {
            this.showError('Please enter a word to translate');
            this.animateErrorShake();
            return;
        }

        this.showLoading();

        try {
            let translation;
            
            // First try offline translations
            if (this.translations[word]) {
                translation = this.translations[word];
                translation.source = 'Offline';
                console.log('✅ Using offline translation for:', word);
                // Add slight delay to show loading animation
                await new Promise(resolve => setTimeout(resolve, 500));
            } else {
                console.log('🌐 Fetching online translation for:', word);
                translation = await this.getOnlineTranslation(word);
            }

            if (translation) {
                this.displayTranslation(word, translation);
                this.saveToHistory(word, translation);
            } else {
                this.showError(`Unable to translate "${word}". This could be due to:\n• Network connectivity issues\n• API rate limits\n• Word not found in translation databases\n\nTry again in a moment or try a different word.`);
                this.animateErrorShake();
            }
        } catch (error) {
            console.error('Translation error:', error);
            this.showError('Translation failed due to a technical error. Please try again.');
            this.animateErrorShake();
        }
    }

    displayTranslation(englishWord, translation) {
        this.hideLoadingAndError();
        
        this.englishWord.textContent = englishWord.charAt(0).toUpperCase() + englishWord.slice(1);
        this.hindiTranslation.textContent = translation.hindi;
        this.hindiPronunciation.textContent = translation.pronunciation;
        this.romanizedPronunciation.textContent = translation.romanized;
        
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Show success notification with source
        if (translation.source) {
            this.showNotification(`Translation successful via ${translation.source}!`, 'success');
        }
        
        this.animateResultsAppear();
    }

    animateResultsAppear() {
        this.resultsSection.style.animation = 'none';
        this.resultsSection.style.opacity = '0';
        this.resultsSection.style.transform = 'translateY(30px) scale(0.95)';
        
        setTimeout(() => {
            this.resultsSection.style.animation = 'fadeInUp 0.6s ease-out forwards';
            this.resultsSection.style.opacity = '1';
            this.resultsSection.style.transform = 'translateY(0) scale(1)';
        }, 50);

        const cards = this.resultsSection.querySelectorAll('.result-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.4s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });
    }

    animateErrorShake() {
        this.errorMessage.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            this.errorMessage.style.animation = '';
        }, 500);
    }

    speakHindi() {
        const hindiText = this.hindiTranslation.textContent;
        
        if (!hindiText) {
            this.showNotification('No Hindi text to speak', 'warning');
            return;
        }
        
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(hindiText);
            utterance.lang = 'hi-IN';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            utterance.onstart = () => {
                this.speakBtn.textContent = '🔊 Speaking...';
                this.speakBtn.disabled = true;
                this.speakBtn.style.background = 'var(--gradient-button)';
            };
            
            utterance.onend = () => {
                this.speakBtn.textContent = '🔊 Listen to Pronunciation';
                this.speakBtn.disabled = false;
                this.speakBtn.style.background = 'var(--gradient-success)';
            };
            
            utterance.onerror = () => {
                this.speakBtn.textContent = '🔊 Listen to Pronunciation';
                this.speakBtn.disabled = false;
                this.speakBtn.style.background = 'var(--gradient-success)';
                this.showNotification('Speech synthesis failed. Please try again.', 'error');
            };
            
            speechSynthesis.speak(utterance);
        } else {
            this.showNotification('Speech synthesis not supported in your browser', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        switch(type) {
            case 'success':
                notification.style.background = 'var(--gradient-success)';
                break;
            case 'error':
                notification.style.background = 'var(--gradient-error)';
                break;
            case 'warning':
                notification.style.background = 'linear-gradient(45deg, #f39c12, #e67e22)';
                break;
            default:
                notification.style.background = 'var(--gradient-button)';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    saveToHistory(englishWord, translation) {
        let history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
        
        history = history.filter(item => item.english.toLowerCase() !== englishWord.toLowerCase());
        
        history.unshift({
            english: englishWord,
            hindi: translation.hindi,
            romanized: translation.romanized,
            source: translation.source || 'Unknown',
            timestamp: new Date().toISOString()
        });
        
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        localStorage.setItem('translationHistory', JSON.stringify(history));
        this.loadHistory();
    }

    loadHistory() {
        const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
        
        if (history.length === 0) {
            this.historyList.innerHTML = '<p class="no-history">No translations yet. Start translating!</p>';
            this.clearHistoryBtn.style.display = 'none';
            return;
        }
        
        this.historyList.innerHTML = history.map((item, index) => `
            <div class="history-item" data-word="${item.english}" style="animation-delay: ${index * 50}ms">
                <div class="history-item-english">${item.english.charAt(0).toUpperCase() + item.english.slice(1)}
                    <span class="history-source">(${item.source || 'N/A'})</span>
                </div>
                <div class="history-item-hindi">${item.hindi} (${item.romanized})</div>
            </div>
        `).join('');
        
        this.clearHistoryBtn.style.display = 'block';
        
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const word = item.getAttribute('data-word');
                this.englishInput.value = word;
                this.englishInput.focus();
                this.animateHistoryItemClick(item);
                setTimeout(() => this.translateWord(), 200);
            });
        });
    }

    animateHistoryItemClick(item) {
        item.style.transform = 'scale(0.98)';
        item.style.filter = 'brightness(1.1)';
        setTimeout(() => {
            item.style.transform = '';
            item.style.filter = '';
        }, 150);
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all translation history?')) {
            localStorage.removeItem('translationHistory');
            this.loadHistory();
            
            const originalText = this.clearHistoryBtn.textContent;
            this.clearHistoryBtn.textContent = '✓ History Cleared!';
            this.clearHistoryBtn.style.background = 'var(--gradient-success)';
            
            setTimeout(() => {
                this.clearHistoryBtn.textContent = originalText;
                this.clearHistoryBtn.style.background = 'var(--gradient-error)';
            }, 2000);
            
            this.showNotification('Translation history cleared successfully!', 'success');
        }
    }

    loadRequestCount() {
        const today = new Date().toDateString();
        const stored = JSON.parse(localStorage.getItem('requestCount') || '{}');
        if (stored.date === today) {
            return stored.count;
        }
        return 0;
    }

    saveRequestCount() {
        const today = new Date().toDateString();
        localStorage.setItem('requestCount', JSON.stringify({
            date: today,
            count: this.requestCount
        }));
    }

    showLoading() {
        this.hideAll();
        this.loading.style.display = 'block';
        
        const spinner = this.loading.querySelector('.spinner');
        spinner.style.animation = 'spin 1s linear infinite, pulse 2s ease-in-out infinite';
    }

    showError(message) {
        this.hideAll();
        this.errorMessage.querySelector('p').innerHTML = message.replace(/\n/g, '<br>');
        this.errorMessage.style.display = 'block';
    }

    hideLoadingAndError() {
        this.loading.style.display = 'none';
        this.errorMessage.style.display = 'none';
    }

    hideAll() {
        this.resultsSection.style.display = 'none';
        this.loading.style.display = 'none';
        this.errorMessage.style.display = 'none';
    }

    initializeRippleEffect() {
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
}

// Initialize the translator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const translator = new EnglishToHindiTranslator();
    
    console.log('🌐 English to Hindi Translator v2.1 Fixed - Live since: 2025-06-15 22:31:25 UTC');
    console.log('✨ Features: Enhanced API fallback, 45+ offline words, dark mode');
    console.log('🔧 APIs: MyMemory → LibreTranslate → ArgoTranslate (fallback chain)');
    console.log('🌙 Theme: Auto-switching dark/light mode support');
    console.log('📱 Responsive design with enhanced error handling');
    console.log('⌨️ Keyboard shortcuts: Ctrl+D (theme toggle), Escape (clear)');
    
    // Service worker registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(console.log);
    }
    
    // Performance monitoring
    if (window.performance) {
        window.addEventListener('load', () => {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
            console.log(`🚀 App loaded in ${loadTime}ms`);
        });
    }
});

// Global error handlers
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
