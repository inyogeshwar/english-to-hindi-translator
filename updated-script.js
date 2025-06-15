class EnglishToHindiTranslator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadHistory();
        this.translations = this.getOfflineTranslations();
        this.apiEndpoint = 'https://api.mymemory.translated.net/get'; // Free API
    }

    // ... (previous methods remain the same)

    async getOnlineTranslation(word) {
        try {
            // Using MyMemory API (free, no API key required)
            const response = await fetch(
                `${this.apiEndpoint}?q=${encodeURIComponent(word)}&langpair=en|hi`
            );
            
            if (!response.ok) {
                throw new Error('Translation request failed');
            }
            
            const data = await response.json();
            
            if (data.responseStatus === 200 && data.responseData) {
                const hindiText = data.responseData.translatedText;
                
                return {
                    hindi: hindiText,
                    pronunciation: hindiText, // Same as Hindi text for Devanagari
                    romanized: this.convertToRomanized(hindiText) || this.generateRomanized(hindiText)
                };
            }
            
            return null;
        } catch (error) {
            console.error('Online translation error:', error);
            return null;
        }
    }

    // Alternative API method using LibreTranslate
    async getLibreTranslation(word) {
        try {
            const response = await fetch('https://libretranslate.de/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: word,
                    source: 'en',
                    target: 'hi',
                    format: 'text'
                })
            });
            
            if (!response.ok) {
                throw new Error('LibreTranslate request failed');
            }
            
            const data = await response.json();
            
            if (data.translatedText) {
                return {
                    hindi: data.translatedText,
                    pronunciation: data.translatedText,
                    romanized: this.generateRomanized(data.translatedText)
                };
            }
            
            return null;
        } catch (error) {
            console.error('LibreTranslate error:', error);
            return null;
        }
    }

    generateRomanized(hindiText) {
        // Enhanced romanization mapping
        const devanagariToRoman = {
            'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ii', 'उ': 'u', 'ऊ': 'uu',
            'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
            'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
            'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
            'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
            'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
            'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
            'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va',
            'श': 'sha', 'ष': 'sha', 'स': 'sa', 'ह': 'ha',
            'ा': 'aa', 'ि': 'i', 'ी': 'ii', 'ु': 'u', 'ू': 'uu',
            'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', '्': ''
        };

        let romanized = '';
        for (let char of hindiText) {
            romanized += devanagariToRoman[char] || char;
        }
        
        return romanized || 'pronunciation guide';
    }

    async translateWord() {
        const word = this.englishInput.value.trim().toLowerCase();
        
        if (!word) {
            this.showError('Please enter a word to translate');
            return;
        }

        this.showLoading();

        try {
            let translation;
            
            // First try offline translations
            if (this.translations[word]) {
                translation = this.translations[word];
            } else {
                // Try online translation APIs in order of preference
                translation = await this.getOnlineTranslation(word);
                
                if (!translation) {
                    translation = await this.getLibreTranslation(word);
                }
            }

            if (translation) {
                this.displayTranslation(word, translation);
                this.saveToHistory(word, translation);
            } else {
                this.showError('Translation not found. Please check your internet connection and try again.');
            }
        } catch (error) {
            console.error('Translation error:', error);
            this.showError('Translation failed. Please try again.');
        }
    }

    // ... (rest of the methods remain the same)
}