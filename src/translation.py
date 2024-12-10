"""
Translation module for the RAG PDF Chatbot (Currently Disabled)
"""

class Translator:
    def __init__(self):
        self.translation_disabled = True
        print("NOTE: Translation service is temporarily disabled due to API key issues")
    
    def translate_to_english(self, text: str) -> str:
        """Currently disabled - returns original text"""
        return text
    
    def translate_to_target(self, text: str, target_language: str) -> str:
        """Currently disabled - returns original text"""
        return text
    
    def detect_language(self, text: str) -> str:
        """Currently disabled - returns 'en' as default"""
        return "en" 