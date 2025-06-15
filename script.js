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
            'hello': { hindi: 'नमस्ते', pronunciation: 'नमस्ते', romanized: 'namaste' },
            'hi': { hindi: 'हाय', pronunciation: 'हाय', romanized: 'haay' },
            'water': { hindi: 'पानी', pronunciation: 'पानी', romanized: 'paani' },
            'food': { hindi: 'खाना', pronunciation: 'खाना', romanized: 'khaana' },
            'eat': { hindi: 'खाना', pronunciation: 'खाना', romanized: 'khaana' },
            'family': { hindi: 'परिवार', pronunciation: 'परिवार', romanized: 'parivaar' },
            'friend': { hindi: 'दोस्त', pronunciation: 'दोस्त', romanized: 'dost' },
            'house': { hindi: 'घर', pronunciation: 'घर', romanized: 'ghar' },
            'home': { hindi: 'घर', pronunciation: 'घर', romanized: 'ghar' },
            'school': { hindi: 'स्कूल', pronunciation: 'स्कूल', romanized: 'school' },
            'beautiful': { hindi: 'सुंदर', pronunciation: 'सुंदर', romanized: 'sundar' },
            'love': { hindi: 'प्रेम', pronunciation: 'प्रेम', romanized: 'prem' },
            'book': { hindi: 'किताब', pronunciation: 'किताब', romanized: 'kitaab' },
            'car': { hindi: 'कार', pronunciation: 'कार', romanized: 'kaar' },
            'tree': { hindi: 'पेड़', pronunciation: 'पेड़', romanized: 'ped' },
            'sun': { hindi: 'सूर्य', pronunciation: 'सूर्य', romanized: 'surya' },
            'moon': { hindi: 'चाँद', pronunciation: 'चाँद', romanized: 'chaand' },
            'flower': { hindi: 'फूल', pronunciation: 'फूल', romanized: 'phool' },
            'mother': { hindi: 'माता', pronunciation: 'माता', romanized: 'mata' },
            'mom': { hindi: 'माँ', pronunciation: 'माँ', romanized: 'maa' },
            'father': { hindi: 'पिता', pronunciation: 'पिता', romanized: 'pita' },
            'dad': { hindi: 'पापा', pronunciation: 'पापा', romanized: 'papa' },
            'good': { hindi: 'अच्छा', pronunciation: 'अच्छा', romanized: 'accha' },
            'bad': { hindi: 'बुरा', pronunciation: 'बुरा', romanized: 'bura' },
            'thank you': { hindi: 'धन्यवाद', pronunciation: 'धन्यवाद', romanized: 'dhanyavaad' },
            'thanks': { hindi: 'धन्यवाद', pronunciation: 'धन्यवाद', romanized: 'dhanyavaad' },
            'yes': { hindi: 'हाँ', pronunciation: 'हाँ', romanized: 'haan' },
            'no': { hindi: 'नहीं', pronunciation: 'नहीं', romanized: 'nahin' },
            'please': { hindi: 'कृपया', pronunciation: 'कृपया', romanized: 'kripaya' },
            'sorry': { hindi: 'माफ़ करें', pronunciation: 'माफ़ करें', romanized: 'maaf karen' },
            'help': { hindi: 'मदद', pronunciation: 'मदद', romanized: 'madad' },
            'money': { hindi: 'पैसा', pronunciation: 'पैसा', romanized: 'paisa' },
            'time': { hindi: 'समय', pronunciation: 'समय', romanized: 'samay' },
            'work': { hindi: 'काम', pronunciation: 'काम', romanized: 'kaam' },
            'life': { hindi: 'जीवन', pronunciation: 'जीवन', romanized: 'jeevan' },
            'night': { hindi: 'रात', pronunciation: 'रात', romanized: 'raat' },
            'day': { hindi: 'दिन', pronunciation: 'दिन', romanized: 'din' },
            'light': { hindi: 'प्रकाश', pronunciation: 'प्रकाश', romanized: 'prakash' },
            'dark': { hindi: 'अँधेरा', pronunciation: 'अँधेरा', romanized: 'andhera' },
            'person': { hindi: 'व्यक्ति', pronunciation: 'व्यक्ति', romanized: 'vyakti' },
            'man': { hindi: 'आदमी', pronunciation: 'आदमी', romanized: 'aadmi' },
            'woman': { hindi: 'औरत', pronunciation: 'औरत', romanized: 'aurat' },
            'child': { hindi: 'बच्चा', pronunciation: 'बच्चा', romanized: 'baccha' },
            'boy': { hindi: 'लड़का', pronunciation: 'लड़का', romanized: 'ladka' },
            'girl': { hindi: 'लड़की', pronunciation: 'लड़की', romanized: 'ladki' },
            'teacher': { hindi: 'शिक्षक', pronunciation: 'शिक्षक', romanized: 'shikshak' },
            'student': { hindi: 'छात्र', pronunciation: 'छात्र', romanized: 'chhaatra' },
            'doctor': { hindi: 'डॉक्टर', pronunciation: 'डॉक्टर', romanized: 'doctor' },
            'cat': { hindi: 'बिल्ली', pronunciation: 'बिल्ली', romanized: 'billi' },
            'dog': { hindi: 'कुत्ता', pronunciation: 'कुत्ता', romanized: 'kutta' },
            'bird': { hindi: 'पक्षी', pronunciation: 'पक्षी', romanized: 'pakshi' },
            'fish': { hindi: 'मछली', pronunciation: 'मछली', romanized: 'machhli' },
            'red': { hindi: 'लाल', pronunciation: 'लाल', romanized: 'laal' },
            'blue': { hindi: 'नीला', pronunciation: 'नीला', romanized: 'neela' },
            'green': { hindi: 'हरा', pronunciation: 'हरा', romanized: 'hara' },
            'white': { hindi: 'सफ़ेद', pronunciation: 'सफ़ेद', romanized: 'safed' },
            'black': { hindi: 'काला', pronunciation: 'काला', romanized: 'kaala' },
            'yellow': { hindi: 'पीला', pronunciation: 'पीला', romanized: 'peela' }
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
