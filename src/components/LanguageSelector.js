import React from 'react';

const LANGUAGES = [
    { id: 'English', label: 'English' },
    { id: 'Русский', label: 'Русский' },
    { id: 'O\'zbek', label: 'O\'zbek' }
];

export const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
    return (
        <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Select Language / Выберите язык / Tilni tanlang</label>
            <div className="flex gap-4">
                {LANGUAGES.map(({ id, label }) => (
                    <label key={id} className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="language"
                            value={id}
                            checked={selectedLanguage === id}
                            onChange={(e) => onLanguageChange(e.target.value)}
                            className="form-radio text-blue-500"
                        />
                        <span>{label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}; 