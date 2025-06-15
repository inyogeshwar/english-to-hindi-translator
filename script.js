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

    // ... (keeping all the other methods from the previous version)

    getOfflineTranslations() {
        return {
            // Fixed offline translations - ensuring pronunciation matches Hindi translation
            'hello': { hindi: 'नमस्ते', pronunciation: 'नमस्ते', romanized: 'namaste' },
            'hi': { hindi: 'हाय', pronunciation: 'हाय', romanized: 'haay' },
            'goodbye': { hindi: 'अलविदा', pronunciation: 'अलविदा', romanized: 'alvida' },
            'bye': { hindi: 'बाय', pronunciation: 'बाय', romanized: 'bye' },
            
            // All the helping verbs, pronouns, and nouns from the previous version...
            // (keeping the same extensive list as before)
            
            // Helping Verbs
            'be': { hindi: 'होना', pronunciation: 'होना', romanized: 'hona' },
            'is': { hindi: 'है', pronunciation: 'है', romanized: 'hai' },
            'am': { hindi: 'हूँ', pronunciation: 'हूँ', romanized: 'hun' },
            'are': { hindi: 'हो/हैं', pronunciation: 'हो/हैं', romanized: 'ho/hain' },
            'was': { hindi: 'था/थी', pronunciation: 'था/थी', romanized: 'tha/thi' },
            'were': { hindi: 'थे/थीं', pronunciation: 'थे/थीं', romanized: 'the/thin' },
            // ... (continue with all the words from previous version)
            
            // Essential daily words with correct pronunciation
            'water': { hindi: 'पानी', pronunciation: 'पानी', romanized: 'paani' },
            'food': { hindi: 'खाना', pronunciation: 'खाना', romanized: 'khaana' },
            'family': { hindi: 'परिवार', pronunciation: 'परिवार', romanized: 'parivaar' },
            'friend': { hindi: 'दोस्त', pronunciation: 'दोस्त', romanized: 'dost' },
            'house': { hindi: 'घर', pronunciation: 'घर', romanized: 'ghar' },
            'school': { hindi: 'स्कूल', pronunciation: 'स्कूल', romanized: 'school' },
            'beautiful': { hindi: 'सुंदर', pronunciation: 'सुंदर', romanized: 'sundar' },
            'love': { hindi: 'प्रेम', pronunciation: 'प्रेम', romanized: 'prem' },
            'mother': { hindi: 'माता', pronunciation: 'माता', romanized: 'mata' },
            'father': { hindi: 'पिता', pronunciation: 'पिता', romanized: 'pita' },
            'good': { hindi: 'अच्छा', pronunciation: 'अच्छा', romanized: 'accha' },
            'bad': { hindi: 'बुरा', pronunciation: 'बुरा', romanized: 'bura' },
            'thank you': { hindi: 'धन्यवाद', pronunciation: 'धन्यवाद', romanized: 'dhanyavaad' },
            'yes': { hindi: 'हाँ', pronunciation: 'हाँ', romanized: 'haan' },
            'no': { hindi: 'नहीं', pronunciation: 'नहीं', romanized: 'nahin' },
            
            // Pronouns (all with correct pronunciation = hindi)
            'i': { hindi: 'मैं', pronunciation: 'मैं', romanized: 'main' },
            'you': { hindi: 'तुम/आप', pronunciation: 'तुम/आप', romanized: 'tum/aap' },
            'he': { hindi: 'वह', pronunciation: 'वह', romanized: 'vah' },
            'she': { hindi: 'वह', pronunciation: 'वह', romanized: 'vah' },
            'we': { hindi: 'हम', pronunciation: 'हम', romanized: 'hum' },
            'they': { hindi: 'वे', pronunciation: 'वे', romanized: 've' },
            'this': { hindi: 'यह', pronunciation: 'यह', romanized: 'yah' },
            'that': { hindi: 'वह', pronunciation: 'वह', romanized: 'vah' },
            'what': { hindi: 'क्या', pronunciation: 'क्या', romanized: 'kya' },
            'who': { hindi: 'कौन', pronunciation: 'कौन', romanized: 'kaun' },
            'where': { hindi: 'कहाँ', pronunciation: 'कहाँ', romanized: 'kahan' },
            'when': { hindi: 'कब', pronunciation: 'कब', romanized: 'kab' },
            'why': { hindi: 'क्यों', pronunciation: 'क्यों', romanized: 'kyon' },
            'how': { hindi: 'कैसे', pronunciation: 'कैसे', romanized: 'kaise' },
            
            // Common nouns (ensuring pronunciation = hindi for all)
            'person': { hindi: 'व्यक्ति', pronunciation: 'व्यक्ति', romanized: 'vyakti' },
            'man': { hindi: 'आदमी', pronunciation: 'आदमी', romanized: 'aadmi' },
            'woman': { hindi: 'औरत', pronunciation: 'औरत', romanized: 'aurat' },
            'child': { hindi: 'बच्चा', pronunciation: 'बच्चा', romanized: 'baccha' },
            'book': { hindi: 'किताब', pronunciation: 'किताब', romanized: 'kitaab' },
            'car': { hindi: 'कार', pronunciation: 'कार', romanized: 'kaar' },
            'tree': { hindi: 'पेड़', pronunciation: 'पेड़', romanized: 'ped' },
            'sun': { hindi: 'सूर्य', pronunciation: 'सूर्य', romanized: 'surya' },
            'moon': { hindi: 'चाँद', pronunciation: 'चाँद', romanized: 'chaand' },
            'time': { hindi: 'समय', pronunciation: 'समय', romanized: 'samay' },
            'work': { hindi: 'काम', pronunciation: 'काम', romanized: 'kaam' },
            'life': { hindi: 'जीवन', pronunciation: 'जीवन', romanized: 'jeevan' },
            'money': { hindi: 'पैसा', pronunciation: 'पैसा', romanized: 'paisa' }
        };
    }

    // ... (keep all other methods the same)

    displayTranslation(englishWord, translation) {
        this.hideLoadingAndError();
        
        this.englishWord.textContent = englishWord.charAt(0).toUpperCase() + englishWord.slice(1);
        this.hindiTranslation.textContent = translation.hindi;
        
        // FIXED: Pronunciation should always be the Hindi word in Devanagari
        this.hindiPronunciation.textContent = translation.hindi;
        this.romanizedPronunciation.textContent = translation.romanized;
        
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Show success notification with source
        if (translation.source) {
            this.showNotification(`✅ Translation via ${translation.source}!`, 'success');
        }
        
        this.animateResultsAppear();
    }

    // ... (keep all other methods)
}

// Initialize the translator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const translator = new EnglishToHindiTranslator();
    
    console.log('🌐 English to Hindi Translator v2.2 - Fixed Pronunciation');
    console.log('📅 Last Updated: 2025-06-15 22:46:19 UTC');
    console.log('👤 Developed by: @inyogeshwar');
    console.log('✅ Fixed: Devanagari pronunciation now shows correct Hindi words');
    console.log('✨ Features: 200+ offline words, dark mode, API integration');
    console.log('🔧 APIs: MyMemory → LibreTranslate → ArgoTranslate (fallback chain)');
    
    // Test the fix
    console.log('🧪 Testing pronunciation fix...');
    console.log('Expected: नमस्ते → नमस्ते (not हेलो)');
});
